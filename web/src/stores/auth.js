import { defineStore } from "pinia";
import { authApi } from "../api/auth";

function storedUser() {
  try { return JSON.parse(localStorage.getItem("moread.user") || "null"); }
  catch (e) { return null; }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("moread.token") || "",
    user: storedUser(),
    ready: false
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role === "ADMIN"
  },
  actions: {
    async init() {
      window.addEventListener("moread:unauthorized", () => this.logout(false));
      if (!this.token) {
        this.ready = true;
        return;
      }
      try {
        await this.me();
      } catch (e) {
        this.logout(false);
      } finally {
        this.ready = true;
      }
    },
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem("moread.token", token);
      localStorage.setItem("moread.user", JSON.stringify(user));
    },
    async login(email, password) {
      const data = await authApi.login({ email, password });
      this.setAuth(data.token, data.user);
      return data;
    },
    async register(name, email, password) {
      const data = await authApi.register({ name, email, password });
      this.setAuth(data.token, data.user);
      return data;
    },
    async me() {
      const user = await authApi.me();
      this.user = user;
      localStorage.setItem("moread.user", JSON.stringify(user));
      return user;
    },
    logout(notify = true) {
      this.token = "";
      this.user = null;
      localStorage.removeItem("moread.token");
      localStorage.removeItem("moread.user");
      if (notify) window.dispatchEvent(new Event("moread:logout"));
    }
  }
});
