<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { communityApi } from "../api/community";
import { booksApi } from "../api/books";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { activeReaders, communityRules } from "../content";
import Avatar from "../components/Avatar.vue";
import BookCover from "../components/BookCover.vue";
import EmptyState from "../components/EmptyState.vue";
import ModalShell from "../components/ModalShell.vue";
import Icon from "../components/Icon.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const topics = ["全部", "本周共读", "书评", "摘录", "提问"];
const activeTopic = ref("全部");
const posts = ref([]);
const sideBook = ref(null);
const allBooks = ref([]);
const loading = ref(true);

const commentsOpen = ref(false);
const activePost = ref(null);
const comments = ref([]);
const commentText = ref("");
const commentLoading = ref(false);

const composerOpen = ref(false);
const newTopic = ref("本周共读");
const newBookId = ref("hulanhezhuan");
const newContent = ref("");
const posting = ref(false);

const filteredPosts = computed(() => activeTopic.value === "全部"
  ? posts.value
  : posts.value.filter((p) => p.topic === activeTopic.value));

function topicCount(topic) {
  return topic === "全部" ? posts.value.length : posts.value.filter((p) => p.topic === topic).length;
}

function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return "/" + path;
}

async function load() {
  loading.value = true;
  try {
    const [postList, bookDetail] = await Promise.all([
      communityApi.posts(),
      booksApi.detail("hulanhezhuan").catch(() => null)
    ]);
    posts.value = postList || [];
    sideBook.value = bookDetail;
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

async function toggleLike(post) {
  if (!requireLogin()) return;
  try {
    const result = await communityApi.like(post.id);
    post.likes = result.likes;
    post.liked = !post.liked;
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function openComments(post) {
  activePost.value = post;
  commentText.value = "";
  commentsOpen.value = true;
  try {
    const detail = await communityApi.detail(post.id);
    activePost.value = detail.post;
    comments.value = detail.comments || [];
  } catch (e) {
    comments.value = [];
    ui.notify(e.message, "info");
  }
}

async function submitComment() {
  if (!requireLogin()) return;
  if (commentText.value.trim().length < 2) {
    ui.notify("再多写几个字吧", "info");
    return;
  }
  commentLoading.value = true;
  try {
    await communityApi.comment(activePost.value.id, commentText.value.trim());
    commentText.value = "";
    const detail = await communityApi.detail(activePost.value.id);
    activePost.value = detail.post;
    comments.value = detail.comments || [];
    const index = posts.value.findIndex((p) => p.id === activePost.value.id);
    if (index >= 0) posts.value[index] = { ...detail.post };
    ui.notify("回应已发布", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    commentLoading.value = false;
  }
}

async function openComposer() {
  if (!requireLogin()) return;
  composerOpen.value = true;
  if (!allBooks.value.length) {
    try {
      const page = await booksApi.list({ size: 100 });
      allBooks.value = page.content || [];
    } catch (e) { /* 不阻塞发帖 */ }
  }
}

async function submitPost() {
  if (!requireLogin()) return;
  if (newContent.value.trim().length < 5) {
    ui.notify("再多写几个字吧", "info");
    return;
  }
  posting.value = true;
  try {
    await communityApi.create({
      topic: newTopic.value,
      bookId: newBookId.value || null,
      content: newContent.value.trim()
    });
    composerOpen.value = false;
    newContent.value = "";
    activeTopic.value = "全部";
    await load();
    ui.notify("讨论已发布", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    posting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <main id="main" class="main">
    <header class="page-head">
      <div class="page-head__main">
        <p class="kicker">读者的客厅</p>
        <h1>共读</h1>
        <p class="page-head__meta">本周 36 人一起读《呼兰河传》 · 不剧透，不催促</p>
      </div>
      <div class="page-head__aside">
        <button class="btn btn--accent" type="button" @click="openComposer">
          <Icon name="plus" /> 发起讨论
        </button>
      </div>
    </header>

    <section style="padding-top:28px" aria-label="本周共读">
      <div class="community-feature">
        <div class="community-feature__copy">
          <p class="kicker">本周共读 · 第 18 期</p>
          <h2>《呼兰河传》：一个人如何写自己的故乡</h2>
          <p>本周我们一起读萧红。每晚八点共读室开放，周日晚上有一次线上讨论。读不完也没关系，带着你停下来的那一页来就好。</p>
          <div class="community-feature__meta">
            <span class="avatar-group" aria-hidden="true">
              <span class="avatar avatar--1">林</span>
              <span class="avatar avatar--0">周</span>
              <span class="avatar avatar--4">苏</span>
              <span class="avatar avatar--2">满</span>
            </span>
            <span>36 人已加入</span>
            <span>还剩 3 天</span>
          </div>
          <div class="row gap-10 wrap" style="margin-top:6px">
            <RouterLink class="btn btn--accent btn--sm" to="/book/hulanhezhuan">查看书目</RouterLink>
            <RouterLink class="btn btn--ghost btn--sm" to="/reader/hulanhezhuan">开始阅读</RouterLink>
          </div>
        </div>
        <div class="community-feature__image">
          <img src="/assets/img/pexels/reading-window.jpg" alt="窗边读书的人">
        </div>
      </div>
    </section>

    <div class="community-layout">
      <div class="community-main">
        <div class="community-toolbar">
          <div class="filter-chips" role="group" aria-label="按话题筛选">
            <button
              v-for="topic in topics"
              :key="topic"
              class="chip"
              :class="{ 'is-active': activeTopic === topic }"
              type="button"
              @click="activeTopic = topic"
            >
              {{ topic }}<span class="chip__count">{{ topicCount(topic) }}</span>
            </button>
          </div>
        </div>

        <div>
          <article v-for="post in filteredPosts" :key="post.id" class="post">
            <Avatar :name="post.user" />
            <div>
              <div class="post__head">
                <span class="post__name">{{ post.user }}</span>
                <span class="post__handle">@moread</span>
                <span class="post__time">{{ post.time }}</span>
                <span class="post__topic">{{ post.topic }}</span>
              </div>
              <p class="post__text">{{ post.text }}</p>
              <div v-if="post.image" class="post__image">
                <img :src="imageUrl(post.image)" alt="帖子配图">
              </div>
              <RouterLink v-if="post.bookId" class="post__book" :to="'/book/' + post.bookId">
                <span class="mini-cover cover--bottle">{{ post.bookTitle?.slice(0, 1) }}</span>
                《{{ post.bookTitle }}》 · {{ post.bookAuthor }}
              </RouterLink>
              <div class="post__actions">
                <button class="post__action" :class="{ 'is-on': post.liked }" type="button" @click="toggleLike(post)">
                  <Icon name="heart" /> {{ post.likes }}
                </button>
                <button class="post__action" type="button" @click="openComments(post)">
                  <Icon name="chat-circle" /> {{ post.comments }}
                </button>
                <button class="post__action" type="button" @click="ui.notify('已收藏这条讨论', 'bookmark-simple')">
                  <Icon name="bookmark-simple" /> 收藏
                </button>
                <button class="post__action" type="button" @click="ui.notify('链接已复制（演示）', 'share-network')">
                  <Icon name="share-network" /> 分享
                </button>
              </div>
            </div>
          </article>
          <EmptyState
            v-if="!filteredPosts.length && !loading"
            image="/assets/img/undraw/sharing-knowledge_2jx3.svg"
            alt="两个人在交换一本书"
            title="这个话题还没有讨论"
            copy="不如由你开个头。"
          >
            <button class="btn btn--ghost btn--sm" type="button" @click="openComposer">发起讨论</button>
          </EmptyState>
        </div>
      </div>

      <aside class="community-side">
        <section class="side-panel">
          <h3>本周书目 <span>第 18 期</span></h3>
          <div v-if="sideBook" class="side-book">
            <BookCover :book="sideBook" />
            <div>
              <div class="side-book__title"><RouterLink :to="'/book/' + sideBook.id">《{{ sideBook.title }}》</RouterLink></div>
              <div class="side-book__meta">{{ sideBook.author }} · 36 人在读</div>
              <div class="side-book__meta">本周讨论 12 条</div>
            </div>
          </div>
        </section>
        <section class="side-panel">
          <h3>活跃读者 <span>本周</span></h3>
          <div v-for="(reader, i) in activeReaders" :key="reader.name" class="active-reader">
            <Avatar :name="reader.name" size="sm" />
            <span class="active-reader__name">{{ reader.name }}<small>{{ reader.bio }}</small></span>
            <span class="active-reader__time">{{ reader.time }}</span>
          </div>
        </section>
        <section class="side-panel">
          <h3>社区公约</h3>
          <ul class="side-note">
            <li v-for="rule in communityRules" :key="rule">{{ rule }}</li>
          </ul>
        </section>
      </aside>
    </div>

    <ModalShell
      :open="commentsOpen"
      title="回应"
      :subtitle="activePost ? '和 ' + activePost.user + ' 聊聊这条讨论' : ''"
      @close="commentsOpen = false"
    >
      <div v-if="activePost" class="comment-post">
        <Avatar :name="activePost.user" />
        <div>
          <div class="post__head">
            <span class="post__name">{{ activePost.user }}</span>
            <span class="post__time">{{ activePost.time }}</span>
            <span class="post__topic">{{ activePost.topic }}</span>
          </div>
          <p class="post__text">{{ activePost.text }}</p>
        </div>
      </div>
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <Avatar :name="comment.user" size="sm" />
          <div>
            <div class="comment-item__head">
              <span class="comment-item__name">{{ comment.user }}</span>
              <span>{{ comment.time }}</span>
            </div>
            <p class="comment-item__text">{{ comment.text }}</p>
          </div>
        </div>
        <div v-if="!comments.length" class="comment-empty">还没有人回应。写下一句，让讨论继续。</div>
      </div>
      <form class="comment-form" @submit.prevent="submitComment">
        <label class="sr-only" for="commentInput">写下回应</label>
        <textarea id="commentInput" v-model="commentText" class="textarea" maxlength="300" placeholder="写下你的回应…" />
        <button class="btn btn--accent btn--sm" type="submit" :disabled="commentLoading">发送</button>
      </form>
    </ModalShell>

    <ModalShell
      :open="composerOpen"
      title="发起讨论"
      subtitle="分享一个想法、一段摘录，或者一个没有想明白的问题。"
      @close="composerOpen = false"
    >
      <form class="stack gap-16" @submit.prevent="submitPost">
        <div class="grid grid--2" style="gap:12px">
          <div class="field">
            <label for="postTopic">话题</label>
            <select id="postTopic" v-model="newTopic" class="select">
              <option value="本周共读">本周共读</option>
              <option value="书评">书评</option>
              <option value="摘录">摘录</option>
              <option value="提问">提问</option>
            </select>
          </div>
          <div class="field">
            <label for="postBook">关联书目</label>
            <select id="postBook" v-model="newBookId" class="select">
              <option value="">不关联书目</option>
              <option v-for="book in allBooks" :key="book.id" :value="book.id">《{{ book.title }}》 · {{ book.author }}</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="postText">内容</label>
          <textarea id="postText" v-model="newContent" class="textarea" maxlength="500" placeholder="写下你正在想的那一段…" />
          <span class="field__hint">最多 500 字。引用请注明书名与页码。</span>
        </div>
        <div class="row between wrap gap-10">
          <span class="tiny muted">发布后会出现在共读讨论里。</span>
          <button class="btn btn--accent" type="submit" :disabled="posting">发布讨论</button>
        </div>
      </form>
    </ModalShell>
  </main>
</template>
