/* 墨阅 MoRead — reader */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;
  const bookId = M.getParam("id") || "zhaohuaxishi";
  const book = M.bookById(bookId);
  const reader = document.getElementById("reader");
  if (!reader) return;

  const DEMO_CHAPTERS = ["第一章 · 灯下", "第二章 · 窗外的河", "第三章 · 旧信", "第四章 · 归途"];
  const DEMO_TEXT = [
    "夜色是从书页的边缘慢慢渗进来的。窗外的城市还在响，车流像一条不肯睡去的河。我把台灯往左挪了挪，光落在纸上，字便有了影子。白天读不进去的句子，到了这个时候，忽然愿意停下来，等一等我。",
    "小时候读书没有这样安静。那时候的书多半是借来的，封皮用旧报纸包着，翻页时要格外小心。夏天午后，蝉声把屋子填得满满的，我趴在竹席上，把一本《水浒》看得七零八落。很多字不认识，就跳过去；很多情节记不住，也不妨碍我第二天接着看。现在想来，那种读书法近乎鲁莽，却有一种后来再也没有的快乐：不为懂得，只为想知道后面发生了什么。",
    "后来读书变得有目的了。为了考试，为了论文，为了在谈话里不掉队。书页上开始出现铅笔线、折角、便签，出现“此处重要”“可引用”这样的批注。知识确实多了，但那种被一个句子忽然击中的时刻，反而少了。我们太急着把书读完，忘了书也可以把人读慢。",
    "我渐渐学会在书里留白。遇到喜欢的段落，不急着划下来，先合上书，去倒一杯水，或者站到窗前看一会儿。等那句话在心里沉下去，再回来找它。这样做很费时间，却让一本书真正变成了自己的。就像小时候外婆晒被子，总要在太阳最好的时候翻一次面，让另一面也晒透。",
    "读书说到底是一件很私人的事。别人推荐的书单，只能提供一个入口；真正走进去，要靠自己的脚步。有些书在二十岁读是路标，到了三十岁再读，可能只是一块石头。这没有什么可惜的。人和书的关系，本来就和人和人的关系一样，讲究一个恰逢其时。",
    "台灯的光圈慢慢缩小，杯子里的茶已经凉了。我合上书，把书签夹回刚才那一页。明天未必会接着读，但我知道它在那里。"
  ];

  /* settings -------------------------------------------------- */
  const DEFAULT_SETTINGS = {
    fs: 19,
    lh: 2,
    theme: document.documentElement.getAttribute("data-theme") === "dark" ? "night" : "paper"
  };
  function getSettings() {
    try {
      const raw = localStorage.getItem("moread.reader");
      return raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : Object.assign({}, DEFAULT_SETTINGS);
    } catch (err) { return Object.assign({}, DEFAULT_SETTINGS); }
  }
  function saveSettings(s) {
    try { localStorage.setItem("moread.reader", JSON.stringify(s)); } catch (err) { /* ignore */ }
  }
  let settings = getSettings();

  function applySettings() {
    reader.style.setProperty("--reader-fs", settings.fs + "px");
    reader.style.setProperty("--reader-lh", String(settings.lh));
    reader.setAttribute("data-reader-theme", settings.theme);
    document.querySelectorAll("[data-reader-theme].theme-swatch").forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-reader-theme") === settings.theme);
    });
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) themeBtn.innerHTML = M.icon(settings.theme === "night" ? "sun" : "moon") + " <span>主题</span>";
    const defaultFont = document.querySelector('[data-font="0"]');
    if (defaultFont) defaultFont.textContent = String(settings.fs);
    document.querySelectorAll("[data-lh]").forEach((b) => {
      b.classList.toggle("is-active", Number(b.getAttribute("data-lh")) === Number(settings.lh));
    });
  }

  /* header / article ----------------------------------------- */
  function renderHeader() {
    const title = document.getElementById("readerBookTitle");
    const chapter = document.getElementById("readerChapterTitle");
    const back = document.getElementById("backToBook");
    const tocLink = document.getElementById("tocBookLink");
    if (title) title.textContent = book.title;
    if (chapter) chapter.textContent = DEMO_CHAPTERS[0];
    if (back) back.href = "book.html?id=" + book.id;
    if (tocLink) tocLink.href = "book.html?id=" + book.id;
    document.title = "阅读 · " + book.title + " · 墨阅";
  }

  function renderArticle() {
    const title = document.getElementById("articleTitle");
    const subtitle = document.getElementById("articleSubtitle");
    const meta = document.getElementById("articleMeta");
    const content = document.getElementById("readerContent");
    if (title) title.textContent = "灯下";
    if (subtitle) subtitle.textContent = "《" + book.title + "》 · " + DEMO_CHAPTERS[0] + " · 演示样章";
    if (meta) meta.innerHTML = "<span>" + M.escape(book.author) + "</span><span>约 1,000 字</span><span>预计 6 分钟</span><span>示例文本</span>";
    if (content) {
      content.innerHTML = DEMO_TEXT.map((p, i) =>
        "<p>" + M.escape(p) + "</p>" +
        (i === 3 ? '<blockquote class="pull">书不会催人，这一点，比很多事都温柔。</blockquote>' : "")
      ).join("") + '<div class="reader-ornament">※</div>';
    }
  }

  function renderToc() {
    const tocBook = document.getElementById("tocBook");
    const tocList = document.getElementById("tocList");
    if (tocBook) {
      tocBook.innerHTML = M.cover(book) +
        '<div><div class="toc-book__title">' + M.escape(book.title) + "</div>" +
        '<div class="toc-book__meta">' + M.escape(book.author) + " · 演示样章</div></div>";
    }
    if (tocList) {
      tocList.innerHTML = DEMO_CHAPTERS.map((ch, i) =>
        '<button class="toc-item' + (i === 0 ? " is-current" : "") + '" type="button" data-chapter="' + i + '">' +
        '<span class="toc-item__no">' + String(i + 1).padStart(2, "0") + "</span>" +
        "<span>" + M.escape(ch) + "</span>" +
        '<span class="toc-item__state">' + (i === 0 ? "当前" : "待接入") + "</span></button>"
      ).join("");
    }
  }

  /* drawers --------------------------------------------------- */
  const drawers = {
    toc: document.getElementById("drawerToc"),
    notes: document.getElementById("drawerNotes"),
    stats: document.getElementById("drawerStats")
  };
  const scrim = document.getElementById("readerScrim");

  function closeDrawers() {
    Object.values(drawers).forEach((d) => d && d.classList.remove("is-open"));
    if (scrim) scrim.classList.remove("is-on");
  }

  function openDrawer(name) {
    const target = drawers[name];
    if (!target) return;
    closeDrawers();
    target.classList.add("is-open");
    if (scrim) scrim.classList.add("is-on");
    if (name === "notes") renderNotes(noteTab);
    if (name === "stats") renderStats();
  }

  document.querySelectorAll("[data-drawer]").forEach((btn) => {
    btn.addEventListener("click", () => openDrawer(btn.getAttribute("data-drawer")));
  });
  document.querySelectorAll("[data-close-drawer]").forEach((btn) => btn.addEventListener("click", closeDrawers));
  if (scrim) scrim.addEventListener("click", closeDrawers);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawers(); closeSelection(); closeControls(); }
  });

  /* toc click ------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const item = e.target.closest("[data-chapter]");
    if (!item) return;
    const idx = Number(item.getAttribute("data-chapter"));
    if (idx === 0) { window.scrollTo({ top: 0, behavior: "smooth" }); closeDrawers(); }
    else M.toast("演示版仅提供第一章样章", "info");
  });

  /* type / theme panel ---------------------------------------- */
  const controls = document.getElementById("typePanel");
  function closeControls() { if (controls) controls.classList.remove("is-open"); }
  function toggleControls() {
    if (!controls) return;
    controls.classList.toggle("is-open");
    if (controls.classList.contains("is-open")) closeDrawers();
  }
  ["typeBtn", "themeBtn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", toggleControls);
  });
  document.addEventListener("click", (e) => {
    if (!controls || !controls.classList.contains("is-open")) return;
    if (controls.contains(e.target) || e.target.closest("#typeBtn") || e.target.closest("#themeBtn")) return;
    closeControls();
  });

  document.querySelectorAll("[data-font]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = Number(btn.getAttribute("data-font"));
      settings.fs = delta === 0 ? DEFAULT_SETTINGS.fs : Math.min(24, Math.max(16, settings.fs + delta));
      saveSettings(settings);
      applySettings();
    });
  });

  document.querySelectorAll("[data-lh]").forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.lh = Number(btn.getAttribute("data-lh"));
      document.querySelectorAll("[data-lh]").forEach((b) => b.classList.toggle("is-active", b === btn));
      saveSettings(settings);
      applySettings();
    });
  });

  document.querySelectorAll(".theme-swatch[data-reader-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.theme = btn.getAttribute("data-reader-theme");
      saveSettings(settings);
      applySettings();
    });
  });

  /* progress -------------------------------------------------- */
  const barLine = document.getElementById("readerBarLine");
  const floatPct = document.getElementById("floatPct");
  const floatBar = document.getElementById("floatBar");
  let saveTimer = null;

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 100;
    if (barLine) barLine.style.width = pct + "%";
    if (floatBar) floatBar.style.width = pct + "%";
    if (floatPct) floatPct.textContent = Math.round(pct) + "%";
    const tocBar = document.querySelector(".toc-progress__track i");
    if (tocBar) tocBar.style.width = pct + "%";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      M.progress.set(book.id, {
        percent: Math.round(pct),
        chapter: 1,
        label: DEMO_CHAPTERS[0],
        updated: "刚刚"
      });
    }, 500);
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  function restoreProgress() {
    if (M.getParam("resume") !== "1") return;
    const saved = M.progress.for(book.id);
    if (!saved || saved.percent < 6 || saved.percent > 94) return;
    setTimeout(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: (saved.percent / 100) * max });
      M.toast("已回到上次阅读的位置", "book-open");
    }, 350);
  }

  /* bookmark -------------------------------------------------- */
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem("moread.bookmarks") || "[]"); } catch (err) { return []; }
  }
  function saveBookmarks(list) {
    try { localStorage.setItem("moread.bookmarks", JSON.stringify(list)); } catch (err) { /* ignore */ }
  }
  function syncBookmark() {
    if (!bookmarkBtn) return;
    const on = getBookmarks().includes(book.id);
    bookmarkBtn.classList.toggle("is-on", on);
    bookmarkBtn.innerHTML = M.icon(on ? "bookmark-simple" : "bookmark-simple") + " <span>" + (on ? "已收藏" : "书签") + "</span>";
  }
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", () => {
      const list = getBookmarks();
      const on = list.includes(book.id);
      saveBookmarks(on ? list.filter((x) => x !== book.id) : list.concat(book.id));
      syncBookmark();
      if (drawers.stats && drawers.stats.classList.contains("is-open")) renderStats();
      M.toast(on ? "已移除书签" : "已加入书签", "bookmark-simple");
    });
  }

  /* notes ----------------------------------------------------- */
  let noteTab = "notes";
  let pendingQuote = "";

  function customNotes() { return M.notes.get().filter((n) => n.bookId === book.id); }
  function highlights() {
    let all = [];
    try { all = JSON.parse(localStorage.getItem("moread.highlights") || "[]"); } catch (err) { all = []; }
    let changed = false;
    all.forEach((h, i) => { if (!h.id) { h.id = "h-legacy-" + i; changed = true; } });
    if (changed) saveHighlights(all);
    return all.filter((h) => h.bookId === book.id);
  }
  function saveHighlights(list) {
    try { localStorage.setItem("moread.highlights", JSON.stringify(list)); } catch (err) { /* ignore */ }
  }

  function noteEntryHTML(n) {
    const canDelete = n.custom || !D.notes.some((d) => d.id === n.id);
    return '<div class="note-entry">' +
      (n.quote ? '<div class="note-entry__quote">“' + M.escape(n.quote) + "”</div>" : "") +
      (n.note || n.text ? '<div class="note-entry__text">' + M.escape(n.note || n.text) + "</div>" : "") +
      '<div class="note-entry__meta"><span>' + M.escape(n.page || "当前位置") + '</span><span class="row gap-6">' +
      M.escape(n.date || "刚刚") +
      (canDelete ? '<button class="note-entry__del" type="button" data-del-note="' + M.escape(n.id) + '" aria-label="删除笔记">' + M.icon("trash") + "</button>" : "") +
      "</span></div></div>";
  }

  function renderNotes(tab) {
    noteTab = tab || noteTab;
    const body = document.getElementById("notesBody");
    const compose = document.getElementById("noteCompose");
    if (!body) return;
    document.querySelectorAll("[data-note-tab]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-note-tab") === noteTab);
    });
    if (compose) compose.style.display = noteTab === "notes" ? "" : "none";

    if (noteTab === "notes") {
      const defaults = D.notes.filter((n) => n.bookId === book.id);
      const mine = customNotes();
      const all = defaults.concat(mine);
      body.innerHTML = all.length
        ? all.map(noteEntryHTML).join("")
        : '<div class="note-empty"><img src="assets/img/undraw/reading-notes_dg9z.svg" alt="正在写笔记"><p>这本书还没有笔记。<br>选中一段文字，记下你的想法。</p></div>';
    } else {
      const list = highlights();
      body.innerHTML = list.length
        ? list.map((h) => '<div class="note-entry"><div class="note-entry__quote">“' + M.escape(h.text) + "”</div><div class=\"note-entry__meta\"><span>划线</span><span class=\"row gap-6\">" + M.escape(h.date) + '<button class="note-entry__del" type="button" data-del-highlight="' + M.escape(h.id) + '" aria-label="删除划线">' + M.icon("trash") + "</button></span></div></div>").join("")
        : '<div class="note-empty"><img src="assets/img/undraw/annotations_2xx4.svg" alt="批注"><p>还没有划线。<br>选中正文中的句子，点击“划线”。</p></div>';
    }
  }

  document.querySelectorAll("[data-note-tab]").forEach((btn) => {
    btn.addEventListener("click", () => renderNotes(btn.getAttribute("data-note-tab")));
  });

  const saveNoteBtn = document.getElementById("saveNote");
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener("click", () => {
      const input = document.getElementById("noteInput");
      const text = input ? input.value.trim() : "";
      if (!text && !pendingQuote) { M.toast("写点什么再保存吧", "info"); return; }
      M.notes.add({
        id: "n" + Date.now(),
        bookId: book.id,
        user: "林见鹿",
        date: "刚刚",
        page: "当前位置",
        quote: pendingQuote,
        note: text,
        custom: true
      });
      pendingQuote = "";
      if (input) input.value = "";
      const quoteBox = document.getElementById("pendingQuote");
      if (quoteBox) { quoteBox.textContent = ""; quoteBox.hidden = true; }
      renderNotes("notes");
      if (drawers.stats && drawers.stats.classList.contains("is-open")) renderStats();
      M.toast("笔记已保存（本机）", "check-circle");
    });
  }

  const notesBody = document.getElementById("notesBody");
  if (notesBody) {
    notesBody.addEventListener("click", (e) => {
      const delNote = e.target.closest("[data-del-note]");
      if (delNote) {
        const id = delNote.getAttribute("data-del-note");
        const list = M.notes.get().filter((n) => n.id !== id);
        try { localStorage.setItem("moread.notes", JSON.stringify(list)); } catch (err) { /* ignore */ }
        renderNotes("notes");
        if (drawers.stats && drawers.stats.classList.contains("is-open")) renderStats();
        M.toast("笔记已删除", "trash");
        return;
      }
      const delHighlight = e.target.closest("[data-del-highlight]");
      if (delHighlight) {
        const id = delHighlight.getAttribute("data-del-highlight");
        let all = [];
        try { all = JSON.parse(localStorage.getItem("moread.highlights") || "[]"); } catch (err) { all = []; }
        saveHighlights(all.filter((h) => h.id !== id));
        renderNotes("highlights");
        if (drawers.stats && drawers.stats.classList.contains("is-open")) renderStats();
        M.toast("划线已删除", "trash");
      }
    });
  }

  function openNoteComposer(quote) {
    pendingQuote = quote || "";
    const quoteBox = document.getElementById("pendingQuote");
    if (quoteBox) {
      quoteBox.textContent = pendingQuote ? "“" + pendingQuote + "”" : "";
      quoteBox.hidden = !pendingQuote;
    }
    openDrawer("notes");
    renderNotes("notes");
    setTimeout(() => { const input = document.getElementById("noteInput"); if (input) input.focus(); }, 300);
  }

  /* selection toolbar ----------------------------------------- */
  const selPop = document.getElementById("selectionPop");
  let pendingRange = null;

  function closeSelection() {
    if (selPop) selPop.classList.remove("is-on");
  }

  function onSelectionEnd(e) {
    if (e && e.target.closest(".selection-pop")) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { closeSelection(); return; }
    const text = sel.toString().trim();
    if (!text) { closeSelection(); return; }
    const range = sel.getRangeAt(0);
    const content = document.getElementById("readerContent");
    if (!content || !content.contains(range.commonAncestorContainer)) { closeSelection(); return; }
    pendingRange = range.cloneRange();
    const rect = range.getBoundingClientRect();
    if (!selPop) return;
    selPop.classList.add("is-on");
    const width = 190;
    const left = Math.min(window.innerWidth - width - 10, Math.max(10, rect.left + rect.width / 2 - width / 2));
    const top = rect.top > 60 ? rect.top - 44 : rect.bottom + 8;
    selPop.style.left = left + "px";
    selPop.style.top = top + "px";
  }

  document.addEventListener("mouseup", (e) => setTimeout(() => onSelectionEnd(e), 0));
  document.addEventListener("touchend", (e) => setTimeout(() => onSelectionEnd(e), 0));
  document.addEventListener("scroll", closeSelection, { passive: true });
  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest(".selection-pop") && !e.target.closest("#readerContent")) closeSelection();
  });

  function applyHighlight() {
    const text = pendingRange ? pendingRange.toString().trim() : "";
    if (!text) return;
    try {
      const mark = document.createElement("mark");
      pendingRange.surroundContents(mark);
    } catch (err) { /* selection spans elements */ }
    const list = JSON.parse(localStorage.getItem("moread.highlights") || "[]");
    list.unshift({ id: "h" + Date.now(), bookId: book.id, text: text, date: "刚刚" });
    saveHighlights(list);
    closeSelection();
    if (drawers.stats && drawers.stats.classList.contains("is-open")) renderStats();
    M.toast("已划线", "highlighter");
  }

  if (selPop) {
    selPop.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sel]");
      if (!btn) return;
      const action = btn.getAttribute("data-sel");
      const text = pendingRange ? pendingRange.toString().trim() : "";
      if (action === "highlight") applyHighlight();
      else if (action === "note") { closeSelection(); openNoteComposer(text); }
      else if (action === "copy") {
        closeSelection();
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(() => M.toast("已复制选中文字", "copy"))
            .catch(() => M.toast("复制失败，请手动选择文字", "info"));
        } else {
          M.toast("复制失败，请手动选择文字", "info");
        }
      }
    });
  }

  /* reading stats --------------------------------------------- */
  const sessionStart = Date.now();

  function currentPercent() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 100;
  }

  function renderStats() {
    const pct = Math.round(currentPercent());
    const minutes = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
    const notesCount = D.notes.filter((n) => n.bookId === book.id).length + customNotes().length;
    const hlCount = highlights().length;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set("statSession", String(minutes));
    set("statPercent", pct + "%");
    set("statNotes", String(notesCount));
    set("statHighlights", String(hlCount));
    set("statStarted", new Date(sessionStart).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    set("statBookmark", getBookmarks().includes(book.id) ? "已收藏" : "未收藏");
    const back = document.getElementById("statBack");
    if (back) back.href = "book.html?id=" + book.id;

    const weekBox = document.getElementById("statWeek");
    if (weekBox) {
      const vals = D.stats.profileWeekly;
      const labels = D.stats.profileWeeklyLabels;
      const max = Math.max.apply(null, vals);
      weekBox.innerHTML = vals.map((v, i) =>
        '<span class="stat-week__bar"><i style="height:' + Math.max(6, Math.round((v / max) * 100)) + '%"></i><em>' + labels[i] + "</em></span>"
      ).join("");
    }
  }

  /* end-of-chapter actions ----------------------------------- */
  const endNext = document.getElementById("endNext");
  const endNote = document.getElementById("endNote");
  const endBack = document.getElementById("endBack");
  if (endNext) endNext.addEventListener("click", () => M.toast("演示版仅提供第一章样章", "info"));
  if (endNote) endNote.addEventListener("click", () => openNoteComposer(""));
  if (endBack) endBack.href = "book.html?id=" + book.id;

  /* init ------------------------------------------------------ */
  applySettings();
  renderHeader();
  renderArticle();
  renderToc();
  renderNotes("notes");
  syncBookmark();
  updateProgress();
  restoreProgress();
})();
