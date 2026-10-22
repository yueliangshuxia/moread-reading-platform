<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { adminApi } from "../api/admin";
import { catalogApi } from "../api/catalog";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import Avatar from "../components/Avatar.vue";
import LineChart from "../components/LineChart.vue";
import ModalShell from "../components/ModalShell.vue";
import Icon from "../components/Icon.vue";

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const panels = [
  { id: "overview", label: "概览", icon: "chart-line" },
  { id: "books", label: "图书管理", icon: "books" },
  { id: "users", label: "用户管理", icon: "users" },
  { id: "reviews", label: "书评审核", icon: "chat-centered-text" },
  { id: "recommend", label: "推荐配置", icon: "sparkle" }
];
const activePanel = ref("overview");
const titleMap = { overview: "概览", books: "图书管理", users: "用户管理", reviews: "书评审核", recommend: "推荐配置" };
const adminTitle = computed(() => titleMap[activePanel.value] || "管理后台");

const overview = ref(null);
const books = ref([]);
const users = ref([]);
const allReviews = ref([]);
const categories = ref([]);
const weights = reactive({ content: 35, cf: 30, popularity: 20, freshness: 15 });
const reviewFilter = ref("全部");
const bookQuery = ref("");
const bookCategory = ref("all");
const loading = ref(true);

const bookModalOpen = ref(false);
const editingId = ref("");
const bookForm = reactive({
  title: "", author: "", categoryId: "classic", rating: 8.5, words: "10 万",
  publishedYear: new Date().getFullYear(), status: "连载", free: true, original: true,
  tagsText: "", blurb: "", intro: "", authorBio: "", coverTheme: "bottle", coverPattern: "letter"
});

const filteredBooks = computed(() => books.value.filter((book) => {
  const q = bookQuery.value.trim().toLowerCase();
  const byCat = bookCategory.value === "all" || book.categoryId === bookCategory.value;
  const byText = !q || (book.title + " " + book.author).toLowerCase().includes(q);
  return byCat && byText;
}));

const reviewOptions = ["全部", "PENDING", "PASSED", "REJECTED"];
const reviewLabel = { PENDING: "待审", PASSED: "已通过", REJECTED: "已驳回" };
const reviewCounts = computed(() => {
  const counts = { 全部: allReviews.value.length, PENDING: 0, PASSED: 0, REJECTED: 0 };
  allReviews.value.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  return counts;
});
const filteredReviews = computed(() => reviewFilter.value === "全部"
  ? allReviews.value
  : allReviews.value.filter((r) => r.status === reviewFilter.value));

