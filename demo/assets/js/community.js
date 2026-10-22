/* 墨阅 MoRead — community */
(function () {
  "use strict";
  const D = window.MOREAD_DATA;
  const M = window.MOREAD;
  const TOPICS = ["全部", "本周共读", "书评", "摘录", "提问"];
  let active = "全部";
  let extraPosts = [];

  function allPosts() { return extraPosts.concat(D.posts); }

  function localComments() {
    try { return JSON.parse(localStorage.getItem("moread.comments") || "[]"); }
    catch (err) { return []; }
  }
  function saveLocalComments(list) {
    try { localStorage.setItem("moread.comments", JSON.stringify(list)); } catch (err) { /* ignore */ }
  }
  function commentsFor(postId) {
    return (D.postComments || []).concat(localComments()).filter((c) => c.postId === postId);
  }

  function handleOf(name) {
    const u = D.users.find((x) => x.name === name);
    return u ? u.handle : "@moread";
  }

  function renderTopics() {
    const box = document.getElementById("topicChips");
    if (!box) return;
    box.innerHTML = TOPICS.map((t) => {
      const n = t === "全部" ? allPosts().length : allPosts().filter((p) => p.topic === t).length;
      return '<button class="chip' + (active === t ? " is-active" : "") + '" type="button" data-topic="' + t + '">' +
        t + '<span class="chip__count">' + n + "</span></button>";
    }).join("");
    box.querySelectorAll("[data-topic]").forEach((btn) => {
      btn.addEventListener("click", () => { active = btn.getAttribute("data-topic"); renderTopics(); renderFeed(); });
    });
  }

  function postHTML(p) {
    const book = p.bookId ? M.bookById(p.bookId) : null;
    const commentCount = p.comments + localComments().filter((c) => c.postId === p.id).length;
    return '<article class="post" data-post="' + M.escape(p.id) + '">' +
      M.avatar(p.user, "") +
      '<div><div class="post__head"><span class="post__name">' + M.escape(p.user) + "</span>" +
      '<span class="post__handle">' + M.escape(handleOf(p.user)) + "</span>" +
      '<span class="post__time">' + M.escape(p.time) + "</span>" +
      '<span class="post__topic">' + M.escape(p.topic) + "</span></div>" +
      '<p class="post__text">' + M.escape(p.text) + "</p>" +
      (p.image ? '<div class="post__image"><img src="' + M.escape(p.image) + '" alt="帖子配图" loading="lazy"></div>' : "") +
      (book ? '<a class="post__book" href="book.html?id=' + book.id + '">' + M.miniCover(book) + "《" + M.escape(book.title) + "》 · " + M.escape(book.author) + "</a>" : "") +
      '<div class="post__actions">' +
      '<button class="post__action" type="button" data-like="' + p.likes + '">' + M.icon("heart") + ' <span>' + p.likes + "</span></button>" +
      '<button class="post__action" type="button" data-comment-post="' + M.escape(p.id) + '">' + M.icon("chat-circle") + ' <span>' + commentCount + "</span></button>" +
      '<button class="post__action" type="button" data-save-post>' + M.icon("bookmark-simple") + " 收藏</button>" +
      '<button class="post__action" type="button" data-share-post>' + M.icon("share-network") + " 分享</button>" +
      "</div></div></article>";
  }

  function renderFeed() {
    const box = document.getElementById("postFeed");
    if (!box) return;
    const list = active === "全部" ? allPosts() : allPosts().filter((p) => p.topic === active);
    box.innerHTML = list.length
      ? list.map(postHTML).join("")
      : '<div class="empty"><img src="assets/img/undraw/sharing-knowledge_2jx3.svg" alt="两个人在交换一本书"><h3>这个话题还没有讨论</h3><p>不如由你开个头。</p><button class="btn btn--ghost btn--sm" type="button" data-open-composer>发起讨论</button></div>';
  }

  function bindFeed() {
    const box = document.getElementById("postFeed");
    if (!box) return;
    box.addEventListener("click", (e) => {
      const like = e.target.closest("[data-like]");
      if (like) {
        const on = like.classList.toggle("is-on");
        const base = Number(like.getAttribute("data-like"));
        like.querySelector("span").textContent = base + (on ? 1 : 0);
        return;
      }
      const comment = e.target.closest("[data-comment-post]");
      if (comment) { openComments(comment.getAttribute("data-comment-post")); return; }
      if (e.target.closest("[data-save-post]")) { M.toast("已收藏这条讨论", "bookmark-simple"); return; }
      if (e.target.closest("[data-share-post]")) { M.toast("链接已复制（演示）", "share-network"); return; }
      if (e.target.closest("[data-open-composer]")) openComposer();
    });
  }

  /* composer -------------------------------------------------- */
  function fillBookSelect() {
    const select = document.getElementById("postBook");
    if (!select) return;
    select.innerHTML = '<option value="">不关联书目</option>' +
      D.books.map((b) => '<option value="' + b.id + '">《' + M.escape(b.title) + "》 · " + M.escape(b.author) + "</option>").join("");
    select.value = "hulanhezhuan";
  }

  function openComposer() {
    const modal = document.getElementById("composerModal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => { const t = document.getElementById("postText"); if (t) t.focus(); }, 30);
  }
  function closeComposer() {
    const modal = document.getElementById("composerModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function bindComposer() {
    const openers = document.querySelectorAll("[data-open-composer]");
    openers.forEach((b) => b.addEventListener("click", openComposer));
    const modal = document.getElementById("composerModal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-close-modal]")) closeComposer();
    });
    const form = document.getElementById("composerForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("postText").value.trim();
      if (text.length < 5) { M.toast("再多写几个字吧", "info"); return; }
      const topic = document.getElementById("postTopic").value;
      const bookId = document.getElementById("postBook").value;
      extraPosts.unshift({
        id: "local" + Date.now(), user: "林见鹿", avatar: 1, time: "刚刚", topic: topic,
        bookId: bookId, text: text, image: "", likes: 0, comments: 0
      });
      active = "全部";
      closeComposer();
      form.reset();
      fillBookSelect();
      renderTopics();
      renderFeed();
      M.toast("讨论已发布（演示）", "check-circle");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeComposer();
    });
  }

  /* comments -------------------------------------------------- */
  let activePostId = null;

  function postById(id) { return allPosts().find((p) => p.id === id); }

  function postSummaryHTML(p) {
    const book = p.bookId ? M.bookById(p.bookId) : null;
    return '<div class="comment-post">' + M.avatar(p.user, "") +
      '<div><div class="post__head"><span class="post__name">' + M.escape(p.user) + "</span>" +
      '<span class="post__handle">' + M.escape(handleOf(p.user)) + "</span>" +
      '<span class="post__time">' + M.escape(p.time) + "</span>" +
      '<span class="post__topic">' + M.escape(p.topic) + "</span></div>" +
      '<p class="post__text">' + M.escape(p.text) + "</p>" +
      (book ? '<a class="post__book" href="book.html?id=' + book.id + '">' + M.miniCover(book) + "《" + M.escape(book.title) + "》</a>" : "") +
      "</div></div>";
  }

  function renderComments() {
    const post = postById(activePostId);
    if (!post) return;
    const list = commentsFor(activePostId);
    const sub = document.getElementById("commentsSub");
    if (sub) sub.textContent = list.length ? list.length + " 条回应" : "还没有回应，来坐第一排";
    const postBox = document.getElementById("commentsPost");
    if (postBox) postBox.innerHTML = postSummaryHTML(post);
    const listBox = document.getElementById("commentList");
    if (listBox) {
      listBox.innerHTML = list.length
        ? list.map((c) =>
          '<div class="comment-item">' + M.avatar(c.user, "avatar--sm") +
          '<div><div class="comment-item__head"><span class="comment-item__name">' + M.escape(c.user) + "</span><span>" + M.escape(c.time) + "</span></div>" +
          '<p class="comment-item__text">' + M.escape(c.text) + "</p></div></div>"
        ).join("")
        : '<div class="comment-empty">还没有人回应。写下一句，让讨论继续。</div>';
    }
  }

  function openComments(postId) {
    const post = postById(postId);
    if (!post) return;
    activePostId = postId;
    const modal = document.getElementById("commentsModal");
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    renderComments();
  }

  function closeComments() {
    const modal = document.getElementById("commentsModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function bindComments() {
    const modal = document.getElementById("commentsModal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-close-comments]")) closeComments();
    });
    const form = document.getElementById("commentForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("commentInput");
        const text = input.value.trim();
        if (text.length < 2) { M.toast("再多写几个字吧", "info"); return; }
        const list = localComments();
        list.unshift({
          postId: activePostId,
          user: "林见鹿",
          avatar: 1,
          time: "刚刚",
          text: text
        });
        saveLocalComments(list);
        input.value = "";
        renderComments();
        renderFeed();
        M.toast("回应已发布（演示）", "check-circle");
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeComments();
    });
  }

  /* sidebar --------------------------------------------------- */
  function renderSidebar() {
    const bookBox = document.getElementById("sideBook");
    if (bookBox) {
      const b = M.bookById("hulanhezhuan");
      bookBox.innerHTML = M.cover(b) +
        '<div><div class="side-book__title"><a href="book.html?id=' + b.id + '">《' + M.escape(b.title) + "》</a></div>" +
        '<div class="side-book__meta">' + M.escape(b.author) + " · 36 人在读</div>" +
        '<div class="side-book__meta">本周讨论 12 条</div></div>';
    }
    const readerBox = document.getElementById("activeReaders");
    if (readerBox) {
      readerBox.innerHTML = D.users.slice(1, 6).map((u, i) =>
        '<div class="active-reader">' + M.avatar(u.name, "avatar--sm") +
        '<span class="active-reader__name">' + M.escape(u.name) + "<small>" + M.escape(u.bio) + "</small></span>" +
        '<span class="active-reader__time">' + (i + 1) + " 小时前</span></div>"
      ).join("");
    }
  }

  /* init ------------------------------------------------------ */
  fillBookSelect();
  renderTopics();
  renderFeed();
  renderSidebar();
  bindFeed();
  bindComposer();
  bindComments();
})();
