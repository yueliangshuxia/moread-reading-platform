/* 墨阅 MoRead — shared application shell and helpers */
(function () {
  "use strict";

  const DATA = window.MOREAD_DATA;
  const MOREAD = (window.MOREAD = {});

  const THEMES = ["bottle", "oxblood", "ink", "navy", "mustard", "paper", "plum", "slate"];
  const PATTERNS = ["letter", "rules", "rings", "grid", "arch", "bands"];

  const NAV = [
    { id: "home", label: "首页", icon: "house", href: "index.html" },
    { id: "discover", label: "书库", icon: "compass", href: "discover.html" },
    { id: "shelf", label: "书架", icon: "bookmark-simple", href: "shelf.html" },
    { id: "community", label: "共读", icon: "chat-circle", href: "community.html" },
    { id: "profile", label: "我的", icon: "user-circle", href: "profile.html" }
  ];

  const PAGE_TITLES = {
    home: "首页",
    discover: "书库",
    book: "书籍详情",
    reader: "阅读",
    shelf: "我的书架",
    community: "共读",
    profile: "个人中心",
    admin: "管理后台",
    login: "登录",
    "404": "页面未找到"
  };

  const ACTIVE_MAP = { book: "discover", reader: "shelf" };

  /* -------------------------------------------------------
     tiny utilities
     ------------------------------------------------------- */

  function icon(name, cls) {
    return '<iconify-icon icon="ph:' + name + '"' + (cls ? ' class="' + cls + '"' : "") + ' aria-hidden="true"></iconify-icon>';
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  function pick(list, seed) { return list[seed % list.length]; }

  function bookById(id) { return DATA.books.find((b) => b.id === id) || DATA.books[0]; }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function formatNum(n) {
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + " 万";
    return String(n);
  }

  function stars(rating) {
    return '<span class="rating"><span class="rating__star">★</span>' + Number(rating).toFixed(1) + "</span>";
  }

  function avatar(name, extra) {
    const idx = Math.abs(hash(name || "读")) % 6;
    const initial = (name || "读").slice(0, 1);
    return '<span class="avatar avatar--' + idx + (extra ? " " + extra : "") + '" aria-hidden="true">' + escapeHTML(initial) + "</span>";
  }

  /* -------------------------------------------------------
     localStorage state
     ------------------------------------------------------- */

  const DEFAULT_SHELF = {
    reading: ["hulanhezhuan", "shanhaizhijian"],
    want: ["renjiancihua", "waerdengchu", "xishuda"],
    finished: ["zhaohuaxishi", "xiaowangzi"]
  };

  const DEFAULT_PROGRESS = {
    hulanhezhuan: { percent: 42, chapter: 3, label: "第三章 · 团圆媳妇", updated: "今天 09:24" },
    shanhaizhijian: { percent: 18, chapter: 2, label: "第二章 · 老屋", updated: "昨天 22:10" },
    xiaowangzi: { percent: 100, chapter: 9, label: "第九章 · 回家", updated: "10 月 8 日" }
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* private mode */ }
  }

  function getShelf() {
    const shelf = readJSON("moread.shelf", null);
    if (shelf && Array.isArray(shelf.reading)) return shelf;
    return JSON.parse(JSON.stringify(DEFAULT_SHELF));
  }

  function saveShelf(shelf) {
    writeJSON("moread.shelf", shelf);
    document.dispatchEvent(new CustomEvent("moread:shelfchange", { detail: shelf }));
  }

  function shelfBucket(id) {
    const shelf = getShelf();
    for (const key of ["reading", "want", "finished"]) {
      if (shelf[key].includes(id)) return key;
    }
    return null;
  }

  function addToShelf(id, bucket) {
    const shelf = getShelf();
    const current = shelfBucket(id);
    if (current) {
      if (current === bucket) {
        shelf[current] = shelf[current].filter((x) => x !== id);
        saveShelf(shelf);
        return { action: "removed", bucket: current };
      }
      shelf[current] = shelf[current].filter((x) => x !== id);
    }
    const target = bucket || "want";
    shelf[target].push(id);
    saveShelf(shelf);
    return { action: "added", bucket: target };
  }

  function getProgress() {
    return readJSON("moread.progress", null) || JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  }

  function progressFor(id) {
    return getProgress()[id] || null;
  }

  function setProgress(id, payload) {
    const all = getProgress();
    all[id] = payload;
    writeJSON("moread.progress", all);
  }

  function getNotes() {
    return readJSON("moread.notes", []);
  }

  function addNote(note) {
    const notes = getNotes();
    notes.unshift(note);
    writeJSON("moread.notes", notes);
    return notes;
  }

  /* -------------------------------------------------------
     cover renderers
     ------------------------------------------------------- */

  function coverTheme(book) {
    return (book.cover && book.cover.theme) || pick(THEMES, hash(book.id));
  }

  function coverPattern(book) {
    return (book.cover && book.cover.pattern) || pick(PATTERNS, hash(book.id + "p"));
  }

  function titleClass(title) {
    if (title.length > 6) return " is-xlong";
    if (title.length > 4) return " is-long";
    return "";
  }

  function coverHTML(book) {
    const theme = coverTheme(book);
    const pattern = coverPattern(book);
    const title = escapeHTML(book.title);
    return (
      '<div class="cover cover--' + theme + " cover--" + pattern + '" data-mark="' +
      escapeHTML(book.title.slice(0, 1)) + '" role="img" aria-label="《' + title + '》封面">' +
      '<span class="cover__series">' + (book.original ? "墨阅 · 原创" : "墨阅 · 经典") + "</span>" +
      '<span class="cover__title' + titleClass(book.title) + '">' + title + "</span>" +
      '<span class="cover__author">' + escapeHTML(book.author) + "</span>" +
      '<span class="cover__seal">阅</span>' +
      "</div>"
    );
  }

  function miniCover(book) {
    const theme = coverTheme(book);
    return '<span class="mini-cover cover--' + theme + '">' + escapeHTML(book.title.slice(0, 1)) + "</span>";
  }

  function spineHTML(book, opts) {
    const o = opts || {};
    const height = o.height || 268;
    const width = o.width || 46;
    const delay = o.delay || 0;
    return (
      '<a class="spine cover--' + coverTheme(book) + " cover--" + coverPattern(book) + '" ' +
      'href="book.html?id=' + encodeURIComponent(book.id) + '" ' +
      'style="--h:' + height + "px;--w:" + width + "px;--delay:" + delay + 'ms" ' +
      'aria-label="《' + escapeHTML(book.title) + '》，' + escapeHTML(book.author) + '">' +
      '<span class="spine__title">' + escapeHTML(book.title) + "</span>" +
      '<span class="spine__author">' + escapeHTML(book.author) + "</span>" +
      '<span class="spine__tip"><strong>' + escapeHTML(book.title) + "</strong>" +
      escapeHTML(book.author) + " · " + Number(book.rating).toFixed(1) + " 分</span>" +
      "</a>"
    );
  }

  function bookCardHTML(book) {
    const id = encodeURIComponent(book.id);
    return (
      '<article class="book-card">' +
      '<div class="book-card__cover">' +
      '<a href="book.html?id=' + id + '" aria-label="查看《' + escapeHTML(book.title) + '》">' + coverHTML(book) + "</a>" +
      '<div class="book-card__quick">' +
      '<button class="quick-btn" type="button" data-shelf-add="' + escapeHTML(book.id) + '">' + icon("bookmark-simple") + " 加入书架</button>" +
      '<a class="quick-btn" href="reader.html?id=' + id + '">' + icon("book-open") + " 试读</a>" +
      "</div></div>" +
      '<div class="book-card__info">' +
      '<h3 class="book-card__title"><a href="book.html?id=' + id + '">' + escapeHTML(book.title) + "</a></h3>" +
      '<p class="book-card__author">' + escapeHTML(book.author) + "</p>" +
      '<div class="book-card__foot">' + stars(book.rating) +
      '<span class="book-card__cat">' + escapeHTML(book.category) + "</span></div>" +
      "</div></article>"
    );
  }

  function bookRowHTML(book) {
    const id = encodeURIComponent(book.id);
    return (
      '<article class="book-row">' +
      '<a class="book-row__cover" href="book.html?id=' + id + '">' + coverHTML(book) + "</a>" +
      '<div class="book-row__body">' +
      '<a class="book-row__title" href="book.html?id=' + id + '">' + escapeHTML(book.title) + "</a>" +
      '<p class="book-row__blurb">' + escapeHTML(book.blurb) + "</p>" +
      '<div class="book-row__meta"><span>' + escapeHTML(book.author) + "</span><span>" + escapeHTML(book.category) + "</span><span>" + escapeHTML(book.words) + "</span></div>" +
      "</div>" +
      '<div class="book-row__actions">' + stars(book.rating) +
      '<a class="btn btn--ghost btn--sm" href="reader.html?id=' + id + '">试读</a></div>' +
      "</article>"
    );
  }

  /* -------------------------------------------------------
     theme
     ------------------------------------------------------- */

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("moread.theme", theme); } catch (err) { /* private mode */ }
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-label", theme === "dark" ? "切换到日间模式" : "切换到夜间模式");
      btn.innerHTML = icon(theme === "dark" ? "sun" : "moon");
    });
  }

  function toggleTheme() { applyTheme(currentTheme() === "dark" ? "light" : "dark"); }

  /* -------------------------------------------------------
     shell
     ------------------------------------------------------- */

  const PAGE = document.body.dataset.page || "home";
  const CHROME = document.body.dataset.chrome || "full";
  const activeNav = ACTIVE_MAP[PAGE] || PAGE;

  function railHTML() {
    const links = NAV.map((item) =>
      '<a class="rail-link' + (activeNav === item.id ? " is-active" : "") + '" href="' + item.href + '"' +
      (activeNav === item.id ? ' aria-current="page"' : "") + ">" +
      icon(item.icon) + '<span class="rail-link__label">' + item.label + "</span></a>"
    ).join("");
    return (
      '<aside class="rail" aria-label="主导航">' +
      '<a class="rail__brand" href="index.html" aria-label="墨阅首页">' +
      '<span class="rail__seal">阅</span><span class="rail__word">墨阅</span></a>' +
      '<nav class="rail__nav">' + links + "</nav>" +
      '<div class="rail__bottom">' +
      '<button class="rail-btn" type="button" data-open-search aria-label="搜索">' + icon("magnifying-glass") + "</button>" +
      '<button class="rail-btn" type="button" data-theme-toggle aria-label="切换主题"></button>' +
      "</div></aside>"
    );
  }

  function topbarHTML() {
    const title = PAGE_TITLES[PAGE] || "墨阅";
    const crumb = PAGE === "home"
      ? "阅读，是一种慢慢发生的改变"
      : '<a href="index.html">首页</a> / <span>' + escapeHTML(title) + "</span>";
    return (
      '<header class="topbar"><div class="topbar__inner">' +
      '<div class="topbar__left">' +
      '<a class="mobile-brand" href="index.html"><span class="rail__seal" style="width:28px;height:28px;font-size:16px">阅</span><span>墨阅</span></a>' +
      '<div class="topbar__crumb">' + crumb + "</div></div>" +
      '<div class="topbar__right">' +
      '<button class="topbar__search" type="button" data-open-search>' + icon("magnifying-glass") +
      "<span>搜索书名、作者</span><kbd>/</kbd></button>" +
      '<button class="icon-btn" type="button" data-theme-toggle aria-label="切换主题"></button>' +
      '<a class="user-chip" href="profile.html"><span class="avatar avatar--1">林</span><span>林见鹿</span></a>' +
      "</div></div></header>"
    );
  }

  function mobileNavHTML() {
    return '<nav class="mobile-nav" aria-label="移动端导航">' + NAV.map((item) =>
      '<a class="' + (activeNav === item.id ? "is-active" : "") + '" href="' + item.href + '">' +
      icon(item.icon) + "<span>" + item.label + "</span></a>"
    ).join("") + "</nav>";
  }

  function footerHTML() {
    return (
      '<footer class="footer"><div class="footer__inner">' +
      '<div class="footer__brand">' +
      '<div class="footer__brand-row"><span class="rail__seal" style="background:var(--oxblood);color:#f4e9d8">阅</span>墨阅 MoRead</div>' +
      "<p>把找书、读书、记书连在一起。一个为深度阅读而做的数字书房。</p>" +
      "</div>" +
      '<div class="footer__cols">' +
      '<div class="footer__col"><h4>探索</h4><a href="discover.html">全部书库</a><a href="community.html">本周共读</a><a href="shelf.html">我的书架</a></div>' +
      '<div class="footer__col"><h4>关于</h4><a href="book.html?id=zhaohuaxishi">关于墨阅</a><a href="community.html">社区公约</a><a href="profile.html">个人中心</a></div>' +
      '<div class="footer__col"><h4>演示</h4><a href="admin.html">管理后台</a><a href="login.html">登录 / 注册</a><a href="404.html">404 页面</a></div>' +
      "</div></div>" +
      '<div class="footer__base"><span>© 2026 墨阅 MoRead · 本站为毕业设计静态演示，书籍与用户数据均为虚构或公共领域内容。</span>' +
      '<span>插画 unDraw · 摄影 Pexels · 图标 Iconify (Phosphor) · 占位图 Picsum Photos</span></div></footer>'
    );
  }

  function injectChrome() {
    if (CHROME !== "full") return;
    const railMount = document.getElementById("site-rail");
    if (railMount) railMount.innerHTML = railHTML();
    const app = document.querySelector(".app");
    if (app) {
      const top = document.createElement("div");
      top.id = "site-topbar";
      top.innerHTML = topbarHTML();
      app.insertBefore(top, app.firstChild);
      const foot = document.getElementById("site-footer");
      if (foot) foot.innerHTML = footerHTML();
    }
    document.body.insertAdjacentHTML("beforeend", mobileNavHTML());
  }

  /* -------------------------------------------------------
     search overlay
     ------------------------------------------------------- */

  let searchState = { items: [], cursor: -1 };

  function searchOverlayHTML() {
    return (
      '<div class="search-overlay" id="searchOverlay" hidden>' +
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="搜索书籍">' +
      '<div class="search-panel__head">' + icon("magnifying-glass") +
      '<input class="search-panel__input" id="searchInput" type="search" autocomplete="off" placeholder="搜索书名、作者或标签…" aria-label="搜索书名、作者或标签">' +
      '<button class="icon-btn" type="button" data-close-search aria-label="关闭搜索">' + icon("x") + "</button></div>" +
      '<div class="search-panel__results" id="searchResults"></div>' +
      '<div class="search-panel__foot"><span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span><span>共 ' + DATA.books.length + " 本书</span></div>" +
      "</div></div>"
    );
  }

  function renderSearchResults(query) {
    const box = document.getElementById("searchResults");
    if (!box) return;
    const q = (query || "").trim().toLowerCase();
    let items;
    if (!q) {
      items = DATA.books.filter((b) => b.featured).slice(0, 6);
    } else {
      items = DATA.books.filter((b) =>
        (b.title + " " + b.author + " " + b.category + " " + b.tags.join(" ")).toLowerCase().includes(q)
      ).slice(0, 8);
    }
    searchState.items = items;
    searchState.cursor = items.length ? 0 : -1;
    if (!items.length) {
      box.innerHTML = '<div class="search-empty">没有找到与“' + escapeHTML(query) + '”相关的书。<br>试试作者名或更短的关键词。</div>';
      return;
    }
    box.innerHTML = items.map((book, i) =>
      '<a class="search-result' + (i === 0 ? " is-cursor" : "") + '" href="book.html?id=' + encodeURIComponent(book.id) + '" data-index="' + i + '">' +
      miniCover(book) +
      '<span><span class="search-result__title">' + escapeHTML(book.title) + "</span>" +
      '<span class="search-result__meta">' + escapeHTML(book.author) + " · " + escapeHTML(book.category) + "</span></span>" +
      '<span class="rating"><span class="rating__star">★</span>' + Number(book.rating).toFixed(1) + "</span></a>"
    ).join("");
  }

  function openSearch() {
    const overlay = document.getElementById("searchOverlay");
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    renderSearchResults("");
    const input = document.getElementById("searchInput");
    if (input) { input.value = ""; setTimeout(() => input.focus(), 30); }
  }

  function closeSearch() {
    const overlay = document.getElementById("searchOverlay");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function moveSearchCursor(delta) {
    if (searchState.cursor < 0) return;
    const rows = document.querySelectorAll(".search-result");
    if (!rows.length) return;
    searchState.cursor = (searchState.cursor + delta + rows.length) % rows.length;
    rows.forEach((row, i) => row.classList.toggle("is-cursor", i === searchState.cursor));
    rows[searchState.cursor].scrollIntoView({ block: "nearest" });
  }

  function bindSearch() {
    if (!document.getElementById("searchOverlay")) {
      document.body.insertAdjacentHTML("beforeend", searchOverlayHTML());
    }
    const overlay = document.getElementById("searchOverlay");
    const input = document.getElementById("searchInput");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.closest("[data-close-search]")) closeSearch();
    });
    input.addEventListener("input", (e) => renderSearchResults(e.target.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); moveSearchCursor(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveSearchCursor(-1); }
      else if (e.key === "Enter") {
        const row = document.querySelector(".search-result.is-cursor");
        if (row) { e.preventDefault(); window.location.href = row.getAttribute("href"); }
      }
    });
    document.addEventListener("keydown", (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault(); openSearch();
      }
      if (e.key === "Escape") closeSearch();
    });
  }

  /* -------------------------------------------------------
     toast & misc
     ------------------------------------------------------- */

  let toastTimer = null;

  function toast(message, iconName) {
    let el = document.getElementById("moreadToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "moreadToast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.innerHTML = icon(iconName || "check-circle") + "<span>" + escapeHTML(message) + "</span>";
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 2400);
  }

  function bindShelfButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-shelf-add]");
      if (!btn) return;
      e.preventDefault();
      const id = btn.getAttribute("data-shelf-add");
      const book = bookById(id);
      const result = addToShelf(id, "want");
      if (result.action === "added") toast("已加入书架：《" + book.title + "》", "bookmark-simple");
      else toast("已从书架移除：《" + book.title + "》", "bookmark-simple");
      btn.innerHTML = icon("bookmark-simple") + (result.action === "added" ? " 已在书架" : " 加入书架");
    });
  }

  function initIcons() {
    const apply = () => {
      if (window.MOREAD_ICONS) {
        const el = customElements.get("iconify-icon");
        if (el && el.addCollection) el.addCollection(window.MOREAD_ICONS);
      }
    };
    if (customElements.get("iconify-icon")) apply();
    else customElements.whenDefined("iconify-icon").then(apply);
  }

  function init() {
    initIcons();
    injectChrome();
    bindSearch();
    bindShelfButtons();
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-theme-toggle]")) toggleTheme();
      if (e.target.closest("[data-open-search]")) openSearch();
    });
    applyTheme(currentTheme());
    document.documentElement.classList.add("is-ready");
  }

  /* -------------------------------------------------------
     exports
     ------------------------------------------------------- */

  Object.assign(MOREAD, {
    data: DATA,
    icon: icon,
    escape: escapeHTML,
    cover: coverHTML,
    miniCover: miniCover,
    spine: spineHTML,
    bookCard: bookCardHTML,
    bookRow: bookRowHTML,
    avatar: avatar,
    stars: stars,
    formatNum: formatNum,
    bookById: bookById,
    getParam: getParam,
    toast: toast,
    theme: { current: currentTheme, apply: applyTheme, toggle: toggleTheme },
    shelf: { get: getShelf, add: addToShelf, bucket: shelfBucket, save: saveShelf },
    progress: { get: getProgress, for: progressFor, set: setProgress },
    notes: { get: getNotes, add: addNote },
    search: { open: openSearch, close: closeSearch }
  });

  init();
})();
