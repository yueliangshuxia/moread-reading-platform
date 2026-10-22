<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { booksApi } from "../api/books";
import { shelfApi } from "../api/shelf";
import { reviewsApi } from "../api/reviews";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import BookCover from "../components/BookCover.vue";
import BookCard from "../components/BookCard.vue";
import StarRating from "../components/StarRating.vue";
import EmptyState from "../components/EmptyState.vue";
import Icon from "../components/Icon.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const book = ref(null);
const reviews = ref([]);
const similar = ref([]);
const factors = ref(null);
const shelfStatus = ref("");
const shelfMenuOpen = ref(false);
const activeTab = ref("intro");
const reviewRating = ref(5);
const reviewText = ref("");
const loading = ref(true);

const bookId = computed(() => route.params.id);
const factorValues = computed(() => {
  if (factors.value) {
    return [factors.value.content, factors.value.cf, factors.value.popularity, factors.value.freshness];
  }
  if (!book.value) return [0, 0, 0, 0];
  const s = book.value.scores || {};
  return [s.content, s.cf, s.popularity, s.freshness].map((v) => Math.round(Number(v || 0) * 100));
});
const factorNames = ["内容相似", "协同信号", "站内热度", "新鲜度"];
const factorReason = computed(() => factors.value?.reason || book.value?.reason || "根据你的阅读记录生成");
const shelfLabel = computed(() => ({
  "": "加入书架",
  WANT: "想读",
  READING: "在读",
  FINISHED: "读完",
  PAUSED: "搁置"
}[shelfStatus.value] || "加入书架"));

async function load() {
  loading.value = true;
  try {
    const [detail, reviewList, similarList] = await Promise.all([
      booksApi.detail(bookId.value),
      booksApi.reviews(bookId.value),
      booksApi.similar(bookId.value)
    ]);
    book.value = detail;
    reviews.value = reviewList || [];
    similar.value = similarList || [];
    factors.value = null;
    shelfStatus.value = "";
    if (auth.isLoggedIn) {
      try {
        factors.value = await booksApi.factors(bookId.value);
      } catch (e) { /* 推荐因子失败不影响阅读 */ }
      try {
        const item = await shelfApi.one(bookId.value);
        shelfStatus.value = item.status;
      } catch (e) { shelfStatus.value = ""; }
    }
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    loading.value = false;
  }
}

function requireLogin() {
  if (auth.isLoggedIn) return true;
  router.push({ name: "login", query: { redirect: route.fullPath } });
  return false;
}

function startReading() {
  if (!requireLogin()) return;
  router.push(`/reader/${bookId.value}`);
}

