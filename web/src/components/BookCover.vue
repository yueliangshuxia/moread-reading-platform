<script setup>
import { computed } from "vue";

const props = defineProps({
  book: { type: Object, required: true }
});

const theme = computed(() => props.book.cover?.theme || "bottle");
const pattern = computed(() => props.book.cover?.pattern || "letter");
const titleClass = computed(() => {
  const n = (props.book.title || "").length;
  if (n > 6) return "is-xlong";
  if (n > 4) return "is-long";
  return "";
});
</script>

<template>
  <div
    class="cover"
    :class="['cover--' + theme, 'cover--' + pattern]"
    :data-mark="(book.title || '书').slice(0, 1)"
    role="img"
    :aria-label="'《' + book.title + '》封面'"
  >
    <span class="cover__series">{{ book.original ? "墨阅 · 原创" : "墨阅 · 经典" }}</span>
    <span class="cover__title" :class="titleClass">{{ book.title }}</span>
    <span class="cover__author">{{ book.author }}</span>
    <span class="cover__seal">阅</span>
  </div>
</template>
