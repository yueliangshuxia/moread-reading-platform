<script setup>
import { useRoute } from "vue-router";
import { useUiStore } from "../stores/ui";
import Icon from "./Icon.vue";

const route = useRoute();
const ui = useUiStore();

const nav = [
  { id: "home", label: "首页", icon: "house", to: "/" },
  { id: "discover", label: "书库", icon: "compass", to: "/discover" },
  { id: "shelf", label: "书架", icon: "bookmark-simple", to: "/shelf" },
  { id: "community", label: "共读", icon: "chat-circle", to: "/community" },
  { id: "profile", label: "我的", icon: "user-circle", to: "/profile" }
];

function isActive(item) {
  return route.meta.nav === item.id || (!route.meta.nav && route.name === item.id);
}
</script>

<template>
  <aside class="rail" aria-label="主导航">
    <RouterLink class="rail__brand" to="/" aria-label="墨阅首页">
      <span class="rail__seal">阅</span>
      <span class="rail__word">墨阅</span>
    </RouterLink>
    <nav class="rail__nav">
      <RouterLink
        v-for="item in nav"
        :key="item.id"
        :to="item.to"
        class="rail-link"
        :class="{ 'is-active': isActive(item) }"
      >
        <Icon :name="item.icon" />
        <span class="rail-link__label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="rail__bottom">
      <button class="rail-btn" type="button" aria-label="搜索" @click="ui.openSearch()">
        <Icon name="magnifying-glass" />
      </button>
      <button class="rail-btn" type="button" aria-label="切换主题" @click="ui.toggleTheme()">
        <Icon :name="ui.theme === 'dark' ? 'sun' : 'moon'" />
      </button>
    </div>
  </aside>
</template>
