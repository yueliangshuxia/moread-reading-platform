/* 墨阅 MoRead — my shelf */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;
  const TABS = [
    { id: "reading", label: "在读" },
    { id: "want", label: "想读" },
    { id: "finished", label: "读完" },
    { id: "paused", label: "搁置" }
  ];
  let active = "reading";
  let shelf = M.shelf.get();

  function count(id) {
    if (id === "paused") return 0;
    return (shelf[id] || []).length;
  }

  function renderHeadMeta() {
    const el = document.getElementById("shelfMeta");
    if (el) el.textContent = count("reading") + " 本在读 · " + count("want") + " 本想读 · " + count("finished") + " 本读完";
  }

  function renderContinue() {
    const box = document.getElementById("continueCard");
    if (!box) return;
    const ids = shelf.reading.concat(shelf.want);
    const id = ids.find((x) => M.progress.for(x)) || ids[0];
    if (!id) {
      box.innerHTML = '<div class="empty"><img src="assets/img/undraw/open-book_pet1.svg" alt="一本摊开的书"><h3>书架还是空的</h3><p>去书库挑一本，从今天开始读。</p><a class="btn btn--sm" href="discover.html">去书库</a></div>';
      return;
    }
    const book = M.bookById(id);
    const p = M.progress.for(id) || { percent: 0, label: "尚未开始", updated: "—" };
    box.innerHTML =
      '<a class="continue-card__cover" href="book.html?id=' + book.id + '">' + M.cover(book) + "</a>" +
      '<div class="continue-card__body">' +
      '<span class="continue-card__label">继续阅读</span>' +
      '<h2 class="continue-card__title"><a href="book.html?id=' + book.id + '">' + M.escape(book.title) + "</a></h2>" +
      '<span class="continue-card__chapter">' + M.escape(p.label) + " · 上次阅读 " + M.escape(p.updated) + "</span>" +
      '<div class="continue-card__progress"><span>已读 ' + p.percent + '%</span><span class="progress"><i class="progress__bar" style="width:' + p.percent + '%"></i></span><span>' + M.escape(book.words) + " 字</span></div>" +
      "</div>" +
      '<div class="continue-card__actions">' +
      '<a class="btn btn--accent" href="reader.html?id=' + book.id + '&resume=1">' + M.icon("book-open") + " 继续阅读</a>" +
      '<a class="btn btn--ghost btn--sm" href="book.html?id=' + book.id + '">查看详情</a>' +
      '<span class="muted">' + M.escape(book.author) + "</span>" +
      "</div>";
  }

  function renderTabs() {
    const box = document.getElementById("shelfTabs");
    if (!box) return;
    box.innerHTML = TABS.map((t) =>
      '<button class="tab' + (active === t.id ? " is-active" : "") + '" type="button" data-shelf-tab="' + t.id + '">' +
      t.label + '<span class="tab__count">' + count(t.id) + "</span></button>"
    ).join("");
    box.querySelectorAll("[data-shelf-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.getAttribute("data-shelf-tab");
        renderTabs();
        renderGrid();
      });
    });
  }

  function shelfItemHTML(book) {
    const id = encodeURIComponent(book.id);
    const p = M.progress.for(book.id);
    let foot = "";
    if (active === "reading") {
      const pct = p ? p.percent : 0;
      foot = '<div class="shelf-item__progress"><div class="shelf-item__meta"><span>' + (p ? M.escape(p.label) : "尚未开始") + "</span><span>" + pct + "%</span></div><div class=\"progress\"><i class=\"progress__bar\" style=\"width:" + pct + '%"></i></div></div>';
    } else if (active === "finished") {
      foot = '<div class="shelf-item__progress"><div class="shelf-item__meta"><span>已读完</span><span>' + M.stars(book.rating) + "</span></div></div>";
    } else {
      foot = '<div class="shelf-item__progress"><div class="shelf-item__meta"><span>' + (active === "paused" ? "已搁置" : "想读") + "</span><span>" + M.escape(book.words) + " 字</span></div></div>";
    }
    return '<article class="shelf-item">' +
      '<div class="shelf-item__cover">' +
      '<a href="book.html?id=' + id + '" aria-label="查看《' + M.escape(book.title) + '》">' + M.cover(book) + "</a>" +
      '<button class="shelf-item__remove" type="button" data-remove="' + M.escape(book.id) + '" aria-label="从书架移除《' + M.escape(book.title) + '》">' + M.icon("x") + "</button>" +
      "</div>" +
      '<div class="shelf-item__info"><a class="shelf-item__title" href="book.html?id=' + id + '">' + M.escape(book.title) + "</a>" +
      '<div class="shelf-item__meta"><span>' + M.escape(book.author) + "</span><span>" + M.escape(book.category) + "</span></div>" +
      foot + "</div></article>";
  }

  function renderGrid() {
    const box = document.getElementById("shelfGrid");
    if (!box) return;
    const ids = shelf[active] || [];
    if (!ids.length) {
      box.innerHTML = '<div class="empty" style="grid-column:1/-1">' +
        '<img src="assets/img/undraw/open-book_pet1.svg" alt="一本摊开的书">' +
        "<h3>" + (active === "paused" ? "这里还没有搁置的书" : "这一格还是空的") + "</h3>" +
        "<p>" + (active === "paused" ? "读不下去的书可以先放在这里，不着急。" : "去书库挑一本，加入书架后会出现在这里。") + "</p>" +
        '<a class="btn btn--ghost btn--sm" href="discover.html">去书库</a></div>';
      return;
    }
    box.innerHTML = ids.map((id) => shelfItemHTML(M.bookById(id))).join("");
  }

  function bindRemove() {
    const box = document.getElementById("shelfGrid");
    if (!box) return;
    box.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      const id = btn.getAttribute("data-remove");
      shelf[active] = shelf[active].filter((x) => x !== id);
      M.shelf.save(shelf);
      renderHeadMeta();
      renderTabs();
      renderGrid();
      renderContinue();
      M.toast("已从书架移除", "bookmark-simple");
    });
  }

  /* weekly chart ---------------------------------------------- */
  function renderWeekly() {
    const box = document.getElementById("weekBars");
    if (!box) return;
    const values = D.stats.profileWeekly;
    const labels = D.stats.profileWeeklyLabels;
    const max = Math.max.apply(null, values);
    box.innerHTML = values.map((v, i) =>
      '<div class="week-bar" title="周' + labels[i] + "：" + v + ' 分钟">' +
      '<span class="week-bar__value">' + v + "</span>" +
      '<span class="week-bar__fill" style="height:' + Math.max(4, Math.round((v / max) * 100)) + '%"></span>' +
      '<span class="week-bar__label">' + labels[i] + "</span></div>"
    ).join("");
    const table = document.getElementById("weekTable");
    if (table) {
      table.innerHTML = "<table><thead><tr><th>星期</th><th>阅读时长（分钟）</th></tr></thead><tbody>" +
        values.map((v, i) => "<tr><td>周" + labels[i] + "</td><td>" + v + "</td></tr>").join("") +
        "</tbody></table>";
    }
  }

  /* init ------------------------------------------------------ */
  renderHeadMeta();
  renderContinue();
  renderTabs();
  renderGrid();
  renderWeekly();
  bindRemove();
})();
