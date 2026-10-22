/* 墨阅 MoRead — book detail */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;
  const id = M.getParam("id") || "zhaohuaxishi";
  const book = M.bookById(id);

  const factorNames = [
    ["content", "内容相似"],
    ["cf", "协同信号"],
    ["popularity", "站内热度"],
    ["freshness", "新鲜度"]
  ];

  function userReviews() {
    try { return JSON.parse(localStorage.getItem("moread.userReviews") || "[]"); }
    catch (err) { return []; }
  }

  function saveUserReviews(list) {
    try { localStorage.setItem("moread.userReviews", JSON.stringify(list)); } catch (err) { /* ignore */ }
  }

  function allReviews() {
    return D.reviews.filter((r) => r.bookId === book.id)
      .concat(userReviews().filter((r) => r.bookId === book.id));
  }

  /* hero ------------------------------------------------------ */
  function renderHero() {
    const box = document.getElementById("bookHero");
    if (!box) return;
    const bucket = M.shelf.bucket(book.id);
    const bucketLabel = bucket === "reading" ? "在读" : bucket === "finished" ? "读完" : bucket === "want" ? "想读" : "加入书架";
    box.innerHTML =
      '<div class="book-hero">' +
      '<div class="book-hero__cover">' + M.cover(book) +
      '<div class="book-hero__cover-note"><span>' + (book.original ? "站内原创" : "公版经典") + "</span><span>墨阅精校 · 演示版</span></div></div>" +
      '<div class="book-hero__main">' +
      '<div class="row gap-10 wrap"><span class="tag tag--accent">' + M.escape(book.category) + "</span>" +
      (book.free ? '<span class="tag">免费阅读</span>' : '<span class="tag tag--brass">会员可读</span>') +
      (book.original ? '<span class="tag">站内原创</span>' : "") + "</div>" +
      '<h1 class="book-hero__title">' + M.escape(book.title) + "</h1>" +
      '<p class="book-hero__author">' + M.escape(book.author) + " 著</p>" +
      '<div class="book-hero__meta">' +
      '<span class="rating rating--lg"><span class="rating__star">★</span>' + Number(book.rating).toFixed(1) + " <small class=\"muted\">/ 10</small></span>" +
      "<span><strong>" + M.formatNum(book.readers) + "</strong> 人读过</span>" +
      "<span><strong>" + M.escape(book.words) + "</strong> 字</span>" +
      "<span><strong>" + book.year + "</strong> 年</span>" +
      "<span>" + M.escape(book.status) + "</span>" +
      "</div>" +
      '<div class="book-hero__tags">' + book.tags.map((t) => '<span class="tag">' + M.escape(t) + "</span>").join("") + "</div>" +
      '<p class="book-hero__blurb">' + M.escape(book.blurb) + "</p>" +
      '<div class="book-hero__actions">' +
      '<a class="btn btn--accent" href="reader.html?id=' + book.id + '">' + M.icon("book-open") + " 开始阅读</a>" +
      '<div class="shelf-menu">' +
      '<button class="btn btn--ghost" type="button" data-shelf-toggle aria-haspopup="true" aria-expanded="false">' +
      M.icon("bookmark-simple") + " <span>" + bucketLabel + "</span></button>" +
      '<div class="shelf-menu__list" hidden>' +
      '<button type="button" data-shelf-set="want">想读</button>' +
      '<button type="button" data-shelf-set="reading">在读</button>' +
      '<button type="button" data-shelf-set="finished">读完</button>' +
      (bucket ? '<button type="button" data-shelf-set="remove">移出书架</button>' : "") +
      "</div></div>" +
      '<button class="btn btn--quiet" type="button" id="jumpReview">' + M.icon("note-pencil") + " 写书评</button>" +
      "</div>" +
      '<div class="book-hero__reason">' + M.icon("sparkle") + "<span><strong>为你推荐：</strong>" + M.escape(book.reason) + "</span></div>" +
      "</div></div>";
  }

  /* tabs ------------------------------------------------------ */
  function renderTabs() {
    const reviews = allReviews();
    const tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach((tab) => {
      const key = tab.getAttribute("data-tab");
      if (key === "reviews") {
        const count = tab.querySelector(".tab__count");
        if (count) count.textContent = reviews.length;
      }
      if (key === "toc") {
        const count = tab.querySelector(".tab__count");
        if (count) count.textContent = (book.chapters || []).length;
      }
    });
    tabs.forEach((tab) => {
      tab.onclick = () => {
        const key = tab.getAttribute("data-tab");
        document.querySelectorAll("[data-tab]").forEach((t) => t.classList.toggle("is-active", t === tab));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("is-active", p.id === "panel-" + key));
      };
    });
  }

  /* intro ----------------------------------------------------- */
  function renderIntro() {
    const box = document.getElementById("panel-intro");
    if (!box) return;
    const note = D.notes.find((n) => n.bookId === book.id);
    const quote = (note && note.quote) || book.blurb;
    const days = Math.max(3, Math.ceil(parseFloat(book.words) / 0.8));
    const same = D.books.filter((b) => b.id !== book.id && b.categoryId === book.categoryId).slice(0, 3);
    box.innerHTML =
      '<div class="prose">' +
      '<p class="lead">' + M.escape(book.blurb) + "</p>" +
      "<p>" + M.escape(book.intro) + "</p>" +
      '<blockquote class="book-quote">“' + M.escape(quote) + "”</blockquote>" +
      '<h3 class="book-subhead">本书看点</h3>' +
      '<ul class="book-points">' +
      "<li><strong>语言</strong><span>" + M.escape(book.author) + "的文字以" + M.escape(book.tags[0]) + "见长，适合放慢速度读。</span></li>" +
      "<li><strong>适合</strong><span>" + (book.original ? "站内原创，适合想听见新声音的读者。" : "公版经典，适合第一次系统阅读" + M.escape(book.category) + "的读者。") + "</span></li>" +
      "<li><strong>节奏</strong><span>全书 " + M.escape(book.words) + " 字，按每天 20 分钟计，约 " + days + " 天可以读完。</span></li>" +
      "</ul>" +
      '<div class="row gap-6 wrap" style="margin-top:20px">' + book.tags.map((t) => '<span class="tag">' + M.escape(t) + "</span>").join("") + "</div>" +
      "</div>" +
      (same.length ? '<div class="book-more"><h3 class="book-subhead">读过这本书的人也在读</h3>' + same.map((b) => M.bookRow(b)).join("") + "</div>" : "");
  }

  /* chapters -------------------------------------------------- */
  function renderChapters() {
    const box = document.getElementById("panel-toc");
    if (!box) return;
    const chapters = book.chapters || [];
    box.innerHTML = '<div class="chapter-list">' + chapters.map((ch, i) => {
      const locked = !book.free && i >= 3;
      return '<div class="chapter-item">' +
        '<span class="chapter-item__no">' + String(i + 1).padStart(2, "0") + "</span>" +
        (locked
          ? '<span class="muted">' + M.escape(ch) + "</span>"
          : '<a href="reader.html?id=' + book.id + "&chapter=" + i + '">' + M.escape(ch) + "</a>") +
        '<span class="chapter-item__free">' + (locked ? M.icon("lock-key") + " 会员" : "免费") + "</span>" +
        "</div>";
    }).join("") + "</div>" +
      '<p class="small muted" style="margin-top:14px">目录为演示数据。正式版将接入授权正文或站内原创稿件。</p>';
  }

  /* reviews --------------------------------------------------- */
  function reviewHTML(r) {
    return '<article class="review" data-review="' + M.escape(r.id || "") + '">' +
      M.avatar(r.user, "") +
      '<div><div class="review__head"><span class="review__name">' + M.escape(r.user) + "</span>" +
      '<span class="rating"><span class="rating__star">★</span>' + Number(r.rating).toFixed(1) + "</span>" +
      '<span class="review__date">' + M.escape(r.date) + "</span></div>" +
      '<p class="review__text">' + M.escape(r.text) + "</p>" +
      '<div class="review__actions"><button class="post__action" type="button" data-like="' + (r.likes || 0) + '">' + M.icon("thumbs-up") + ' <span>' + (r.likes || 0) + "</span></button>" +
      '<button class="post__action" type="button">' + M.icon("chat-circle") + " 回复</button></div></div></article>";
  }

  function renderReviews() {
    const box = document.getElementById("panel-reviews");
    if (!box) return;
    const list = allReviews();
    box.innerHTML =
      '<form class="review-form" id="reviewForm">' +
      '<div class="form-row"><div class="star-input" id="starInput" role="group" aria-label="评分">' +
      [1, 2, 3, 4, 5].map((n) => '<button type="button" class="is-on" data-star="' + n + '" aria-label="' + n + ' 星">★</button>').join("") +
      '</div><span class="tiny muted">写下你的读后感受</span></div>' +
      '<label class="sr-only" for="reviewText">书评内容</label>' +
      '<textarea class="textarea" id="reviewText" placeholder="这本书让你停下来的那一段是什么？" maxlength="500"></textarea>' +
      '<div class="row between"><span class="tiny muted">演示版书评仅保存在本机浏览器。</span><button class="btn btn--sm" type="submit">发布书评</button></div>' +
      "</form>" +
      '<div class="review-list" id="reviewList">' +
      (list.length ? list.map(reviewHTML).join("") : '<div class="empty"><img src="assets/img/undraw/reading-notes_dg9z.svg" alt="正在写笔记的人"><h3>还没有人写书评</h3><p>你可以是第一个。写下让你停下来的那一页。</p></div>') +
      "</div>";

    const stars = box.querySelectorAll("[data-star]");
    stars.forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.getAttribute("data-star"));
        stars.forEach((s) => s.classList.toggle("is-on", Number(s.getAttribute("data-star")) <= n));
      });
    });

    const form = box.querySelector("#reviewForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = box.querySelector("#reviewText").value.trim();
      if (text.length < 5) { M.toast("再多写几个字吧", "info"); return; }
      const rating = box.querySelectorAll("[data-star].is-on").length || 5;
      const list = userReviews();
      list.unshift({ id: "u" + Date.now(), bookId: book.id, user: "林见鹿", avatar: 1, date: "刚刚", rating: rating, likes: 0, text: text });
      saveUserReviews(list);
      renderReviews();
      renderTabs();
      M.toast("书评已发布（演示）", "check-circle");
    });

    box.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const on = btn.classList.toggle("is-on");
        const span = btn.querySelector("span");
        span.textContent = Number(btn.getAttribute("data-like")) + (on ? 1 : 0);
      });
    });
  }

  /* related --------------------------------------------------- */
  function renderRelated() {
    const box = document.getElementById("panel-related");
    if (!box) return;
    const same = D.books.filter((b) => b.id !== book.id && b.categoryId === book.categoryId);
    const rest = D.books.filter((b) => b.id !== book.id && b.categoryId !== book.categoryId).sort((a, b) => b.rating - a.rating);
    const related = same.concat(rest).slice(0, 4);
    box.innerHTML = '<div class="related-grid">' + related.map((b) => M.bookCard(b)).join("") + "</div>";
  }

  /* aside ----------------------------------------------------- */
  function renderAside() {
    const box = document.getElementById("bookAside");
    if (!box) return;
    const scores = book.scores;
    box.innerHTML =
      '<section class="panel"><h3>为什么推荐给你</h3>' +
      factorNames.map(([key, label]) =>
        '<div class="factor"><span>' + label + "</span><span class=\"factor__track\"><i class=\"factor__fill\" style=\"width:" +
        Math.round(scores[key] * 100) + '%"></i></span><span class="factor__value">' + Math.round(scores[key] * 100) + "</span></div>"
      ).join("") +
      '<p style="margin-top:12px">由内容相似度、协同过滤、站内热度与新鲜度加权得到。权重来自 AHP 层次分析法，可在管理后台调整。</p>' +
      '<a class="link-arrow" href="admin.html">查看推荐配置 ' + M.icon("arrow-right") + "</a></section>" +
      '<section class="panel"><h3>关于作者</h3><p>' + M.escape(book.authorBio) + "</p></section>" +
      '<section class="panel"><h3>一起读</h3><p>本周共读正在讨论《呼兰河传》。带着你正在读的这一页来，不需要读完。</p>' +
      '<a class="btn btn--ghost btn--sm" href="community.html">进入共读 ' + M.icon("arrow-up-right") + "</a></section>";
  }

  /* init ------------------------------------------------------ */
  renderHero();
  renderIntro();
  renderChapters();
  renderReviews();
  renderRelated();
  renderAside();
  renderTabs();

  const jump = document.getElementById("jumpReview");
  if (jump) {
    jump.addEventListener("click", () => {
      const tab = document.querySelector('[data-tab="reviews"]');
      if (tab) tab.click();
      const text = document.getElementById("reviewText");
      if (text) setTimeout(() => text.focus(), 60);
    });
  }

  function shelfLabel() {
    const bucket = M.shelf.bucket(book.id);
    return bucket === "reading" ? "在读" : bucket === "finished" ? "读完" : bucket === "want" ? "想读" : "加入书架";
  }

  function bindShelfMenu() {
    const menu = document.querySelector(".shelf-menu");
    if (!menu) return;
    const toggle = menu.querySelector("[data-shelf-toggle]");
    const list = menu.querySelector(".shelf-menu__list");
    if (!toggle || !list) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = list.hidden;
      list.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.addEventListener("click", (e) => {
      const item = e.target.closest("[data-shelf-set]");
      if (!item) return;
      const action = item.getAttribute("data-shelf-set");
      const current = M.shelf.bucket(book.id);
      if (action === "remove") {
        const shelf = M.shelf.get();
        ["reading", "want", "finished", "paused"].forEach((key) => {
          if (shelf[key]) shelf[key] = shelf[key].filter((x) => x !== book.id);
        });
        M.shelf.save(shelf);
        M.toast("已移出书架", "bookmark-simple");
      } else if (current === action) {
        const names = { want: "想读", reading: "在读", finished: "读完" };
        M.toast("已经是「" + names[action] + "」", "bookmark-simple");
      } else {
        M.shelf.add(book.id, action);
        const names = { want: "想读", reading: "在读", finished: "读完" };
        M.toast("已标记为「" + names[action] + "」", "bookmark-simple");
      }
      list.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = M.icon("bookmark-simple") + " <span>" + shelfLabel() + "</span>";
    });

    document.addEventListener("click", (e) => {
      if (menu.contains(e.target)) return;
      list.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  bindShelfMenu();

  document.addEventListener("moread:shelfchange", () => {
    const toggle = document.querySelector("[data-shelf-toggle]");
    if (toggle) toggle.innerHTML = M.icon("bookmark-simple") + " <span>" + shelfLabel() + "</span>";
  });
})();
