import { defineStore } from "pinia";

let toastTimer = null;

function storedTheme() {
  try { return localStorage.getItem("moread.theme") === "dark" ? "dark" : "light"; }
  catch (e) { return "light"; }
}

export const useUiStore = defineStore("ui", {
  state: () => ({
    theme: storedTheme(),
    toast: { show: false, message: "", icon: "check-circle" },
    searchOpen: false
  }),
  actions: {
    initTheme() {
      document.documentElement.setAttribute("data-theme", this.theme);
    },
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("moread.theme", this.theme); } catch (e) { /* ignore */ }
      document.documentElement.setAttribute("data-theme", this.theme);
    },
    notify(message, icon = "check-circle") {
      this.toast = { show: true, message, icon };
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { this.toast.show = false; }, 2400);
    },
    openSearch() { this.searchOpen = true; },
    closeSearch() { this.searchOpen = false; }
  }
});
