/* 墨阅 MoRead — home page */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;

  function book(id) { return M.bookById(id); }

  /* hero shelf ------------------------------------------------ */
  const SHELF_ROTATIONS = [
    ["zhaohuaxishi", "nahan", "hulanhezhuan", "shanhaizhijian", "xiaowangzi", "renjiancihua", "jiuwairen"],
    ["fushengliuji", "waerdengchu", "xishuda", "laorenyuhai", "feiniaoji", "changyejiangjin", "yueliangliubianshi"],
    ["kunchongji", "shishuoxinyu", "suiyuanshidan", "haidiliangwanli", "nanfangyoujiamu", "chensilu", "zhimodeshi"]
  ];
  const HEIGHTS = [282, 254, 298, 268, 240, 288, 262];
  const WIDTHS = [48, 44, 52, 46, 42, 50, 45];
  const MOBILE_HEIGHTS = [246, 222, 260, 234, 210, 252, 228];
  const MOBILE_WIDTHS = [38, 35, 41, 37, 34, 40, 36];
  let rotation = 0;

  function renderShelf() {
    const stage = document.getElementById("heroShelf");
    if (!stage) return;
    const mobile = window.matchMedia("(max-width: 620px)").matches;
    const heights = mobile ? MOBILE_HEIGHTS : HEIGHTS;
    const widths = mobile ? MOBILE_WIDTHS : WIDTHS;
    const ids = SHELF_ROTATIONS[rotation % SHELF_ROTATIONS.length];
    stage.innerHTML = ids.map((id, i) =>
      M.spine(book(id), { height: heights[i], width: widths[i], delay: 80 + i * 60 })
    ).join("");
  }

  const shuffle = document.getElementById("shuffleShelf");
  if (shuffle) {
    shuffle.addEventListener("click", () => {
      rotation += 1;
      renderShelf();
    });
  }

  /* recommendation ------------------------------------------- */
  function renderRecommendation() {
    const feature = book("zhaohuaxishi");
    const featureBox = document.getElementById("recFeature");
    const listBox = document.getElementById("recList");
    if (featureBox) {
      featureBox.innerHTML =
        '<a class="rec-feature__cover" href="book.html?id=' + feature.id + '">' + M.cover(feature) + "</a>" +
        '<div class="rec-feature__body">' +
        '<span class="kicker">今日首选</span>' +
        '<h3 class="rec-feature__title"><a href="book.html?id=' + feature.id + '">' + M.escape(feature.title) + "</a></h3>" +
        '<p class="rec-feature__author">' + M.escape(feature.author) + " · " + M.escape(feature.category) + " · " + M.stars(feature.rating) + "</p>" +
        '<p class="rec-feature__blurb">' + M.escape(feature.blurb) + "</p>" +
        '<div class="rec-feature__reason">' + M.icon("sparkle") + "<span><strong>推荐理由</strong><br>" + M.escape(feature.reason) + "</span></div>" +
        '<div class="rec-feature__actions"><a class="btn btn--sm btn--accent" href="reader.html?id=' + feature.id + '">' + M.icon("book-open") + ' 开始阅读</a>' +
        '<a class="btn btn--sm btn--ghost" href="book.html?id=' + feature.id + '">查看详情</a></div>' +
        "</div>";
    }
    if (listBox) {
      listBox.innerHTML = ["hulanhezhuan", "xiaowangzi", "waerdengchu"].map((id) => {
        const b = book(id);
        return '<a class="rec-item" href="book.html?id=' + b.id + '">' +
          M.cover(b) +
          '<span><span class="rec-item__title">' + M.escape(b.title) + "</span>" +
          '<span class="rec-item__reason">' + M.escape(b.reason) + "</span></span>" +
          '<span class="rec-item__arrow">' + M.icon("arrow-right") + "</span></a>";
      }).join("");
    }
  }

  /* new books ------------------------------------------------ */
  function renderNewBooks() {
    const box = document.getElementById("newBooks");
    if (!box) return;
    const ids = ["shanhaizhijian", "nanfangyoujiamu", "changyejiangjin", "shijiandezhezhou", "yueliangliubianshi", "kunchongji"];
    box.innerHTML = ids.map((id) => M.bookCard(book(id))).join("");
  }

  /* curated booklists --------------------------------------- */
  function renderBooklists() {
    const box = document.getElementById("booklists");
    if (!box) return;
    box.innerHTML = D.booklists.map((list) => {
      const books = list.bookIds.map(book).filter(Boolean);
      return '<a class="booklist-card" href="discover.html?list=' + list.id + '">' +
        '<div class="booklist-card__covers">' + books.slice(0, 3).map((b) => M.cover(b)).join("") + "</div>" +
        '<div class="booklist-card__body">' +
        '<span class="booklist-card__seal" aria-hidden="true">' + M.escape(list.mark) + "</span>" +
        '<span class="kicker">' + books.length + " 本书单</span>" +
        "<h3>" + M.escape(list.title) + "</h3>" +
        "<p>" + M.escape(list.desc) + "</p>" +
        '<span class="link-arrow">查看书单 ' + M.icon("arrow-right") + "</span>" +
        "</div></a>";
    }).join("");
  }

  /* categories ----------------------------------------------- */
  function renderCategories() {
    const box = document.getElementById("categoryGrid");
    if (!box) return;
    box.innerHTML = D.categories.map((cat) => {
      const count = D.books.filter((b) => b.categoryId === cat.id).length;
      return '<a class="cat-item" href="discover.html?cat=' + cat.id + '">' +
        '<span class="cat-item__mark" aria-hidden="true">' + cat.mark + "</span>" +
        "<h3>" + M.escape(cat.name) + "</h3>" +
        "<p>" + M.escape(cat.desc) + "</p>" +
        '<span class="cat-item__count">' + count + " 本书 · 进入分类</span></a>";
    }).join("");
  }

  /* notes ---------------------------------------------------- */
  function renderNotes() {
    const box = document.getElementById("noteGrid");
    if (!box) return;
    box.innerHTML = D.notes.slice(0, 3).map((n) => {
      const b = book(n.bookId);
      return '<article class="note-card">' +
        '<span class="note-card__book">《' + M.escape(b.title) + "》 · " + M.escape(n.page) + "</span>" +
        '<p class="note-card__quote">“' + M.escape(n.quote) + "”</p>" +
        '<p class="note-card__note">' + M.escape(n.note) + "</p>" +
        '<div class="note-card__foot"><span class="row gap-6">' + M.avatar(n.user, "avatar--sm") + M.escape(n.user) + "</span><span>" + M.escape(n.date) + "</span></div>" +
        "</article>";
    }).join("");
  }

  /* searches ------------------------------------------------- */
  function bindSearchForm(id) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const q = input ? input.value.trim() : "";
      window.location.href = "discover.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  renderShelf();
  renderRecommendation();
  renderNewBooks();
  renderBooklists();
  renderCategories();
  renderNotes();
  bindSearchForm("heroSearch");
  bindSearchForm("ctaSearch");
})();
