<script setup>
import { computed } from "vue";

const props = defineProps({
  book: { type: Object, required: true },
  height: { type: Number, default: 268 },
  width: { type: Number, default: 46 },
  delay: { type: Number, default: 0 }
});

const theme = computed(() => props.book.cover?.theme || "bottle");
const pattern = computed(() => props.book.cover?.pattern || "letter");
</script>

<template>
  <RouterLink
    class="spine"
    :class="['cover--' + theme, 'cover--' + pattern]"
    :to="'/book/' + book.id"
    :style="{ '--h': height + 'px', '--w': width + 'px', '--delay': delay + 'ms' }"
    :aria-label="'《' + book.title + '》，' + book.author"
  >
    <span class="spine__title">{{ book.title }}</span>
    <span class="spine__author">{{ book.author }}</span>
    <span class="spine__tip">
      <strong>{{ book.title }}</strong>{{ book.author }} · {{ Number(book.rating || 0).toFixed(1) }} 分
    </span>
  </RouterLink>
</template>
