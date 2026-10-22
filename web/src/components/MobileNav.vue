<script setup>
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";

const route = useRoute();
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
  <nav class="mobile-nav" aria-label="移动端导航">
    <RouterLink
      v-for="item in nav"
      :key="item.id"
      :to="item.to"
      :class="{ 'is-active': isActive(item) }"
    >
      <Icon :name="item.icon" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
