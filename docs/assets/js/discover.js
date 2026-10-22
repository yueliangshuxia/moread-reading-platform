/* 墨阅 MoRead — discover / library */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;

  const params = new URLSearchParams(window.location.search);
  const state = {
    cat: params.get("cat") || "all",
    q: params.get("q") || "",
    list: params.get("list") || "",
    sort: "recommend",
    view: "grid",
    free: false
  };

  const banner = document.getElementById("listBanner");

  function currentList() {
    return state.list ? D.booklists.find((l) => l.id === state.list) : null;
  }

  function baseBooks() {
    const list = currentList();
    return list ? D.books.filter((b) => list.bookIds.includes(b.id)) : D.books;
  }

  const chipsBox = document.getElementById("categoryChips");
  const searchInput = document.getElementById("librarySearch");
  const sortSelect = document.getElementById("sortSelect");
  const freeToggle = document.getElementById("freeOnly");
  const results = document.getElementById("bookResults");
  const countBox = document.getElementById("resultCount");
  const summaryBox = document.getElementById("resultSummary");

  if (searchInput) searchInput.value = state.q;

  function categoryCount(id) {
    const pool = baseBooks();
    if (id === "all") return pool.length;
    return pool.filter((b) => b.categoryId === id).length;
  }

  function renderBanner() {
    if (!banner) return;
    const list = currentList();
    if (!list) { banner.innerHTML = ""; return; }
    banner.innerHTML =
      '<div class="list-banner"><div><p class="kicker">编辑书单</p>' +
      "<h2>" + M.escape(list.title) + "</h2>" +
      "<p>" + M.escape(list.desc) + "</p></div>" +
      '<button class="btn btn--quiet btn--sm list-banner__clear" type="button" data-clear-list>退出书单</button></div>';
    const clear = banner.querySelector("[data-clear-list]");
    if (clear) {
      clear.addEventListener("click", () => {
        state.list = "";
        state.cat = "all";
        syncURL();
        render();
      });
    }
  }

  function renderChips() {
    if (!chipsBox) return;
    const items = [{ id: "all", name: "全部" }].concat(D.categories)
      .filter((cat) => !state.list || cat.id === "all" || categoryCount(cat.id) > 0);
    chipsBox.innerHTML = items.map((cat) =>
      '<button class="chip' + (state.cat === cat.id ? " is-active" : "") + '" type="button" data-cat="' + cat.id + '">' +
      M.escape(cat.name) + '<span class="chip__count">' + categoryCount(cat.id) + "</span></button>"
    ).join("");
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = baseBooks().filter((b) => {
      if (state.cat !== "all" && b.categoryId !== state.cat) return false;
      if (state.free && !b.free) return false;
      if (q) {
        const hay = (b.title + " " + b.author + " " + b.category + " " + b.tags.join(" ") + " " + b.blurb).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (state.sort === "rating") list = list.slice().sort((a, b) => b.rating - a.rating);
    else if (state.sort === "readers") list = list.slice().sort((a, b) => b.readers - a.readers);
    else if (state.sort === "year") list = list.slice().sort((a, b) => b.year - a.year);
    else list = list.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
    return list;
  }

  function render() {
    renderChips();
    renderBanner();
    const list = filtered();

    if (countBox) countBox.textContent = list.length;
    if (summaryBox) {
      const catName = state.cat === "all" ? "全部书目" : (D.categories.find((c) => c.id === state.cat) || {}).name;
      const extra = state.q ? " · 搜索“" + state.q + "”" : "";
      const listName = currentList() ? "书单《" + currentList().title + "》 · " : "";
      summaryBox.textContent = listName + catName + extra + (state.free ? " · 仅免费" : "");
    }

    if (!results) return;
    results.className = state.view === "grid" ? "book-grid" : "book-list";
    if (!list.length) {
      results.innerHTML =
        '<div class="empty">' +
        '<img src="assets/img/undraw/open-book_pet1.svg" alt="一本摊开的书">' +
        "<h3>这一格书架还是空的</h3>" +
        "<p>没有找到符合条件的书。换一个分类，或者把搜索词缩短一点。</p>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-clear-filters>清除筛选</button>' +
        "</div>";
      return;
    }
    results.innerHTML = state.view === "grid"
      ? list.map((b) => M.bookCard(b)).join("")
      : list.map((b) => M.bookRow(b)).join("");
  }

  function syncURL() {
    const u = new URL(window.location.href);
    if (state.cat === "all") u.searchParams.delete("cat"); else u.searchParams.set("cat", state.cat);
    if (state.q) u.searchParams.set("q", state.q); else u.searchParams.delete("q");
    if (state.list) u.searchParams.set("list", state.list); else u.searchParams.delete("list");
    history.replaceState(null, "", u.pathname + (u.search ? u.search : ""));
  }

  if (chipsBox) {
    chipsBox.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.cat = btn.getAttribute("data-cat");
      syncURL();
      render();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.q = e.target.value;
      syncURL();
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });
  }

  if (freeToggle) {
    freeToggle.addEventListener("change", (e) => {
      state.free = e.target.checked;
      render();
    });
  }

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.getAttribute("data-view");
      document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
      render();
    });
  });

  if (results) {
    results.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear-filters]")) return;
      state.cat = "all";
      state.q = "";
      state.list = "";
      state.free = false;
      if (searchInput) searchInput.value = "";
      if (freeToggle) freeToggle.checked = false;
      syncURL();
      render();
    });
  }

  render();
})();
