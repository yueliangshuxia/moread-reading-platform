<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import Avatar from "./Avatar.vue";
import Icon from "./Icon.vue";

const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();

const title = computed(() => route.meta.title || "墨阅");
const crumb = computed(() => route.name === "home" ? "阅读，是一种慢慢发生的改变" : `首页 / ${title.value}`);
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <div class="topbar__left">
        <RouterLink class="mobile-brand" to="/">
          <span class="rail__seal" style="width:28px;height:28px;font-size:16px">阅</span>
          <span>墨阅</span>
        </RouterLink>
        <div class="topbar__crumb">
          <template v-if="route.name === 'home'">{{ crumb }}</template>
          <template v-else>
            <RouterLink to="/">首页</RouterLink> / <span>{{ title }}</span>
          </template>
        </div>
      </div>
      <div class="topbar__right">
        <button class="topbar__search" type="button" @click="ui.openSearch()">
          <Icon name="magnifying-glass" />
          <span>搜索书名、作者</span>
          <kbd>/</kbd>
        </button>
        <button class="icon-btn" type="button" aria-label="切换主题" @click="ui.toggleTheme()">
          <Icon :name="ui.theme === 'dark' ? 'sun' : 'moon'" />
        </button>
        <RouterLink v-if="auth.isLoggedIn" class="user-chip" to="/profile">
          <Avatar :name="auth.user?.name || '读'" size="sm" />
          <span>{{ auth.user?.name || "读者" }}</span>
        </RouterLink>
        <RouterLink v-else class="btn btn--ghost btn--sm" to="/login">登录 / 注册</RouterLink>
      </div>
    </div>
  </header>
</template>
