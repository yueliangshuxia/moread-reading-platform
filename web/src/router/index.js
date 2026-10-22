import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import HomeView from "../views/HomeView.vue";
import DiscoverView from "../views/DiscoverView.vue";
import BookView from "../views/BookView.vue";
import ReaderView from "../views/ReaderView.vue";
import ShelfView from "../views/ShelfView.vue";
import CommunityView from "../views/CommunityView.vue";
import ProfileView from "../views/ProfileView.vue";
import AdminView from "../views/AdminView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView, meta: { title: "首页", nav: "home" } },
  { path: "/discover", name: "discover", component: DiscoverView, meta: { title: "书库", nav: "discover" } },
  { path: "/book/:id", name: "book", component: BookView, meta: { title: "书籍详情", nav: "discover" } },
  { path: "/reader/:id", name: "reader", component: ReaderView, meta: { title: "阅读", chrome: "none", nav: "shelf", requiresAuth: true } },
  { path: "/shelf", name: "shelf", component: ShelfView, meta: { title: "我的书架", nav: "shelf", requiresAuth: true } },
  { path: "/community", name: "community", component: CommunityView, meta: { title: "共读", nav: "community" } },
  { path: "/profile", name: "profile", component: ProfileView, meta: { title: "个人中心", nav: "profile", requiresAuth: true } },
  { path: "/admin", name: "admin", component: AdminView, meta: { title: "管理后台", chrome: "admin", requiresAuth: true, requiresAdmin: true } },
  { path: "/login", name: "login", component: LoginView, meta: { title: "登录", chrome: "none" } },
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView, meta: { title: "页面未找到" } }
];

const router = createRouter({
  // 开发用 history；打包进 Spring Boot 静态资源后用 hash，免去服务端 SPA fallback。
  history: import.meta.env.PROD ? createWebHashHistory() : createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresAdmin && auth.isLoggedIn && auth.user && !auth.isAdmin) {
    return { name: "home" };
  }
  if (to.name === "login" && auth.isLoggedIn) {
    return { name: "home" };
  }
  return true;
});

export default router;