const normalizedWeights = computed(() => {
  const sum = Math.max(1, weights.content + weights.cf + weights.popularity + weights.freshness);
  return {
    content: weights.content / sum,
    cf: weights.cf / sum,
    popularity: weights.popularity / sum,
    freshness: weights.freshness / sum
  };
});
const formulaText = computed(() => {
  const w = normalizedWeights.value;
  return `score = ${w.content.toFixed(2)}·内容 + ${w.cf.toFixed(2)}·协同 + ${w.popularity.toFixed(2)}·热度 + ${w.freshness.toFixed(2)}·新鲜度`;
});
const preview = computed(() => {
  const w = normalizedWeights.value;
  return [...books.value]
    .map((book) => {
      const s = book.scores || {};
      const score = (s.content || 0) * w.content + (s.cf || 0) * w.cf
        + (s.popularity || 0) * w.popularity + (s.freshness || 0) * w.freshness;
      return { book, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
});

async function loadAll() {
  loading.value = true;
  try {
    const [overviewData, bookList, userList, reviewList, weightData, categoryList] = await Promise.all([
      adminApi.overview(),
      adminApi.books(),
      adminApi.users(),
      adminApi.reviews(),
      adminApi.weights(),
      catalogApi.categories()
    ]);
    overview.value = overviewData;
    books.value = bookList || [];
    users.value = userList || [];
    allReviews.value = reviewList || [];
    categories.value = categoryList || [];
    Object.assign(weights, weightData || {});
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    loading.value = false;
  }
}

async function refreshOverview() {
  try { overview.value = await adminApi.overview(); } catch (e) { /* ignore */ }
}

function goPanel(id) {
  activePanel.value = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCreateBook() {
  editingId.value = "";
  Object.assign(bookForm, {
    title: "", author: "", categoryId: categories.value[0]?.id || "classic", rating: 8.5,
    words: "10 万", publishedYear: new Date().getFullYear(), status: "连载",
    free: true, original: true, tagsText: "", blurb: "", intro: "", authorBio: "",
    coverTheme: "bottle", coverPattern: "letter"
  });
  bookModalOpen.value = true;
}

function openEditBook(book) {
  editingId.value = book.id;
  Object.assign(bookForm, {
    title: book.title,
    author: book.author,
    categoryId: book.categoryId,
    rating: book.rating,
    words: book.words || "10 万",
    publishedYear: book.year || new Date().getFullYear(),
    status: book.status || "连载",
    free: book.free,
    original: book.original,
    tagsText: (book.tags || []).join("，"),
    blurb: book.blurb || "",
    intro: "",
    authorBio: "",
    coverTheme: book.cover?.theme || "bottle",
    coverPattern: book.cover?.pattern || "letter"
  });
  bookModalOpen.value = true;
}

async function saveBook() {
  const payload = {
    title: bookForm.title.trim(),
    author: bookForm.author.trim(),
    categoryId: bookForm.categoryId,
    rating: Number(bookForm.rating),
    words: bookForm.words,
    publishedYear: Number(bookForm.publishedYear),
    status: bookForm.status,
    free: bookForm.free,
    original: bookForm.original,
    tags: bookForm.tagsText.split(/[，,]/).map((s) => s.trim()).filter(Boolean),
    blurb: bookForm.blurb,
    coverTheme: bookForm.coverTheme,
    coverPattern: bookForm.coverPattern
  };
  // 编辑时表单里没有原 intro/authorBio，留空就不要覆盖数据库里的旧值。
  if (editingId.value) {
    if (bookForm.intro) payload.intro = bookForm.intro;
    if (bookForm.authorBio) payload.authorBio = bookForm.authorBio;
  } else {
    payload.intro = bookForm.intro || bookForm.blurb;
    payload.authorBio = bookForm.authorBio || "作者信息待补充。";
  }
  try {
    if (editingId.value) await adminApi.updateBook(editingId.value, payload);
    else await adminApi.createBook(payload);
    bookModalOpen.value = false;
    books.value = await adminApi.books();
    await refreshOverview();
    ui.notify(editingId.value ? "图书已更新" : "图书已添加", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function toggleListed(book) {
  try {
    await adminApi.setListed(book.id, !book.listed);
    books.value = await adminApi.books();
    await refreshOverview();
    ui.notify(book.listed ? "已下架" : "已上架", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function toggleUser(user) {
  try {
    const updated = await adminApi.setUserStatus(user.id, user.status === "ACTIVE" ? "MUTED" : "ACTIVE");
    Object.assign(user, updated);
    ui.notify("用户状态已更新", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function moderate(review, approve) {
  try {
    await (approve ? adminApi.approve(review.id) : adminApi.reject(review.id));
    allReviews.value = await adminApi.reviews();
    await refreshOverview();
    ui.notify(approve ? "书评已通过" : "书评已驳回", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function saveWeights() {
  try {
    const updated = await adminApi.updateWeights({
      content: weights.content,
      cf: weights.cf,
      popularity: weights.popularity,
      freshness: weights.freshness
    });
    Object.assign(weights, updated);
    ui.notify("推荐权重已保存", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function resetWeights() {
  Object.assign(weights, { content: 35, cf: 30, popularity: 20, freshness: 15 });
  await saveWeights();
}

async function rebuild() {
  try {
    await adminApi.rebuild();
    ui.notify("推荐结果已重算", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(loadAll);
</script>

<template>
  <div class="admin">
    <aside class="admin-side">
      <div class="admin-brand">
        <span class="rail__seal" style="width:36px;height:36px;font-size:20px">阅</span>
        <span class="admin-brand__word">墨阅<small>MOREAD ADMIN</small></span>
      </div>
      <nav class="admin-nav" aria-label="后台导航">
        <span class="admin-nav__label">工作台</span>
        <button
          v-for="panel in panels"
          :key="panel.id"
          type="button"
          :class="{ 'is-active': activePanel === panel.id }"
          @click="goPanel(panel.id)"
        >
          <Icon :name="panel.icon" />{{ panel.label }}
        </button>
      </nav>
      <div class="admin-side__bottom">
        <RouterLink class="admin-back" to="/"><Icon name="arrow-left" /> 返回前台</RouterLink>
        <div class="admin-user">
          <Avatar :name="auth.user?.name || '管'" />
          <div><strong>{{ auth.user?.name || "管理员" }}</strong><span>超级管理员</span></div>
        </div>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-top">
        <div>
          <p class="kicker">管理后台</p>
          <h1>{{ adminTitle }}</h1>
        </div>
        <div class="admin-top__right">
          <div class="search-box">
            <Icon name="magnifying-glass" />
            <input type="search" placeholder="搜索（演示）" aria-label="全局搜索">
          </div>
          <button class="icon-btn" type="button" aria-label="切换主题" @click="ui.toggleTheme()">
            <Icon :name="ui.theme === 'dark' ? 'sun' : 'moon'" />
          </button>
          <span class="user-chip">
            <Avatar :name="auth.user?.name || '管'" size="sm" />
            <span>{{ auth.user?.name || "管理员" }}</span>
          </span>
        </div>
      </header>

      <main class="admin-content">
        <p v-if="loading" class="muted">正在加载后台数据…</p>

        <template v-if="!loading">
          <section v-if="activePanel === 'overview'" class="admin-panel is-active">
            <div class="kpi-grid">
              <div class="kpi"><div class="kpi__label">总用户<Icon name="users" /></div><strong>{{ overview?.users || 0 }}</strong><div class="kpi__foot"><span class="kpi__delta">+12.4%</span><span>较上月</span></div></div>
              <div class="kpi"><div class="kpi__label">在架图书<Icon name="books" /></div><strong>{{ overview?.books || 0 }}</strong><div class="kpi__foot"><span class="kpi__delta">+3 本</span><span>本月新增</span></div></div>
              <div class="kpi"><div class="kpi__label">今日阅读时长<Icon name="timer" /></div><strong>{{ Number(overview?.todayMinutes || 0).toLocaleString() }}</strong><div class="kpi__foot"><span class="kpi__delta">+8.2%</span><span>较昨日（分钟）</span></div></div>
              <div class="kpi"><div class="kpi__label">待审书评<Icon name="chat-centered-text" /></div><strong>{{ overview?.pendingReviews || 0 }}</strong><div class="kpi__foot"><span>需要人工处理</span></div></div>
            </div>

            <div class="admin-grid">
              <div class="admin-card">
                <div class="admin-card__head">
                  <div><h2>近 7 日活跃读者</h2><p>按日去重登录用户</p></div>
                </div>
                <div class="chart__plot">
                  <LineChart :points="overview?.weeklyActiveSeries || []" />
                </div>
                <details class="chart-data" style="margin-top:10px">
                  <summary>查看数据表</summary>
                  <table>
                    <thead><tr><th>日期</th><th>活跃读者</th></tr></thead>
                    <tbody>
                      <tr v-for="point in overview?.weeklyActiveSeries || []" :key="point.label">
                        <td>{{ point.label }}</td><td>{{ point.value }}</td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              </div>
              <div class="admin-card">
                <div class="admin-card__head">
                  <div><h2>分类阅读占比</h2><p>最近 30 天，按阅读时长</p></div>
                  <button class="link-arrow" type="button" @click="goPanel('books')">图书管理</button>
                </div>
                <div class="viz-bars">
                  <div v-for="cat in overview?.categories || []" :key="cat.name" class="viz-bar-row">
                    <span class="viz-bar-row__label">{{ cat.name }}</span>
                    <span class="viz-bar-track"><i class="viz-bar-fill" :style="{ width: Math.round((cat.value / Math.max(1, ...(overview?.categories || []).map((c) => c.value))) * 100) + '%' }" /></span>
                    <span class="viz-bar-row__value">{{ cat.value }}%</span>
                  </div>
                </div>
                <p class="tiny muted" style="margin-top:16px;line-height:1.8">文学经典与诗歌散文合计占 47%。推荐配置中可提高“新鲜度”权重，帮助新书获得曝光。</p>
              </div>
            </div>

            <div class="admin-card admin-table-card">
              <div class="admin-card__head">
                <div><h2>待审书评</h2><p>按提交时间排序</p></div>
                <button class="link-arrow" type="button" @click="goPanel('reviews')">查看全部 <Icon name="arrow-right" /></button>
              </div>
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>书评</th><th>用户</th><th>书目</th><th>提交时间</th><th>状态</th></tr></thead>
                  <tbody>
                    <tr v-for="review in overview?.recentReviews || []" :key="review.id">
                      <td>{{ review.text }}</td>
                      <td>{{ review.user }}</td>
                      <td>{{ review.bookTitle }}</td>
                      <td class="table__num">{{ review.date }}</td>
                      <td><span class="badge badge--warn">{{ reviewLabel[review.status] || review.status }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section v-if="activePanel === 'books'" class="admin-panel is-active">
            <div class="section-title" style="margin-top:0">
              <div><h2>图书管理</h2><p>共 {{ books.length }} 本 · 支持按书名、作者与分类筛选</p></div>
              <button class="btn btn--accent btn--sm" type="button" @click="openCreateBook"><Icon name="plus" /> 新增图书</button>
            </div>
            <div class="admin-toolbar">
              <div class="admin-toolbar__left">
                <div class="search-box"><Icon name="magnifying-glass" /><input v-model="bookQuery" type="search" placeholder="搜索书名或作者" aria-label="搜索图书"></div>
                <select v-model="bookCategory" class="select" aria-label="按分类筛选">
                  <option value="all">全部分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <span class="tiny muted">封面由 CSS 生成 · 数据来自后端</span>
            </div>
            <div class="admin-card admin-table-card" style="padding:0">
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>图书</th><th>分类</th><th>评分</th><th>读者</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
                  <tbody>
                    <tr v-for="book in filteredBooks" :key="book.id">
                      <td>
                        <div class="row gap-10">
                          <span class="mini-cover" :class="'cover--' + (book.cover?.theme || 'bottle')">{{ book.title.slice(0, 1) }}</span>
                          <div><div style="font-family:var(--serif);font-size:14px">{{ book.title }}</div><div class="tiny muted">{{ book.author }}</div></div>
                        </div>
                      </td>
                      <td>{{ book.category }}</td>
                      <td class="table__num">{{ Number(book.rating).toFixed(1) }}</td>
                      <td class="table__num">{{ Number(book.readers || 0).toLocaleString() }}</td>
                      <td><span class="badge" :class="book.listed ? 'badge--good' : 'badge--bad'">{{ book.listed ? "上架" : "下架" }}</span></td>
                      <td><div class="table__actions">
                        <button class="btn btn--quiet btn--sm" type="button" @click="openEditBook(book)">编辑</button>
                        <button class="btn btn--quiet btn--sm" type="button" @click="toggleListed(book)">{{ book.listed ? "下架" : "上架" }}</button>
                      </div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section v-if="activePanel === 'users'" class="admin-panel is-active">
            <div class="section-title" style="margin-top:0">
              <div><h2>用户管理</h2><p>共 {{ users.length }} 位注册用户 · 按最近活跃排序</p></div>
              <button class="btn btn--ghost btn--sm" type="button" @click="ui.notify('用户 CSV 导出（演示）', 'download-simple')">导出 CSV</button>
            </div>
            <div class="admin-card admin-table-card" style="padding:0">
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>用户</th><th>角色</th><th>加入时间</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td><div class="row gap-10"><Avatar :name="user.name" size="sm" /><div><div style="font-size:13px">{{ user.name }}</div><div class="tiny muted">{{ user.email }}</div></div></div></td>
                      <td>{{ user.role === "ADMIN" ? "管理员" : "读者" }}</td>
                      <td>{{ user.joinedAt }}</td>
                      <td><span class="badge" :class="user.status === 'ACTIVE' ? 'badge--good' : 'badge--bad'">{{ user.status === "ACTIVE" ? "正常" : "禁言" }}</span></td>
                      <td><div class="table__actions"><button class="btn btn--quiet btn--sm" type="button" @click="toggleUser(user)">{{ user.status === "ACTIVE" ? "禁言" : "恢复" }}</button></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section v-if="activePanel === 'reviews'" class="admin-panel is-active">
            <div class="section-title" style="margin-top:0">
              <div><h2>书评审核</h2><p>通过后进入公开书评区；驳回会保留记录，便于申诉</p></div>
              <span class="badge badge--warn"><Icon name="warning-circle" /> 待审 {{ reviewCounts.PENDING }} 条</span>
            </div>
            <div class="admin-note" style="margin-bottom:16px"><Icon name="info" /><span>审核标准：是否针对本书、是否有具体阅读感受、是否包含剧透未标注、是否存在人身攻击。</span></div>
            <div class="admin-toolbar">
              <div class="filter-chips" role="group" aria-label="按状态筛选书评">
                <button v-for="option in reviewOptions" :key="option" class="chip" :class="{ 'is-active': reviewFilter === option }" type="button" @click="reviewFilter = option">
                  {{ option === "全部" ? "全部" : reviewLabel[option] }}<span class="chip__count">{{ reviewCounts[option] || 0 }}</span>
                </button>
              </div>
              <span class="tiny muted">通过后进入公开书评区</span>
            </div>
            <div class="admin-card admin-table-card" style="padding:0">
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>书评</th><th>提交时间</th><th>状态</th><th style="text-align:right">操作</th></tr></thead>
                  <tbody>
                    <tr v-for="review in filteredReviews" :key="review.id">
                      <td style="max-width:360px"><div style="font-size:13px">{{ review.text }}</div><div class="tiny muted">{{ review.user }} · 《{{ review.bookTitle }}》</div></td>
                      <td class="table__num">{{ review.date }}</td>
                      <td><span class="badge" :class="{ 'badge--warn': review.status === 'PENDING', 'badge--good': review.status === 'PASSED', 'badge--bad': review.status === 'REJECTED' }">{{ reviewLabel[review.status] }}</span></td>
                      <td><div class="table__actions">
                        <template v-if="review.status === 'PENDING'">
                          <button class="btn btn--quiet btn--sm" type="button" @click="moderate(review, true)">通过</button>
                          <button class="btn btn--quiet btn--sm" type="button" @click="moderate(review, false)">驳回</button>
                        </template>
                        <button v-else class="btn btn--quiet btn--sm" type="button" @click="reviewFilter = 'PENDING'">查看待审</button>
                      </div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section v-if="activePanel === 'recommend'" class="admin-panel is-active">
            <div class="section-title" style="margin-top:0">
              <div><h2>推荐配置</h2><p>调整混合推荐的排序权重，右侧实时预览 Top 6</p></div>
              <div class="row gap-10">
                <button class="btn btn--ghost btn--sm" type="button" @click="resetWeights"><Icon name="arrow-counter-clockwise" /> 恢复默认</button>
                <button class="btn btn--accent btn--sm" type="button" @click="saveWeights"><Icon name="check" /> 保存配置</button>
              </div>
            </div>
            <div class="admin-note" style="margin-bottom:18px"><Icon name="info" /><span>初始权重由 AHP 层次分析法给出。调整后会按总和自动归一化；正式版中权重按用户分群分别保存，并记录变更日志。</span></div>
            <div class="rec-config">
              <div class="admin-card">
                <div class="admin-card__head"><div><h2>排序信号权重</h2><p>拖动滑块，预览会立即更新</p></div></div>
                <div class="weight-list">
                  <div class="weight-row"><label for="wContent">内容相似</label><input id="wContent" v-model.number="weights.content" type="range" min="0" max="100"><output>{{ weights.content }}%</output></div>
                  <div class="weight-row"><label for="wCf">协同信号</label><input id="wCf" v-model.number="weights.cf" type="range" min="0" max="100"><output>{{ weights.cf }}%</output></div>
                  <div class="weight-row"><label for="wPopularity">站内热度</label><input id="wPopularity" v-model.number="weights.popularity" type="range" min="0" max="100"><output>{{ weights.popularity }}%</output></div>
                  <div class="weight-row"><label for="wFreshness">新鲜度</label><input id="wFreshness" v-model.number="weights.freshness" type="range" min="0" max="100"><output>{{ weights.freshness }}%</output></div>
                </div>
                <div class="weight-sum"><span>权重合计</span><span><strong>{{ weights.content + weights.cf + weights.popularity + weights.freshness }}</strong> · 自动归一化</span></div>
                <div class="formula" style="margin-top:16px"><strong>排序公式</strong><br><code>{{ formulaText }}</code></div>
                <div class="rec-flow">
                  <div class="rec-flow__step"><span>01</span><div><strong>召回</strong><p>内容相似 + ItemCF 各取 50 个候选，合并去重</p></div></div>
                  <div class="rec-flow__step"><span>02</span><div><strong>排序</strong><p>AHP 权重加权，TOPSIS 计算与理想解的贴近度</p></div></div>
                  <div class="rec-flow__step"><span>03</span><div><strong>重排</strong><p>MMR 控制多样性；新用户走标签冷启动</p></div></div>
                  <div class="rec-flow__step"><span>04</span><div><strong>缓存</strong><p>每日 03:00 离线计算，按用户分群写入推荐表</p></div></div>
                </div>
                <button class="btn btn--ghost btn--sm" type="button" style="margin-top:16px" @click="rebuild">手动重算推荐</button>
              </div>
              <div class="admin-card">
                <div class="admin-card__head"><div><h2>推荐结果预览</h2><p>全库加权排序 · 未做多样性重排</p></div><span class="chart__legend"><i /> 相关性得分</span></div>
                <div class="rec-preview">
                  <div v-for="(item, i) in preview" :key="item.book.id" class="rec-preview__item">
                    <span class="rec-preview__rank">{{ String(i + 1).padStart(2, "0") }}</span>
                    <span class="mini-cover" :class="'cover--' + (item.book.cover?.theme || 'bottle')">{{ item.book.title.slice(0, 1) }}</span>
                    <div><div class="rec-preview__title">{{ item.book.title }}</div><div class="rec-preview__meta">{{ item.book.author }} · {{ item.book.category }}</div></div>
                    <span class="rec-preview__bar"><i :style="{ width: Math.round(item.score * 100) + '%' }" /></span>
                    <span class="rec-preview__score">{{ (item.score * 100).toFixed(1) }}</span>
                  </div>
                </div>
                <p class="tiny muted" style="margin-top:14px;line-height:1.8">正式版会把结果写入 <code>user_recommendation</code> 表，并按用户分群缓存。</p>
              </div>
            </div>
          </section>
        </template>
      </main>
    </div>

    <ModalShell :open="bookModalOpen" :title="editingId ? '编辑图书' : '新增图书'" subtitle="保存后会写入 MySQL" wide @close="bookModalOpen = false">
      <form class="stack gap-16" @submit.prevent="saveBook">
        <div class="grid grid--2" style="gap:12px">
          <div class="field"><label for="newTitle">书名</label><input id="newTitle" v-model="bookForm.title" class="input" required></div>
          <div class="field"><label for="newAuthor">作者</label><input id="newAuthor" v-model="bookForm.author" class="input" required></div>
        </div>
        <div class="grid grid--2" style="gap:12px">
          <div class="field">
            <label for="newCategory">分类</label>
            <select id="newCategory" v-model="bookForm.categoryId" class="select">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="field"><label for="newRating">评分</label><input id="newRating" v-model.number="bookForm.rating" type="number" min="0" max="10" step="0.1" class="input"></div>
        </div>
        <div class="grid grid--2" style="gap:12px">
          <div class="field"><label for="newWords">字数</label><input id="newWords" v-model="bookForm.words" class="input"></div>
          <div class="field"><label for="newYear">出版年份</label><input id="newYear" v-model.number="bookForm.publishedYear" type="number" class="input"></div>
        </div>
        <div class="grid grid--2" style="gap:12px">
          <div class="field"><label for="newTags">标签（逗号分隔）</label><input id="newTags" v-model="bookForm.tagsText" class="input" placeholder="原创，海边"></div>
          <div class="field">
            <label for="newStatus">连载状态</label>
            <select id="newStatus" v-model="bookForm.status" class="select"><option value="连载">连载</option><option value="完结">完结</option></select>
          </div>
        </div>
        <div class="grid grid--2" style="gap:12px">
          <div class="field"><label for="newCoverTheme">封面配色</label>
            <select id="newCoverTheme" v-model="bookForm.coverTheme" class="select">
              <option v-for="theme in ['bottle','oxblood','ink','navy','mustard','paper','plum','slate']" :key="theme" :value="theme">{{ theme }}</option>
            </select>
          </div>
          <div class="field"><label for="newCoverPattern">封面纹理</label>
            <select id="newCoverPattern" v-model="bookForm.coverPattern" class="select">
              <option v-for="pattern in ['letter','rules','rings','grid','arch','bands']" :key="pattern" :value="pattern">{{ pattern }}</option>
            </select>
          </div>
        </div>
        <div class="field"><label for="newBlurb">一句话简介</label><input id="newBlurb" v-model="bookForm.blurb" class="input"></div>
        <div class="field"><label for="newIntro">介绍</label><textarea id="newIntro" v-model="bookForm.intro" class="textarea" /></div>
        <div class="row between wrap gap-10">
          <span class="tiny muted">新增图书默认上架；编辑时会保留未修改的字段。</span>
          <button class="btn btn--accent" type="submit">保存图书</button>
        </div>
      </form>
    </ModalShell>
  </div>
</template>
