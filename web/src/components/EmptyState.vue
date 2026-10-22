<script setup>
defineProps({
  image: { type: String, default: "/assets/img/undraw/open-book_pet1.svg" },
  alt: { type: String, default: "一本摊开的书" },
  title: { type: String, default: "这里还是空的" },
  copy: { type: String, default: "" }
});
</script>

<template>
  <div class="empty">
    <img :src="image" :alt="alt">
    <h3>{{ title }}</h3>
    <p v-if="copy">{{ copy }}</p>
    <slot />
  </div>
</template>
