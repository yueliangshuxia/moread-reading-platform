/* 墨阅 MoRead — profile */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;

  function customNotes() {
    try { return JSON.parse(localStorage.getItem("moread.notes") || "[]"); } catch (err) { return []; }
  }
  function userReviews() {
    try { return JSON.parse(localStorage.getItem("moread.userReviews") || "[]"); } catch (err) { return []; }
  }

  /* reading records ------------------------------------------- */
  function renderRecords() {
    const box = document.getElementById("panel-records");
    if (!box) return;
    const shelf = M.shelf.get();
    const ids = shelf.reading.concat(shelf.finished).slice(0, 6);
    if (!ids.length) {
      box.innerHTML = '<div class="empty"><img src="assets/img/undraw/open-book_pet1.svg" alt="一本摊开的书"><h3>还没有阅读记录</h3><p>去书库挑一本，开始你的第一段阅读。</p><a class="btn btn--sm" href="discover.html">去书库</a></div>';
      return;
    }
    box.innerHTML = ids.map((id) => {
      const b = M.bookById(id);
      const p = M.progress.for(id);
      const pct = shelf.finished.includes(id) ? 100 : (p ? p.percent : 0);
      return '<article class="record-item">' +
        '<a href="book.html?id=' + b.id + '">' + M.cover(b) + "</a>" +
        '<div class="record-item__body"><a class="record-item__title" href="book.html?id=' + b.id + '">' + M.escape(b.title) + "</a>" +
        '<div class="record-item__meta">' + M.escape(b.author) + " · " + (pct === 100 ? "已读完" : (p ? M.escape(p.label) : "尚未开始")) + "</div></div>" +
        '<div class="record-item__progress"><span>' + pct + '%</span><div class="progress"><i class="progress__bar" style="width:' + pct + '%"></i></div></div>' +
        "</article>";
    }).join("");
  }

  /* notes ----------------------------------------------------- */
  function renderNotesPanel() {
    const box = document.getElementById("panel-notes");
    if (!box) return;
    const all = D.notes.concat(customNotes());
    if (!all.length) {
      box.innerHTML = '<div class="empty"><img src="assets/img/undraw/reading-notes_dg9z.svg" alt="写笔记的人"><h3>还没有笔记</h3><p>在阅读器里选中一段文字，记下你的想法。</p></div>';
      return;
    }
    box.innerHTML = '<div class="note-list">' + all.map((n) => {
      const b = M.bookById(n.bookId);
      return '<article class="note-item">' +
        '<div class="note-item__quote">“' + M.escape(n.quote) + "”</div>" +
        (n.note ? '<div class="note-item__text">' + M.escape(n.note) + "</div>" : "") +
        '<div class="note-item__foot"><span>《' + M.escape(b.title) + "》 · " + M.escape(n.page || "当前位置") + "</span><span>" + M.escape(n.date) + "</span></div>" +
        "</article>";
    }).join("") + "</div>";
  }

  /* reviews --------------------------------------------------- */
  function renderReviewsPanel() {
    const box = document.getElementById("panel-reviews");
    if (!box) return;
    const list = D.reviews.filter((r) => r.user === "林见鹿").concat(userReviews().filter((r) => r.user === "林见鹿"));
    box.innerHTML = list.length ? list.map((r) => {
      const b = M.bookById(r.bookId);
      return '<article class="review">' + M.avatar(r.user, "") +
        '<div><div class="review__head"><span class="review__name">《' + M.escape(b.title) + "》</span>" +
        '<span class="rating"><span class="rating__star">★</span>' + Number(r.rating).toFixed(1) + "</span>" +
        '<span class="review__date">' + M.escape(r.date) + "</span></div>" +
        '<p class="review__text">' + M.escape(r.text) + "</p></div></article>";
    }).join("") : '<div class="empty"><img src="assets/img/undraw/reading-a-book_4cap.svg" alt="正在读书"><h3>还没有书评</h3><p>读完一本书，写几句留给下一个读者。</p></div>';
  }

  /* achievements ---------------------------------------------- */
  function renderAchievements() {
    const box = document.getElementById("panel-achievements");
    if (!box) return;
    const items = [
      { icon: "fire", title: "连续 21 天", desc: "连续阅读超过三周", locked: false },
      { icon: "trophy", title: "十二本", desc: "今年读完十二本书", locked: false },
      { icon: "moon", title: "夜读者", desc: "在 23:00 后阅读 20 次", locked: false },
      { icon: "highlighter", title: "划线成瘾", desc: "累计划线 200 条", locked: false },
      { icon: "book-open", title: "长跑选手", desc: "单本连续阅读 30 天", locked: true },
      { icon: "seal-check", title: "共读发起人", desc: "发起一次共读讨论", locked: true }
    ];
    box.innerHTML = '<div class="achievement-grid">' + items.map((a) =>
      '<div class="achievement' + (a.locked ? " is-locked" : "") + '">' + M.icon(a.icon) +
      "<strong>" + a.title + "</strong><span>" + a.desc + "</span></div>"
    ).join("") + "</div>";
  }

  /* sidebar --------------------------------------------------- */
  function renderSide() {
    const pref = document.getElementById("prefBars");
    if (pref) {
      const max = Math.max.apply(null, D.stats.profileCategories.map((x) => x.value));
      pref.innerHTML = D.stats.profileCategories.map((c) =>
        '<div class="viz-bar-row"><span class="viz-bar-row__label">' + M.escape(c.name) + "</span>" +
        '<span class="viz-bar-track"><i class="viz-bar-fill" style="width:' + Math.round((c.value / max) * 100) + '%"></i></span>' +
        '<span class="viz-bar-row__value">' + c.value + "%</span></div>"
      ).join("");
    }

    const heat = document.getElementById("heatmap");
    if (heat) {
      heat.innerHTML = D.stats.heatmap.map((v, i) =>
        '<span class="heat-cell" data-level="' + v + '" title="第 ' + (Math.floor(i / 7) + 1) + " 周 · " + (i % 7 + 1) + " 天：" + (v === 0 ? "没有记录" : v + " 条记录") + '"></span>'
      ).join("");
    }

    const months = document.getElementById("monthLabels");
    if (months) {
      const labels = ["8 月", "", "", "", "9 月", "", "", "", "10 月", "", "", ""];
      months.innerHTML = labels.map((l) => "<span>" + l + "</span>").join("");
    }
  }

  /* reading goal --------------------------------------------- */
  function goalTarget() {
    let saved = 0;
    try { saved = Number(localStorage.getItem("moread.goal") || 0); } catch (err) { saved = 0; }
    return saved || D.stats.readingGoal.target;
  }

  function renderGoal() {
    const finished = D.stats.readingGoal.finished;
    const target = goalTarget();
    const pct = Math.min(100, Math.round((finished / target) * 100));
    const ring = document.getElementById("goalRing");
    const percent = document.getElementById("goalPercent");
    const progress = document.getElementById("goalProgressText");
    const note = document.getElementById("goalNote");
    const select = document.getElementById("goalSelect");
    if (ring) ring.style.setProperty("--pct", pct);
    if (percent) percent.textContent = pct + "%";
    if (progress) progress.textContent = finished + " / " + target + " 本";
    if (note) note.textContent = finished >= target ? "今年已读完 " + finished + " 本，目标完成。" : "今年已读完 " + finished + " 本，还差 " + (target - finished) + " 本。";
    if (select) select.value = String(target);
  }

  const goalSelect = document.getElementById("goalSelect");
  if (goalSelect) {
    goalSelect.addEventListener("change", () => {
      try { localStorage.setItem("moread.goal", goalSelect.value); } catch (err) { /* ignore */ }
      renderGoal();
      M.toast("阅读目标已更新", "check-circle");
    });
  }

  /* tabs ------------------------------------------------------ */
  function bindTabs() {
    const tabs = document.querySelectorAll("[data-profile-tab]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.getAttribute("data-profile-tab");
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("is-active", p.id === "panel-" + key));
      });
    });
  }

  /* init ------------------------------------------------------ */
  renderRecords();
  renderNotesPanel();
  renderReviewsPanel();
  renderAchievements();
  renderSide();
  renderGoal();
  bindTabs();

  const edit = document.getElementById("editProfile");
  if (edit) edit.addEventListener("click", () => M.toast("资料编辑将在正式版开放", "pencil-simple"));
  const logout = document.getElementById("logoutBtn");
  if (logout) logout.addEventListener("click", () => { window.location.href = "login.html"; });
})();