async function setShelf(status) {
  if (!requireLogin()) return;
  try {
    if (status === "remove") {
      await shelfApi.remove(bookId.value);
      shelfStatus.value = "";
      ui.notify("已移出书架", "bookmark-simple");
    } else {
      await shelfApi.set(bookId.value, status);
      shelfStatus.value = status;
      const labels = { WANT: "想读", READING: "在读", FINISHED: "读完", PAUSED: "搁置" };
      ui.notify(`已标记为「${labels[status]}」`, "bookmark-simple");
    }
    shelfMenuOpen.value = false;
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function openReviewTab() {
  activeTab.value = "reviews";
}

async function submitReview() {
  if (!requireLogin()) return;
  if (reviewText.value.trim().length < 5) {
    ui.notify("再多写几个字吧", "info");
    return;
  }
  try {
    await booksApi.addReview(bookId.value, {
      rating: reviewRating.value,
      content: reviewText.value.trim()
    });
    reviewText.value = "";
    ui.notify("书评已提交，等待管理员审核", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function likeReview(review) {
  if (!requireLogin()) return;
  try {
    const result = await reviewsApi.like(review.id);
    review.likes = result.likes;
    review.liked = !review.liked;
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function readChapter(orderNo) {
  if (!requireLogin()) return;
  router.push({ path: `/reader/${bookId.value}`, query: { chapter: orderNo } });
}

function closeShelfMenu(event) {
  if (!event.target.closest(".shelf-menu")) shelfMenuOpen.value = false;
}

onMounted(() => {
  load();
  document.addEventListener("click", closeShelfMenu);
});
onBeforeUnmount(() => document.removeEventListener("click", closeShelfMenu));
watch(bookId, load);
</script>

<template>
  <main id="main" class="main">
    <div v-if="loading" class="section" style="padding:60px 0">
      <p class="muted">正在打开这本书…</p>
    </div>

    <template v-if="book">
      <div class="book-hero">
        <div class="book-hero__cover">
          <BookCover :book="book" />
          <div class="book-hero__cover-note">
            <span>{{ book.original ? "站内原创" : "公版经典" }}</span>
            <span>墨阅精校 · 演示版</span>
          </div>
        </div>
        <div class="book-hero__main">
          <div class="row gap-10 wrap">
            <span class="tag tag--accent">{{ book.category }}</span>
            <span class="tag">{{ book.free ? "免费阅读" : "会员可读" }}</span>
            <span v-if="book.original" class="tag">站内原创</span>
          </div>
          <h1 class="book-hero__title">{{ book.title }}</h1>
          <p class="book-hero__author">{{ book.author }} 著</p>
          <div class="book-hero__meta">
            <StarRating :rating="book.rating" large />
            <span><strong>{{ Number(book.readers || 0).toLocaleString() }}</strong> 人读过</span>
            <span><strong>{{ book.words }}</strong> 字</span>
            <span><strong>{{ book.year }}</strong> 年</span>
            <span>{{ book.status }}</span>
          </div>
          <div class="book-hero__tags">
            <span v-for="tag in book.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <p class="book-hero__blurb">{{ book.blurb }}</p>
          <div class="book-hero__actions">
            <button class="btn btn--accent" type="button" @click="startReading">
              <Icon name="book-open" /> 开始阅读
            </button>
            <div class="shelf-menu">
              <button class="btn btn--ghost" type="button" data-shelf-toggle aria-haspopup="true" :aria-expanded="shelfMenuOpen" @click.stop="shelfMenuOpen = !shelfMenuOpen">
                <Icon name="bookmark-simple" /> <span>{{ shelfLabel }}</span>
              </button>
              <div v-if="shelfMenuOpen" class="shelf-menu__list" @click.stop>
                <button type="button" @click="setShelf('WANT')">想读</button>
                <button type="button" @click="setShelf('READING')">在读</button>
                <button type="button" @click="setShelf('FINISHED')">读完</button>
                <button v-if="shelfStatus" type="button" data-shelf-set="remove" @click="setShelf('remove')">移出书架</button>
              </div>
            </div>
            <button class="btn btn--quiet" type="button" @click="openReviewTab">
              <Icon name="note-pencil" /> 写书评
            </button>
          </div>
          <div class="book-hero__reason">
            <Icon name="sparkle" />
            <span><strong>为你推荐：</strong>{{ factorReason }}</span>
          </div>
        </div>
      </div>

      <div class="book-body">
        <div class="book-main">
          <div class="tabs" role="tablist" aria-label="书籍信息">
            <button class="tab" :class="{ 'is-active': activeTab === 'intro' }" type="button" @click="activeTab = 'intro'">简介</button>
            <button class="tab" :class="{ 'is-active': activeTab === 'toc' }" type="button" @click="activeTab = 'toc'">目录 <span class="tab__count">{{ book.chapters?.length || 0 }}</span></button>
            <button class="tab" :class="{ 'is-active': activeTab === 'reviews' }" type="button" @click="activeTab = 'reviews'">书评 <span class="tab__count">{{ reviews.length }}</span></button>
            <button class="tab" :class="{ 'is-active': activeTab === 'related' }" type="button" @click="activeTab = 'related'">相关推荐</button>
          </div>

          <section v-if="activeTab === 'intro'" class="tab-panel is-active">
            <div class="prose">
              <p class="lead">{{ book.blurb }}</p>
              <p>{{ book.intro }}</p>
              <blockquote class="book-quote">“{{ book.blurb }}”</blockquote>
              <h3 class="book-subhead">本书看点</h3>
              <ul class="book-points">
                <li><strong>语言</strong><span>{{ book.author }}的文字以{{ book.tags?.[0] || book.category }}见长，适合放慢速度读。</span></li>
                <li><strong>适合</strong><span>{{ book.original ? "站内原创，适合想听见新声音的读者。" : "公版经典，适合第一次系统阅读" + book.category + "的读者。" }}</span></li>
                <li><strong>节奏</strong><span>全书 {{ book.words }} 字，按每天 20 分钟计，约 {{ Math.max(3, Math.ceil(parseFloat(book.words) / 0.8)) }} 天可以读完。</span></li>
              </ul>
              <div class="row gap-6 wrap" style="margin-top:20px">
                <span v-for="tag in book.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </section>

          <section v-if="activeTab === 'toc'" class="tab-panel is-active">
            <div class="chapter-list">
              <div v-for="(chapter, i) in book.chapters" :key="chapter.id" class="chapter-item">
                <span class="chapter-item__no">{{ String(i + 1).padStart(2, "0") }}</span>
                <button class="chapter-link" type="button" @click="readChapter(chapter.orderNo)">{{ chapter.title }}</button>
                <span class="chapter-item__free">{{ chapter.free ? "免费" : "会员" }}</span>
              </div>
            </div>
            <p class="small muted" style="margin-top:14px">目录为演示数据。正式版将接入授权正文或站内原创稿件。</p>
          </section>

          <section v-if="activeTab === 'reviews'" class="tab-panel is-active">
            <form class="review-form" @submit.prevent="submitReview">
              <div class="form-row">
                <div class="star-input" role="group" aria-label="评分">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :class="{ 'is-on': n <= reviewRating }"
                    :aria-label="n + ' 星'"
                    @click="reviewRating = n"
                  >★</button>
                </div>
                <span class="tiny muted">写下你的读后感受</span>
              </div>
              <label class="sr-only" for="reviewText">书评内容</label>
              <textarea id="reviewText" v-model="reviewText" class="textarea" maxlength="500" placeholder="这本书让你停下来的那一段是什么？" />
              <div class="row between">
                <span class="tiny muted">提交后需要管理员审核；演示账号可直接在后台通过。</span>
                <button class="btn btn--sm" type="submit">发布书评</button>
              </div>
            </form>
            <div class="review-list">
              <article v-for="review in reviews" :key="review.id" class="review">
                <div :class="['avatar', 'avatar--' + (review.avatar % 6)]">{{ review.user.slice(0, 1) }}</div>
                <div>
                  <div class="review__head">
                    <span class="review__name">{{ review.user }}</span>
                    <StarRating :rating="review.rating" />
                    <span class="review__date">{{ review.date }}</span>
                  </div>
                  <p class="review__text">{{ review.text }}</p>
                  <div class="review__actions">
                    <button class="post__action" :class="{ 'is-on': review.liked }" type="button" @click="likeReview(review)">
                      <Icon name="thumbs-up" /> {{ review.likes }}
                    </button>
                    <button class="post__action" type="button"><Icon name="chat-circle" /> 回复</button>
                  </div>
                </div>
              </article>
              <EmptyState
                v-if="!reviews.length"
                image="/assets/img/undraw/reading-notes_dg9z.svg"
                alt="正在写笔记的人"
                title="还没有人写书评"
                copy="你可以是第一个。写下让你停下来的那一页。"
              />
            </div>
          </section>

          <section v-if="activeTab === 'related'" class="tab-panel is-active">
            <div class="related-grid">
              <BookCard v-for="item in similar" :key="item.id" :book="item" />
            </div>
          </section>
        </div>

        <aside class="book-aside">
          <section class="panel">
            <h3>为什么推荐给你</h3>
            <div v-for="(name, i) in factorNames" :key="name" class="factor">
              <span>{{ name }}</span>
              <span class="factor__track"><i class="factor__fill" :style="{ width: factorValues[i] + '%' }" /></span>
              <span class="factor__value">{{ factorValues[i] }}</span>
            </div>
            <p style="margin-top:12px">由内容相似度、协同过滤、站内热度与新鲜度加权得到。权重来自 AHP 层次分析法，可在管理后台调整。</p>
            <RouterLink class="link-arrow" to="/admin">查看推荐配置 <Icon name="arrow-right" /></RouterLink>
          </section>
          <section class="panel">
            <h3>关于作者</h3>
            <p>{{ book.authorBio }}</p>
          </section>
          <section class="panel">
            <h3>一起读</h3>
            <p>本周共读正在讨论《呼兰河传》。带着你正在读的这一页来，不需要读完。</p>
            <RouterLink class="btn btn--ghost btn--sm" to="/community">进入共读 <Icon name="arrow-up-right" /></RouterLink>
          </section>
        </aside>
      </div>
    </template>
  </main>
</template>

<style scoped>
.chapter-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}
.chapter-link:hover { color: var(--oxblood); }
</style>
