/* 墨阅 MoRead — admin demo */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;

  const TITLES = { overview: "概览", books: "图书管理", users: "用户管理", reviews: "书评审核", recommend: "推荐配置" };
  const adminTitle = document.getElementById("adminTitle");
  let extraBooks = [];

  /* nav ------------------------------------------------------- */
  document.querySelectorAll("[data-admin-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-admin-nav");
      document.querySelectorAll("[data-admin-nav]").forEach((b) => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-panel") === key));
      if (adminTitle) adminTitle.textContent = TITLES[key] || "管理后台";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-goto-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector('[data-admin-nav="' + btn.getAttribute("data-goto-panel") + '"]');
      if (target) target.click();
    });
  });

  /* KPIs ------------------------------------------------------ */
  let reviewRows = D.adminReviews.map((r) => Object.assign({}, r));
  let reviewFilter = "全部";
  function pendingCount() { return reviewRows.filter((r) => r.status === "待审").length; }

  function renderKpis() {
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set("kpiUsers", D.stats.kpis.users.toLocaleString("en-US"));
    set("kpiBooks", String(D.stats.kpis.books));
    set("kpiMinutes", D.stats.kpis.todayMinutes.toLocaleString("en-US"));
    set("kpiPending", String(pendingCount()));
    const inline = document.getElementById("reviewPendingInline");
    if (inline) inline.textContent = String(pendingCount());
  }

  /* line chart ------------------------------------------------ */
  function renderLineChart() {
    const svg = document.getElementById("activeChart");
    if (!svg) return;
    const data = D.stats.weeklyActive;
    const labels = D.stats.weeklyLabels;
    const W = 640, H = 250;
    const pad = { l: 46, r: 18, t: 22, b: 36 };
    const max = Math.ceil(Math.max.apply(null, data) / 200) * 200;
    const step = (W - pad.l - pad.r) / (data.length - 1);
    const x = (i) => pad.l + i * step;
    const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
    const peak = data.indexOf(Math.max.apply(null, data));

    let grid = "";
    for (let i = 0; i <= 4; i += 1) {
      const val = (max / 4) * i;
      const yy = y(val);
      grid += '<line x1="' + pad.l + '" y1="' + yy + '" x2="' + (W - pad.r) + '" y2="' + yy + '"></line>';
      grid += '<text class="viz-axis" x="' + (pad.l - 10) + '" y="' + (yy + 3) + '" text-anchor="end">' + Math.round(val) + "</text>";
    }
    const line = data.map((v, i) => (i === 0 ? "M" : "L") + x(i) + " " + y(v)).join(" ");
    const area = line + " L" + x(data.length - 1) + " " + (H - pad.b) + " L" + x(0) + " " + (H - pad.b) + " Z";
    const dots = data.map((v, i) =>
      '<circle class="viz-dot' + (i === peak ? " viz-dot--peak" : "") + '" cx="' + x(i) + '" cy="' + y(v) + '" r="' + (i === peak ? 5 : 4) + '"></circle>'
    ).join("");
    const xLabels = labels.map((l, i) => '<text class="viz-axis" x="' + x(i) + '" y="' + (H - 12) + '" text-anchor="middle">' + l + "</text>").join("");
    const peakLabel = '<text class="viz-label viz-label--value" x="' + x(peak) + '" y="' + (y(data[peak]) - 13) + '" text-anchor="middle">' + data[peak] + "</text>";

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML =
      '<g class="viz-grid">' + grid + "</g>" +
      '<path class="viz-area" d="' + area + '"></path>' +
      '<path class="viz-line-path" d="' + line + '"></path>' +
      '<g>' + dots + "</g>" + peakLabel +
      '<g class="viz-axis">' + xLabels + "</g>" +
      '<line class="viz-crosshair" id="vizCrosshair" x1="0" y1="' + pad.t + '" x2="0" y2="' + (H - pad.b) + '"></line>' +
      '<circle id="vizHoverDot" r="5" fill="var(--chart-hue)" stroke="var(--paper)" stroke-width="2" opacity="0"></circle>' +
      '<rect class="viz-hit" x="' + pad.l + '" y="' + pad.t + '" width="' + (W - pad.l - pad.r) + '" height="' + (H - pad.t - pad.b) + '"></rect>';

    const tip = document.getElementById("vizTip");
    const cross = svg.querySelector("#vizCrosshair");
    const hoverDot = svg.querySelector("#vizHoverDot");
    const hit = svg.querySelector(".viz-hit");

    hit.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      let idx = Math.round((px - pad.l) / step);
      idx = Math.max(0, Math.min(data.length - 1, idx));
      cross.setAttribute("x1", x(idx)); cross.setAttribute("x2", x(idx)); cross.style.opacity = "1";
      hoverDot.setAttribute("cx", x(idx)); hoverDot.setAttribute("cy", y(data[idx])); hoverDot.style.opacity = "1";
      if (tip) {
        tip.innerHTML = labels[idx] + " · 活跃读者 <strong>" + data[idx] + "</strong> 人";
        tip.style.left = e.clientX + "px";
        tip.style.top = (e.clientY - 14) + "px";
        tip.classList.add("is-on");
      }
    });
    hit.addEventListener("mouseleave", () => {
      cross.style.opacity = "0"; hoverDot.style.opacity = "0";
      if (tip) tip.classList.remove("is-on");
    });

    const table = document.getElementById("activeTable");
    if (table) {
      table.innerHTML = "<table><thead><tr><th>日期</th><th>活跃读者</th></tr></thead><tbody>" +
        data.map((v, i) => "<tr><td>" + labels[i] + "</td><td>" + v + "</td></tr>").join("") +
        "</tbody></table>";
    }
  }

  /* category bars --------------------------------------------- */
  function renderCategoryBars() {
    const box = document.getElementById("categoryBars");
    if (!box) return;
    const list = D.stats.categoryDistribution;
    const max = Math.max.apply(null, list.map((x) => x.value));
    box.innerHTML = list.map((c) =>
      '<div class="viz-bar-row"><span class="viz-bar-row__label">' + M.escape(c.name) + "</span>" +
      '<span class="viz-bar-track"><i class="viz-bar-fill" style="width:' + Math.round((c.value / max) * 100) + '%"></i></span>' +
      '<span class="viz-bar-row__value">' + c.value + "%</span></div>"
    ).join("");
  }

  /* books table ----------------------------------------------- */
  let bookQuery = "";
  let bookCat = "all";

  function renderBooks() {
    const body = document.getElementById("bookTableBody");
    if (!body) return;
    const q = bookQuery.trim().toLowerCase();
    const allBooks = extraBooks.concat(D.books);
    const countEl = document.getElementById("bookCount");
    if (countEl) countEl.textContent = String(allBooks.length);
    const rows = allBooks.filter((b) => {
      if (bookCat !== "all" && b.categoryId !== bookCat) return false;
      if (q && !(b.title + " " + b.author).toLowerCase().includes(q)) return false;
      return true;
    });
    body.innerHTML = rows.map((b) =>
      "<tr><td><div class=\"row gap-10\">" + M.miniCover(b) +
      '<div><div style="font-family:var(--serif);font-size:14px">' + M.escape(b.title) + '</div><div class="tiny muted">' + M.escape(b.author) + "</div></div></div></td>" +
      "<td>" + M.escape(b.category) + "</td>" +
      '<td class="table__num">' + Number(b.rating).toFixed(1) + "</td>" +
      '<td class="table__num">' + M.formatNum(b.readers) + "</td>" +
      '<td><span class="badge badge--good">上架</span></td>' +
      '<td><div class="table__actions"><button class="btn btn--quiet btn--sm" type="button" data-edit-book="' + b.id + '">编辑</button>' +
      '<button class="btn btn--quiet btn--sm" type="button" data-off-book="' + b.id + '">下架</button></div></td></tr>'
    ).join("") || '<tr><td colspan="6" class="muted" style="padding:30px;text-align:center">没有匹配的图书</td></tr>';
    body.querySelectorAll("[data-edit-book]").forEach((btn) => btn.addEventListener("click", () => M.toast("编辑面板将在正式版开放", "pencil-simple")));
    body.querySelectorAll("[data-off-book]").forEach((btn) => btn.addEventListener("click", () => M.toast("演示版不执行下架操作", "info")));
  }

  const bookSearch = document.getElementById("bookSearch");
  if (bookSearch) bookSearch.addEventListener("input", (e) => { bookQuery = e.target.value; renderBooks(); });
  const bookFilter = document.getElementById("bookCategory");
  if (bookFilter) {
    bookFilter.innerHTML = '<option value="all">全部分类</option>' +
      D.categories.map((c) => '<option value="' + c.id + '">' + M.escape(c.name) + "</option>").join("");
    bookFilter.addEventListener("change", (e) => { bookCat = e.target.value; renderBooks(); });
  }

  /* users table ----------------------------------------------- */
  function renderUsers() {
    const body = document.getElementById("userTableBody");
    if (!body) return;
    body.innerHTML = D.adminUsers.map((u) =>
      '<tr><td><div class="row gap-10">' + M.avatar(u.name, "avatar--sm") +
      '<div><div style="font-size:13px">' + M.escape(u.name) + '</div><div class="tiny muted">' + M.escape(u.email) + "</div></div></div></td>" +
      "<td>" + M.escape(u.role) + "</td>" +
      "<td>" + M.escape(u.joined) + "</td>" +
      '<td><span class="badge ' + (u.status === "正常" ? "badge--good" : "badge--bad") + '">' + M.escape(u.status) + "</span></td>" +
      '<td><div class="table__actions"><button class="btn btn--quiet btn--sm" type="button" data-user-toggle="' + M.escape(u.name) + '">' + (u.status === "正常" ? "禁言" : "恢复") + "</button></div></td></tr>"
    ).join("");
    body.querySelectorAll("[data-user-toggle]").forEach((btn) => btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-user-toggle");
      const user = D.adminUsers.find((x) => x.name === name);
      if (!user) return;
      user.status = user.status === "正常" ? "禁言" : "正常";
      renderUsers();
      M.toast("用户状态已更新", "check-circle");
    }));
  }

  /* reviews table --------------------------------------------- */
  function renderReviewFilter() {
    const box = document.getElementById("reviewFilter");
    if (!box) return;
    const options = ["全部", "待审", "已通过", "已驳回"];
    box.innerHTML = options.map((name) => {
      const count = name === "全部" ? reviewRows.length : reviewRows.filter((r) => r.status === name).length;
      return '<button class="chip' + (reviewFilter === name ? " is-active" : "") + '" type="button" data-review-filter="' + name + '">' +
        name + '<span class="chip__count">' + count + "</span></button>";
    }).join("");
    box.querySelectorAll("[data-review-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        reviewFilter = btn.getAttribute("data-review-filter");
        renderReviewFilter();
        renderReviews();
      });
    });
  }

  function renderReviews() {
    const body = document.getElementById("reviewTableBody");
    if (!body) return;
    const rows = reviewFilter === "全部" ? reviewRows : reviewRows.filter((r) => r.status === reviewFilter);
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4" class="muted" style="padding:30px;text-align:center">当前筛选下没有书评</td></tr>';
      return;
    }
    body.innerHTML = rows.map((r) => {
      const cls = r.status === "待审" ? "badge--warn" : r.status === "已通过" ? "badge--good" : "badge--bad";
      return "<tr><td style=\"max-width:360px\"><div style=\"font-size:13px\">" + M.escape(r.text) + '</div><div class="tiny muted">' + M.escape(r.user) + " · 《" + M.escape(r.book) + "》</div></td>" +
        '<td class="table__num">' + M.escape(r.date) + "</td>" +
        '<td><span class="badge ' + cls + '">' + M.escape(r.status) + "</span></td>" +
        '<td><div class="table__actions">' +
        (r.status === "待审"
          ? '<button class="btn btn--quiet btn--sm" type="button" data-review-pass="' + r.id + '">通过</button><button class="btn btn--quiet btn--sm" type="button" data-review-reject="' + r.id + '">驳回</button>'
          : '<button class="btn btn--quiet btn--sm" type="button" data-review-reset="' + r.id + '">重置</button>') +
        "</div></td></tr>";
    }).join("");
    body.querySelectorAll("[data-review-pass]").forEach((btn) => btn.addEventListener("click", () => setReview(btn.getAttribute("data-review-pass"), "已通过")));
    body.querySelectorAll("[data-review-reject]").forEach((btn) => btn.addEventListener("click", () => setReview(btn.getAttribute("data-review-reject"), "已驳回")));
    body.querySelectorAll("[data-review-reset]").forEach((btn) => btn.addEventListener("click", () => setReview(btn.getAttribute("data-review-reset"), "待审")));
  }

  function setReview(id, status) {
    const row = reviewRows.find((r) => r.id === id);
    if (!row) return;
    row.status = status;
    renderReviews();
    renderReviewFilter();
    renderKpis();
    M.toast("书评状态已更新为「" + status + "」", "check-circle");
  }

  /* recommendation config ------------------------------------- */
  const sliders = {
    content: document.getElementById("wContent"),
    cf: document.getElementById("wCf"),
    popularity: document.getElementById("wPopularity"),
    freshness: document.getElementById("wFreshness")
  };
  const outputs = {
    content: document.getElementById("oContent"),
    cf: document.getElementById("oCf"),
    popularity: document.getElementById("oPopularity"),
    freshness: document.getElementById("oFreshness")
  };
  const DEFAULTS = { content: 35, cf: 30, popularity: 20, freshness: 15 };

  function weights() {
    const w = {};
    Object.keys(sliders).forEach((k) => { w[k] = sliders[k] ? Number(sliders[k].value) : DEFAULTS[k]; });
    const total = Object.values(w).reduce((a, b) => a + b, 0) || 1;
    const norm = {};
    Object.keys(w).forEach((k) => { norm[k] = w[k] / total; });
    return { raw: w, norm: norm, total: total };
  }

  function renderPreview() {
    const box = document.getElementById("recPreview");
    if (!box) return;
    const w = weights();
    Object.keys(outputs).forEach((k) => { if (outputs[k]) outputs[k].textContent = w.raw[k] + "%"; });
    const sumEl = document.getElementById("weightSum");
    if (sumEl) sumEl.textContent = w.total;
    const formula = document.getElementById("formulaText");
    if (formula) {
      formula.textContent = "score = " + w.norm.content.toFixed(2) + "·内容 + " + w.norm.cf.toFixed(2) + "·协同 + " +
        w.norm.popularity.toFixed(2) + "·热度 + " + w.norm.freshness.toFixed(2) + "·新鲜度";
    }
    const ranked = D.books.concat(extraBooks).map((b) => {
      const score = b.scores.content * w.norm.content + b.scores.cf * w.norm.cf +
        b.scores.popularity * w.norm.popularity + b.scores.freshness * w.norm.freshness;
      return { book: b, score: score };
    }).sort((a, b) => b.score - a.score).slice(0, 6);

    box.innerHTML = ranked.map((item, i) =>
      '<div class="rec-preview__item"><span class="rec-preview__rank">' + String(i + 1).padStart(2, "0") + "</span>" +
      M.miniCover(item.book) +
      '<div><div class="rec-preview__title">' + M.escape(item.book.title) + '</div><div class="rec-preview__meta">' + M.escape(item.book.author) + " · " + M.escape(item.book.category) + "</div></div>" +
      '<span class="rec-preview__bar"><i style="width:' + Math.round(item.score * 100) + '%"></i></span>' +
      '<span class="rec-preview__score">' + (item.score * 100).toFixed(1) + "</span></div>"
    ).join("");
  }

  Object.keys(sliders).forEach((k) => {
    if (sliders[k]) sliders[k].addEventListener("input", renderPreview);
  });

  const saveWeights = document.getElementById("saveWeights");
  if (saveWeights) {
    saveWeights.addEventListener("click", () => {
      try { localStorage.setItem("moread.weights", JSON.stringify(weights().raw)); } catch (err) { /* ignore */ }
      M.toast("推荐权重已保存到本机", "check-circle");
    });
  }
  const resetWeights = document.getElementById("resetWeights");
  if (resetWeights) {
    resetWeights.addEventListener("click", () => {
      try { localStorage.removeItem("moread.weights"); } catch (err) { /* ignore */ }
      Object.keys(sliders).forEach((k) => { if (sliders[k]) sliders[k].value = DEFAULTS[k]; });
      renderPreview();
      M.toast("已恢复默认权重", "arrows-clockwise");
    });
  }

  function loadSavedWeights() {
    try {
      const raw = localStorage.getItem("moread.weights");
      if (!raw) return;
      const saved = JSON.parse(raw);
      Object.keys(sliders).forEach((k) => {
        if (sliders[k] && typeof saved[k] === "number") sliders[k].value = saved[k];
      });
    } catch (err) { /* ignore */ }
  }

  /* add book modal -------------------------------------------- */
  function openBookModal() {
    const modal = document.getElementById("bookModal");
    if (!modal) return;
    const category = document.getElementById("newCategory");
    if (category && !category.options.length) {
      category.innerHTML = D.categories.map((c) => '<option value="' + c.id + '">' + M.escape(c.name) + "</option>").join("");
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => { const t = document.getElementById("newTitle"); if (t) t.focus(); }, 30);
  }

  function closeBookModal() {
    const modal = document.getElementById("bookModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function bindBookModal() {
    const addBtn = document.getElementById("addBookBtn");
    if (addBtn) addBtn.addEventListener("click", openBookModal);
    const modal = document.getElementById("bookModal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-close-book]")) closeBookModal();
    });
    const form = document.getElementById("bookForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newTitle").value.trim();
      const author = document.getElementById("newAuthor").value.trim();
      const categoryId = document.getElementById("newCategory").value;
      const rating = Number(document.getElementById("newRating").value) || 8.0;
      if (!title || !author) { M.toast("书名和作者不能为空", "info"); return; }
      const cat = D.categories.find((c) => c.id === categoryId) || D.categories[0];
      extraBooks.unshift({
        id: "local-" + Date.now(),
        title: title,
        author: author,
        category: cat.name,
        categoryId: cat.id,
        tags: [cat.name],
        rating: Math.min(10, Math.max(0, rating)),
        readers: 0,
        words: "10 万",
        year: 2026,
        status: "连载",
        free: true,
        cover: { theme: "bottle", pattern: "letter" },
        blurb: "新上架图书（演示数据）。",
        intro: "这本新书刚刚放进书房。正式版会在这里展示更完整的内容简介、作者信息与目录。",
        authorBio: "作者信息待补充。",
        chapters: ["第一章"],
        scores: { content: 0.32, cf: 0.22, popularity: 0.12, freshness: 0.34 },
        reason: "新书上架，给新声音一个位置",
        featured: false,
        original: true
      });
      closeBookModal();
      form.reset();
      renderBooks();
      renderPreview();
      M.toast("图书已添加（演示，刷新后重置）", "check-circle");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeBookModal();
    });
  }

  /* init ------------------------------------------------------ */
  loadSavedWeights();
  renderKpis();
  renderLineChart();
  renderCategoryBars();
  renderBooks();
  renderUsers();
  renderReviewFilter();
  renderReviews();
  renderPreview();
  bindBookModal();
})();
