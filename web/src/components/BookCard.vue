<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { shelfApi } from "../api/shelf";
import BookCover from "./BookCover.vue";
import StarRating from "./StarRating.vue";
import Icon from "./Icon.vue";

const props = defineProps({ book: { type: Object, required: true } });
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();

function requireLogin() {
  if (auth.isLoggedIn) return true;
  router.push({ name: "login", query: { redirect: route.fullPath } });
  return false;
}

async function addShelf() {
  if (!requireLogin()) return;
  try {
    await shelfApi.set(props.book.id, "WANT");
    ui.notify(`已加入书架：《${props.book.title}》`, "bookmark-simple");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function read() {
  if (!requireLogin()) return;
  router.push(`/reader/${props.book.id}`);
}
</script>

<template>
  <article class="book-card">
    <div class="book-card__cover">
      <RouterLink :to="'/book/' + book.id" :aria-label="'查看《' + book.title + '》'">
        <BookCover :book="book" />
      </RouterLink>
      <div class="book-card__quick">
        <button class="quick-btn" type="button" @click="addShelf">
          <Icon name="bookmark-simple" /> 加入书架
        </button>
        <button class="quick-btn" type="button" @click="read">
          <Icon name="book-open" /> 试读
        </button>
      </div>
    </div>
    <div class="book-card__info">
      <h3 class="book-card__title">
        <RouterLink :to="'/book/' + book.id">{{ book.title }}</RouterLink>
      </h3>
      <p class="book-card__author">{{ book.author }}</p>
      <div class="book-card__foot">
        <StarRating :rating="book.rating" />
        <span class="book-card__cat">{{ book.category }}</span>
      </div>
    </div>
  </article>
</template>
