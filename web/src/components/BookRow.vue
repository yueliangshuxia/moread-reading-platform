<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import BookCover from "./BookCover.vue";
import StarRating from "./StarRating.vue";

const props = defineProps({ book: { type: Object, required: true } });
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

function read() {
  if (!auth.isLoggedIn) {
    router.push({ name: "login", query: { redirect: route.fullPath } });
    return;
  }
  router.push(`/reader/${props.book.id}`);
}
</script>

<template>
  <article class="book-row">
    <RouterLink class="book-row__cover" :to="'/book/' + book.id">
      <BookCover :book="book" />
    </RouterLink>
    <div class="book-row__body">
      <RouterLink class="book-row__title" :to="'/book/' + book.id">{{ book.title }}</RouterLink>
      <p class="book-row__blurb">{{ book.blurb }}</p>
      <div class="book-row__meta">
        <span>{{ book.author }}</span>
        <span>{{ book.category }}</span>
        <span>{{ book.words }}</span>
      </div>
    </div>
    <div class="book-row__actions">
      <StarRating :rating="book.rating" />
      <button class="btn btn--ghost btn--sm" type="button" @click="read">试读</button>
    </div>
  </article>
</template>
