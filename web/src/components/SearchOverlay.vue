<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useUiStore } from "../stores/ui";
import { booksApi } from "../api/books";
import BookCover from "./BookCover.vue";
import Icon from "./Icon.vue";

const ui = useUiStore();
const router = useRouter();
const input = ref(null);
const query = ref("");
const results = ref([]);
const cursor = ref(0);
let debounce = null;

async function load(text) {
  try {
    const page = await booksApi.list({
      q: text || undefined,
      size: 8,
      sort: text ? "recommend" : "rating"
    });
    results.value = page.content || [];
    cursor.value = 0;
  } catch (e) {
    results.value = [];
  }
}

watch(() => ui.searchOpen, async (open) => {
  if (!open) return;
  query.value = "";
  await nextTick();
  input.value?.focus();
  load("");
});

function onInput() {
  clearTimeout(debounce);
  debounce = setTimeout(() => load(query.value.trim()), 220);
}

function choose(index) {
  const book = results.value[index];
  if (!book) return;
  ui.closeSearch();
  router.push(`/book/${book.id}`);
}

function onKeydown(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    cursor.value = (cursor.value + 1) % Math.max(results.value.length, 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    cursor.value = (cursor.value - 1 + Math.max(results.value.length, 1)) % Math.max(results.value.length, 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    choose(cursor.value);
  } else if (e.key === "Escape") {
    ui.closeSearch();
  }
}

function globalKey(e) {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
  if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    ui.openSearch();
  } else if (e.key === "Escape") {
    ui.closeSearch();
  }
}

onMounted(() => document.addEventListener("keydown", globalKey));
onBeforeUnmount(() => document.removeEventListener("keydown", globalKey));
</script>

<template>
  <Teleport to="body">
    <div v-if="ui.searchOpen" class="search-overlay" @click.self="ui.closeSearch()">
      <div class="search-panel" role="dialog" aria-modal="true" aria-label="搜索书籍">
        <div class="search-panel__head">
          <Icon name="magnifying-glass" />
          <input
            ref="input"
            v-model="query"
            class="search-panel__input"
            type="search"
            autocomplete="off"
            placeholder="搜索书名、作者或标签…"
            aria-label="搜索书名、作者或标签"
            @input="onInput"
            @keydown="onKeydown"
          >
          <button class="icon-btn" type="button" aria-label="关闭搜索" @click="ui.closeSearch()">
            <Icon name="x" />
          </button>
        </div>
        <div class="search-panel__results">
          <div v-if="!results.length" class="search-empty">
            没有找到与“{{ query }}”相关的书。<br>试试作者名或更短的关键词。
          </div>
          <a
            v-for="(book, i) in results"
            :key="book.id"
            class="search-result"
            :class="{ 'is-cursor': i === cursor }"
            href="#"
            @mouseenter="cursor = i"
            @click.prevent="choose(i)"
          >
            <BookCover :book="book" />
            <span>
              <span class="search-result__title">{{ book.title }}</span>
              <span class="search-result__meta">{{ book.author }} · {{ book.category }}</span>
            </span>
            <span class="rating"><span class="rating__star">★</span>{{ Number(book.rating || 0).toFixed(1) }}</span>
          </a>
        </div>
        <div class="search-panel__foot">
          <span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span>
          <span><kbd>Enter</kbd> 打开</span>
          <span><kbd>Esc</kbd> 关闭</span>
          <span>共 27 本书</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
