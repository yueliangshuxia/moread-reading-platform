<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { booksApi } from "../api/books";
import { catalogApi } from "../api/catalog";
import { useUiStore } from "../stores/ui";
import BookCard from "../components/BookCard.vue";
import BookRow from "../components/BookRow.vue";
import EmptyState from "../components/EmptyState.vue";
import Icon from "../components/Icon.vue";

const route = useRoute();
const ui = useUiStore();

const categories = ref([]);
const booklists = ref([]);
const listInfo = ref(null);
const books = ref([]);
const total = ref(0);
const loading = ref(false);
let searchTimer = null;

const filters = reactive({
  q: route.query.q || "",
  cat: route.query.cat || "all",
  sort: "recommend",
  free: false,
  view: "grid",
  list: route.query.list || ""
});

const chips = computed(() => {
  const pool = filters.list && listInfo.value ? listInfo.value.books || [] : null;
  const items = [{
    id: "all",
    name: "全部",
    count: pool ? pool.length : categories.value.reduce((sum, c) => sum + Number(c.count || 0), 0)
  }];
  for (const cat of categories.value) {
    const count = pool ? pool.filter((b) => b.categoryId === cat.id).length : cat.count;
    if (!pool || count > 0) items.push({ ...cat, count });
  }
  return items;
});

const summary = computed(() => {
  const listName = listInfo.value ? `书单《${listInfo.value.title}》 · ` : "";
  const catName = filters.cat === "all" ? "全部书目" : (categories.value.find((c) => c.id === filters.cat)?.name || "全部书目");
  const extra = filters.q ? ` · 搜索“${filters.q}”` : "";
  return listName + catName + extra + (filters.free ? " · 仅免费" : "");
});

async function loadMeta() {
  try {
    categories.value = await catalogApi.categories();
    booklists.value = await catalogApi.booklists();
    listInfo.value = filters.list ? await catalogApi.booklist(filters.list) : null;
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function loadBooks() {
  loading.value = true;
  try {
    const page = await booksApi.list({
      q: filters.q || undefined,
      category: filters.cat !== "all" ? filters.cat : undefined,
      sort: filters.sort,
      free: filters.free || undefined,
      list: filters.list || undefined,
      size: 100
    });
    books.value = page.content || [];
    total.value = page.total || 0;
  } catch (e) {
    ui.notify(e.message, "info");
    books.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadBooks, 220);
}

function selectCategory(id) {
  filters.cat = id;
  loadBooks();
}

async function clearList() {
  filters.list = "";
  filters.cat = "all";
  listInfo.value = null;
  await loadMeta();
  await loadBooks();
}

function clearFilters() {
  filters.q = "";
  filters.cat = "all";
  filters.free = false;
  filters.list = "";
  listInfo.value = null;
  loadMeta();
  loadBooks();
}

onMounted(async () => {
  await loadMeta();
  await loadBooks();
});

// 从书单点进书库、或点侧栏“书库”清空 query 时，同步筛选状态。
watch(() => route.query, async (q) => {
  const nextQ = typeof q.q === "string" ? q.q : "";
  const nextCat = typeof q.cat === "string" ? q.cat : "all";
  const nextList = typeof q.list === "string" ? q.list : "";
  if (nextQ === filters.q && nextCat === filters.cat && nextList === filters.list) return;
  filters.q = nextQ;
  filters.cat = nextCat;
  filters.list = nextList;
  await loadMeta();
  await loadBooks();
});
</script>

<template>
  <main id="main" class="main">
    <header class="page-head">
      <div class="page-head__main">
        <p class="kicker">全部藏书</p>
        <h1>书库</h1>
        <p class="page-head__meta">27 本书 · 8 个分类 · 推荐每天 6:00 更新 · 支持按书名、作者与标签检索</p>
      </div>
      <div class="page-head__aside">
        <div class="search-box" style="width:280px;max-width:100%">
          <Icon name="magnifying-glass" />
          <label class="sr-only" for="librarySearch">搜索书库</label>
          <input id="librarySearch" v-model="filters.q" type="search" placeholder="搜索书名、作者或标签" autocomplete="off" @input="onSearchInput">
        </div>
      </div>
    </header>

    <div v-if="listInfo" class="list-banner">
      <div>
        <p class="kicker">编辑书单</p>
        <h2>{{ listInfo.title }}</h2>
        <p>{{ listInfo.description }}</p>
      </div>
      <button class="btn btn--quiet btn--sm list-banner__clear" type="button" @click="clearList">退出书单</button>
    </div>

    <div class="filter-bar">
      <div class="filter-chips" role="group" aria-label="按分类筛选">
        <button
          v-for="cat in chips"
          :key="cat.id"
          class="chip"
          :class="{ 'is-active': filters.cat === cat.id }"
          type="button"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}<span class="chip__count">{{ cat.count }}</span>
        </button>
      </div>
      <div class="filter-tools">
        <label class="switch" title="只看可免费阅读的书">
          <input v-model="filters.free" type="checkbox" @change="loadBooks">
          <span class="switch__track"><span class="switch__thumb" /></span>
          <span>仅免费</span>
        </label>
        <label class="sr-only" for="sortSelect">排序方式</label>
        <select id="sortSelect" v-model="filters.sort" class="select" @change="loadBooks">
          <option value="recommend">推荐排序</option>
          <option value="rating">评分最高</option>
          <option value="readers">读者最多</option>
          <option value="year">出版最新</option>
        </select>
        <div class="view-toggle" role="group" aria-label="视图切换">
          <button type="button" :class="{ 'is-active': filters.view === 'grid' }" aria-label="网格视图" @click="filters.view = 'grid'">
            <Icon name="columns" />
          </button>
          <button type="button" :class="{ 'is-active': filters.view === 'list' }" aria-label="列表视图" @click="filters.view = 'list'">
            <Icon name="rows" />
          </button>
        </div>
      </div>
    </div>

    <div class="result-meta">
      <span>{{ summary }}</span>
      <span>共 <strong>{{ total }}</strong> 本</span>
    </div>

    <div v-if="filters.view === 'grid'" class="book-grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
      <EmptyState
        v-if="!loading && !books.length"
        title="这一格书架还是空的"
        copy="没有找到符合条件的书。换一个分类，或者把搜索词缩短一点。"
      >
        <button class="btn btn--ghost btn--sm" type="button" @click="clearFilters">清除筛选</button>
      </EmptyState>
    </div>
    <div v-else class="book-list">
      <BookRow v-for="book in books" :key="book.id" :book="book" />
      <EmptyState
        v-if="!loading && !books.length"
        title="没有匹配的书"
        copy="换一个分类，或者把搜索词缩短一点。"
      >
        <button class="btn btn--ghost btn--sm" type="button" @click="clearFilters">清除筛选</button>
      </EmptyState>
    </div>
  </main>
</template>
