/* 墨阅 MoRead — login / register */
(function () {
  "use strict";
  const M = window.MOREAD;
  let mode = "login";

  const tabs = document.querySelectorAll("[data-auth-tab]");
  const nameField = document.getElementById("nameField");
  const title = document.getElementById("authTitle");
  const sub = document.getElementById("authSub");
  const submit = document.getElementById("authSubmit");
  const email = document.getElementById("authEmail");
  const password = document.getElementById("authPassword");
  const name = document.getElementById("authName");
  const error = document.getElementById("authError");

  function setMode(next) {
    mode = next;
    tabs.forEach((t) => t.classList.toggle("is-active", t.getAttribute("data-auth-tab") === mode));
    if (nameField) nameField.hidden = mode === "login";
    if (title) title.textContent = mode === "login" ? "欢迎回到墨阅" : "在墨阅留一个位置";
    if (sub) sub.textContent = mode === "login" ? "继续上次的阅读，或者从书架里挑一本新的。" : "注册后可以保存书架、笔记与阅读进度。演示版数据只保存在本机。";
    if (submit) submit.textContent = mode === "login" ? "登录" : "创建账号";
    if (error) error.textContent = "";
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.getAttribute("data-auth-tab"))));

  function validate() {
    const e = email.value.trim();
    const p = password.value;
    if (mode === "register" && name.value.trim().length < 2) return "请输入至少 2 个字的昵称";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "请输入有效的邮箱地址";
    if (p.length < 6) return "密码至少 6 位";
    return "";
  }

  const form = document.getElementById("authForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const msg = validate();
      if (msg) { if (error) error.textContent = msg; return; }
      if (error) error.textContent = "";
      const isAdmin = email.value.trim().toLowerCase() === "admin@moread.cn";
      try {
        localStorage.setItem("moread.user", JSON.stringify({
          name: mode === "register" ? name.value.trim() : (isAdmin ? "管理员" : "林见鹿"),
          email: email.value.trim(),
          role: isAdmin ? "admin" : "reader"
        }));
      } catch (err) { /* ignore */ }
      M.toast(mode === "login" ? "登录成功，正在进入书房…" : "账号已创建，正在进入书房…", "check-circle");
      setTimeout(() => { window.location.href = isAdmin ? "admin.html" : "index.html"; }, 650);
    });
  }

  document.querySelectorAll("[data-demo-account]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.getAttribute("data-demo-account");
      if (kind === "admin") {
        email.value = "admin@moread.cn";
        password.value = "admin123";
      } else {
        email.value = "reader@moread.cn";
        password.value = "123456";
      }
      setMode("login");
      if (error) error.textContent = "";
    });
  });

  setMode("login");
})();
