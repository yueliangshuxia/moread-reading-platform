<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import SideRail from "./components/SideRail.vue";
import TopBar from "./components/TopBar.vue";
import SiteFooter from "./components/SiteFooter.vue";
import MobileNav from "./components/MobileNav.vue";
import SearchOverlay from "./components/SearchOverlay.vue";
import Toast from "./components/Toast.vue";

const route = useRoute();
const chrome = computed(() => route.meta.chrome || "full");
</script>

<template>
  <template v-if="chrome === 'full'">
    <a class="skip-link" href="#main">跳到正文</a>
    <SideRail />
    <div class="app">
      <TopBar />
      <router-view />
      <SiteFooter />
    </div>
    <MobileNav />
    <SearchOverlay />
  </template>
  <router-view v-else />
  <Toast />
</template>
