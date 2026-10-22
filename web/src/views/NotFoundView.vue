<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/Icon.vue";

const router = useRouter();
const query = ref("");

function search() {
  router.push({ path: "/discover", query: query.value.trim() ? { q: query.value.trim() } : {} });
}
</script>

<template>
  <main id="main" class="main">
    <section class="notfound">
      <img src="/assets/img/undraw/searching-everywhere_tffi.svg" alt="在地球仪上寻找一本书">
      <p class="kicker">404 · 页面未找到</p>
      <h1>这一页还没有被写下来</h1>
      <p>可能是链接换了位置，也可能是这本书还在路上。你可以回到书架，或者从书库重新找一本。</p>
      <div class="notfound__actions">
        <RouterLink class="btn btn--accent" to="/">回到首页</RouterLink>
        <RouterLink class="btn btn--ghost" to="/discover">去书库</RouterLink>
      </div>
      <form role="search" style="width:min(420px,100%);margin-top:8px" @submit.prevent="search">
        <label class="sr-only" for="notFoundInput">搜索书籍</label>
        <div class="search-box">
          <Icon name="magnifying-glass" />
          <input id="notFoundInput" v-model="query" type="search" placeholder="搜索书名、作者或标签" autocomplete="off">
        </div>
      </form>
    </section>
  </main>
</template>
