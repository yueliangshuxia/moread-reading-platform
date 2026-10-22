import { createApp } from "vue";
import { createPinia } from "pinia";

import "./assets/css/tokens.css";
import "./assets/css/base.css";
import "./assets/css/components.css";
import "./assets/css/pages.css";
import "./assets/css/reader.css";
import "./assets/css/admin.css";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import { useUiStore } from "./stores/ui";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const ui = useUiStore(pinia);
ui.initTheme();

const auth = useAuthStore(pinia);
auth.init().finally(() => {
  app.use(router);
  app.mount("#app");
});

window.addEventListener("moread:unauthorized", () => {
  const route = router.currentRoute.value;
  if (route.meta.requiresAuth && route.name !== "login") {
    router.push({ name: "login", query: { redirect: route.fullPath } });
  }
});

customElements.whenDefined("iconify-icon").then(() => {
  const el = customElements.get("iconify-icon");
  if (el && el.addCollection && window.MOREAD_ICONS) {
    el.addCollection(window.MOREAD_ICONS);
  }
});
