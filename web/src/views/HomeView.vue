<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { booksApi } from "../api/books";
import { catalogApi } from "../api/catalog";
import { recommendationsApi } from "../api/recommendations";
import { statsApi } from "../api/stats";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { coRead, featuredNotes, heroTags } from "../content";
import BookSpine from "../components/BookSpine.vue";
import BookCard from "../components/BookCard.vue";
import BookCover from "../components/BookCover.vue";
import StarRating from "../components/StarRating.vue";
import Icon from "../components/Icon.vue";

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const books = ref([]);
const categories = ref([]);
const booklists = ref([]);
const recommendations = ref([]);
const publicStats = ref(null);
const rotation = ref(0);
const loading = ref(true);
const searchInput = ref("");
const ctaInput = ref("");

const isMobile = ref(window.matchMedia("(max-width: 620px)").matches);
let mediaQuery = null;
let mediaHandler = null;
if (typeof window !== "undefined") {
  mediaQuery = window.matchMedia("(max-width: 620px)");
  mediaHandler = (e) => { isMobile.value = e.matches; };
  if (mediaQuery.addEventListener) mediaQuery.addEventListener("change", mediaHandler);
}
onBeforeUnmount(() => {
  if (mediaQuery && mediaHandler && mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener("change", mediaHandler);
  }
});

const desktopHeights = [282, 254, 298, 268, 240, 288, 262];
const desktopWidths = [48, 44, 52, 46, 42, 50, 45];
const mobileHeights = [246, 222, 260, 234, 210, 252, 228];
const mobileWidths = [38, 35, 41, 37, 34, 40, 36];

const shelfBooks = computed(() => {
  const featured = books.value.filter((b) => b.featured);
  const rest = books.value.filter((b) => !b.featured);
  const ordered = [...featured, ...rest];
  if (!ordered.length) return [];
  const result = [];
  const start = (rotation.value * 7) % ordered.length;
  for (let i = 0; i < Math.min(7, ordered.length); i += 1) {
    result.push(ordered[(start + i) % ordered.length]);
  }
  return result;
});

const feature = computed(() => {
  if (recommendations.value.length) return recommendations.value[0];
  const top = [...books.value].sort((a, b) => b.rating - a.rating)[0];
  return top ? { book: top, reason: "站内高分作品，先从这里开始" } : null;
});

const recList = computed(() => {
  if (recommendations.value.length) return recommendations.value.slice(1, 4);
  return [...books.value]
    .filter((b) => b.id !== feature.value?.book?.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map((b) => ({ book: b, reason: "读者评分 " + Number(b.rating).toFixed(1) + "，适合作为下一本" }));
});

const newBooks = computed(() => [...books.value].sort((a, b) => b.year - a.year).slice(0, 6));

const homeStats = computed(() => [
  { value: String(publicStats.value?.readers ?? 10), label: "位注册读者" },
  { value: String(publicStats.value?.books ?? 27), label: "本精选与原创书目" },
  { value: String(publicStats.value?.readingEvents ?? 242), label: "条阅读记录" }
]);

async function load() {
  try {
    const [page, cats, lists, stats] = await Promise.all([
      booksApi.list({ size: 100 }),
      catalogApi.categories(),
      catalogApi.booklists(),
      statsApi.public().catch(() => null)
    ]);
    books.value = page.content || [];
    categories.value = cats || [];
    booklists.value = lists || [];
    publicStats.value = stats;
    if (auth.isLoggedIn) {
      recommendations.value = await recommendationsApi.home(6);
    }
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    loading.value = false;
  }
}

function submitSearch() {
  const q = searchInput.value.trim();
  router.push({ path: "/discover", query: q ? { q } : {} });
}

function submitCta() {
  const q = ctaInput.value.trim();
  router.push({ path: "/discover", query: q ? { q } : {} });
}

onMounted(load);
</script>

<template>
  <main id="main" class="main">
    <section class="hero">
      <div class="hero__copy">
        <p class="kicker">为深度阅读而做的数字书房</p>
        <h1 class="hero__title"><span>把书</span><span>读成自己的</span></h1>
        <p class="hero__lede">从一本对的书开始。墨阅用混合推荐理解你的口味，用共读、划线和笔记，陪你把一本书真正读完。</p>
        <form class="hero__search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="heroSearch">搜索书籍</label>
          <div class="search-box">
            <Icon name="magnifying-glass" />
            <input id="heroSearch" v-model="searchInput" type="search" placeholder="搜索书名、作者，或一句你记得的话" autocomplete="off">
          </div>
          <button class="btn btn--accent" type="submit">找书</button>
        </form>
        <div class="hero__tags">
          <span>试试</span>
          <template v-for="tag in heroTags" :key="tag.label">
            <RouterLink v-if="tag.to" class="tag" :to="tag.to">{{ tag.label }}</RouterLink>
            <RouterLink v-else class="tag" :to="{ path: '/discover', query: { q: tag.query } }">{{ tag.label }}</RouterLink>
          </template>
        </div>
        <div class="hero__stats">
          <div v-for="stat in homeStats" :key="stat.label" class="hero__stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div class="hero-shelf">
        <div class="shelf-head">
          <h2>本周书架</h2>
          <button type="button" @click="rotation += 1"><Icon name="arrows-clockwise" /> 换一批</button>
        </div>
        <div class="shelf-stage">
          <div class="shelf">
            <BookSpine
              v-for="(book, i) in shelfBooks"
              :key="book.id"
              :book="book"
              :height="(isMobile ? mobileHeights : desktopHeights)[i % 7]"
              :width="(isMobile ? mobileWidths : desktopWidths)[i % 7]"
              :delay="80 + i * 60"
            />
          </div>
        </div>
        <div class="shelf-base" />
        <div class="shelf-caption">
          <span>悬停看书名，点击进入详情</span>
          <span>本期由 6 位编辑选出</span>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="recTitle">
      <header class="section-head">
        <div class="section-head__main">
          <p class="kicker">为你挑选</p>
          <h2 id="recTitle" class="h2">今天读什么</h2>
        </div>
        <p class="section-head__note">依据你的阅读记录、书架与相似读者的选择生成。推荐理由随书附上。</p>
      </header>
      <div class="rec-layout">
        <div v-if="feature" class="rec-feature">
          <RouterLink class="rec-feature__cover" :to="'/book/' + feature.book.id">
            <BookCover :book="feature.book" />
          </RouterLink>
          <div class="rec-feature__body">
            <span class="kicker">{{ auth.isLoggedIn ? "今日首选" : "站内高分" }}</span>
            <h3 class="rec-feature__title">
              <RouterLink :to="'/book/' + feature.book.id">{{ feature.book.title }}</RouterLink>
            </h3>
            <p class="rec-feature__author">
              {{ feature.book.author }} · {{ feature.book.category }} · <StarRating :rating="feature.book.rating" />
            </p>
            <p class="rec-feature__blurb">{{ feature.book.blurb }}</p>
            <div class="rec-feature__reason">
              <Icon name="sparkle" />
              <span><strong>推荐理由</strong><br>{{ feature.reason }}</span>
            </div>
            <div class="rec-feature__actions">
              <RouterLink class="btn btn--sm btn--accent" :to="'/reader/' + feature.book.id">
                <Icon name="book-open" /> 开始阅读
              </RouterLink>
              <RouterLink class="btn btn--sm btn--ghost" :to="'/book/' + feature.book.id">查看详情</RouterLink>
            </div>
          </div>
        </div>
        <div v-if="recList.length" class="rec-list">
          <RouterLink v-for="item in recList" :key="item.book.id" class="rec-item" :to="'/book/' + item.book.id">
            <BookCover :book="item.book" />
            <span>
              <span class="rec-item__title">{{ item.book.title }}</span>
              <span class="rec-item__reason">{{ item.reason }}</span>
            </span>
            <span class="rec-item__arrow"><Icon name="arrow-right" /></span>
          </RouterLink>
        </div>
      </div>
      <p v-if="!auth.isLoggedIn" class="tiny muted" style="margin-top:14px">
        登录后会根据你的书架和阅读记录生成个性化推荐；当前展示的是站内高分书目。
      </p>
    </section>

    <section class="section" aria-labelledby="newTitle">
      <header class="section-head">
        <div class="section-head__main">
          <p class="kicker">新书上架</p>
          <h2 id="newTitle" class="h2">刚刚放进书房的书</h2>
        </div>
        <p class="section-head__note">站内原创与公版经典，每周三更新。横向滑动查看更多。</p>
      </header>
      <div class="book-strip">
        <BookCard v-for="book in newBooks" :key="book.id" :book="book" />
      </div>
    </section>

    <section class="section" aria-labelledby="listTitle">
      <header class="section-head">
        <div class="section-head__main">
          <p class="kicker">编辑书单</p>
          <h2 id="listTitle" class="h2">按一种心情，找一组书</h2>
        </div>
        <p class="section-head__note">书单由编辑与读者共同维护。点进去，看看这一组书为什么被放在一起。</p>
      </header>
      <div class="booklist-grid">
        <RouterLink
          v-for="list in booklists"
          :key="list.id"
          class="booklist-card"
          :to="{ path: '/discover', query: { list: list.id } }"
        >
          <div class="booklist-card__covers">
            <BookCover v-for="book in (list.books || []).slice(0, 3)" :key="book.id" :book="book" />
          </div>
          <div class="booklist-card__body">
            <span class="booklist-card__seal" aria-hidden="true">{{ list.mark }}</span>
            <span class="kicker">{{ list.bookCount }} 本书单</span>
            <h3>{{ list.title }}</h3>
            <p>{{ list.description }}</p>
            <span class="link-arrow">查看书单 <Icon name="arrow-right" /></span>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="section" aria-labelledby="catTitle">
      <header class="section-head">
        <div class="section-head__main">
          <p class="kicker">分类书架</p>
          <h2 id="catTitle" class="h2">按此刻想读的东西找</h2>
        </div>
        <p class="section-head__note">不按热度，不按榜单。按你现在真正关心的那件事。</p>
      </header>
      <div class="cat-grid">
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          class="cat-item"
          :to="{ path: '/discover', query: { cat: cat.id } }"
        >
          <span class="cat-item__mark" aria-hidden="true">{{ cat.mark }}</span>
          <h3>{{ cat.name }}</h3>
          <p>{{ cat.description }}</p>
          <span class="cat-item__count">{{ cat.count }} 本书 · 进入分类</span>
        </RouterLink>
      </div>
    </section>

    <section class="section" aria-labelledby="coReadTitle">
      <div class="co-read">
        <div class="co-read__copy">
          <p class="kicker">{{ coRead.kicker }}</p>
          <h2 id="coReadTitle">{{ coRead.title }}</h2>
          <p>{{ coRead.copy }}</p>
          <div class="co-read__meta">
            <span class="avatar-group" aria-hidden="true">
              <span v-for="(a, i) in coRead.participants" :key="i" :class="['avatar', 'avatar--' + i]">{{ a }}</span>
            </span>
            <span>{{ coRead.joined }} 人已加入</span>
            <span class="co-read__progress"><i :style="{ width: coRead.progress + '%' }" /></span>
            <span>共读进度 {{ coRead.progress }}%</span>
          </div>
          <div class="row gap-10 wrap">
            <RouterLink class="btn btn--accent" to="/community">加入共读</RouterLink>
            <RouterLink class="btn btn--ghost" :to="'/book/' + coRead.bookId">查看书目</RouterLink>
          </div>
        </div>
        <div class="co-read__image">
          <img :src="coRead.image" alt="桌上一杯茶与摊开的书">
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="noteTitle">
      <header class="section-head">
        <div class="section-head__main">
          <p class="kicker">读者笔记</p>
          <h2 id="noteTitle" class="h2">从书页边角长出来的句子</h2>
        </div>
        <p class="section-head__note">所有笔记都来自读者的真实划线（演示数据），标注了页码与出处。</p>
      </header>
      <div class="note-grid">
        <article v-for="(note, i) in featuredNotes" :key="i" class="note-card">
          <span class="note-card__book">《{{ note.bookTitle }}》 · {{ note.page }}</span>
          <p class="note-card__quote">“{{ note.quote }}”</p>
          <p class="note-card__note">{{ note.note }}</p>
          <div class="note-card__foot">
            <span class="row gap-6"><span :class="['avatar', 'avatar--' + (i % 6), 'avatar--sm']">{{ note.user.slice(0, 1) }}</span>{{ note.user }}</span>
            <span>{{ note.date }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="discover-cta" aria-labelledby="ctaTitle">
      <div class="discover-cta__inner">
        <p class="kicker">下一本</p>
        <h2 id="ctaTitle">不知道读什么的时候，先说说你最近在想什么。</h2>
        <p>搜索一个词、一个人，或者一种情绪。墨阅会从 27 本书里，找出最接近的那几本。</p>
        <form role="search" @submit.prevent="submitCta">
          <label class="sr-only" for="ctaSearch">搜索书籍</label>
          <div class="search-box">
            <Icon name="magnifying-glass" />
            <input id="ctaSearch" v-model="ctaInput" type="search" placeholder="比如：故乡、独处、科幻、鲁迅" autocomplete="off">
          </div>
        </form>
        <div class="row gap-10 wrap">
          <RouterLink class="btn btn--accent" to="/discover">浏览全部书库</RouterLink>
          <RouterLink class="btn btn--ghost" to="/login">登录 / 注册</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
