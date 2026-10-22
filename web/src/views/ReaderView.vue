<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { booksApi } from "../api/books";
import { readingApi } from "../api/reading";
import { notesApi } from "../api/notes";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import BookCover from "../components/BookCover.vue";
import Icon from "../components/Icon.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const book = ref(null);
const chapter = ref(null);
const bookId = computed(() => route.params.id);
const drawer = ref("");
const controlsOpen = ref(false);
const noteTab = ref("notes");
const notes = ref([]);
const stats = ref(null);
const pendingQuote = ref("");
const noteInput = ref("");
const progressPercent = ref(0);
const loading = ref(true);
const noteLoading = ref(false);

const savedSettings = (() => {
  try { return JSON.parse(localStorage.getItem("moread.reader") || "null") || {}; }
  catch (e) { return {}; }
})();
const settings = reactive({
  fs: savedSettings.fs || 19,
  lh: savedSettings.lh || 2,
  theme: savedSettings.theme || (document.documentElement.dataset.theme === "dark" ? "night" : "paper")
});
watch(settings, (value) => {
  try { localStorage.setItem("moread.reader", JSON.stringify(value)); } catch (e) { /* ignore */ }
}, { deep: true });

const sessionStart = Date.now();
let sessionTick = Date.now();
let sessionTimer = null;
let scrollSaveTimer = null;
let userHasScrolled = false;
let ignoreScrollUntil = 0;
const sentThresholds = new Set();

const selection = reactive({ show: false, text: "", x: 0, y: 0 });

const paragraphs = computed(() => {
  const text = chapter.value?.content || "";
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
});

const currentChapterIndex = computed(() => {
  if (!book.value?.chapters || !chapter.value) return -1;
  return book.value.chapters.findIndex((c) => c.orderNo === chapter.value.orderNo);
});

const nextChapter = computed(() => {
  if (!book.value?.chapters) return null;
  return book.value.chapters[currentChapterIndex.value + 1] || null;
});

const noteCount = computed(() => notes.value.filter((n) => n.type === "NOTE").length);
const highlightCount = computed(() => notes.value.filter((n) => n.type === "HIGHLIGHT").length);
const weekMax = computed(() => Math.max(1, ...(stats.value?.weeklyMinutes || [1])));
const bookmarked = ref(false);

const sessionMinutes = () => Math.max(1, Math.round((Date.now() - sessionStart) / 60000));

function startTime() {
  return new Date(sessionStart).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

async function load() {
  loading.value = true;
  userHasScrolled = false;
  try {
    const detail = await booksApi.detail(bookId.value);
    book.value = detail;
    const orderNo = Number(route.query.chapter) || detail.chapters?.[0]?.orderNo || 1;
    const [chapterData, progress, noteList] = await Promise.all([
      booksApi.chapter(bookId.value, orderNo),
      readingApi.progress(bookId.value).catch(() => null),
      notesApi.list({ bookId: bookId.value }).catch(() => [])
    ]);
    chapter.value = chapterData;
    notes.value = noteList || [];
    const savedBookmarks = JSON.parse(localStorage.getItem("moread.bookmarks") || "[]");
    bookmarked.value = savedBookmarks.includes(bookId.value);
    progressPercent.value = Number(progress?.percent || 0);
    await readingApi.event({ bookId: bookId.value, eventType: "START_READ" }).catch(() => {});
    startSession();
    if (route.query.resume === "1" && progressPercent.value > 5) {
      setTimeout(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (progressPercent.value / 100) * max });
        ui.notify("已回到上次阅读的位置", "book-open");
      }, 300);
    }
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    loading.value = false;
  }
}

async function loadChapter(orderNo) {
  try {
    const data = await booksApi.chapter(bookId.value, orderNo);
    chapter.value = data;
    sentThresholds.clear();
    drawer.value = "";
    userHasScrolled = false;
    ignoreScrollUntil = Date.now() + 1200;
    router.replace({ path: `/reader/${bookId.value}`, query: { chapter: orderNo } });
    window.scrollTo({ top: 0 });
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function startSession() {
  sessionTick = Date.now();
  clearInterval(sessionTimer);
  sessionTimer = setInterval(() => {
    const seconds = Math.round((Date.now() - sessionTick) / 1000);
    if (seconds > 0) {
      readingApi.event({
        bookId: bookId.value,
        eventType: "SESSION",
        durationSeconds: seconds,
        percent: progressPercent.value
      }).catch(() => {});
      sessionTick = Date.now();
    }
  }, 60000);
}

function updateProgress(fromScroll = false) {
  if (fromScroll) userHasScrolled = true;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100))) : 100;
  progressPercent.value = pct;
  selection.show = false;
  if (!userHasScrolled) return;
  if (book.value) {
    [25, 50, 75, 100].forEach((threshold) => {
      if (pct >= threshold && !sentThresholds.has(threshold)) {
        sentThresholds.add(threshold);
        readingApi.event({
          bookId: bookId.value,
          eventType: "PROGRESS",
          percent: threshold,
          chapterNo: chapter.value?.orderNo || 1
        }).catch(() => {});
      }
    });
  }
  if (scrollSaveTimer) return;
  scrollSaveTimer = setTimeout(() => {
    scrollSaveTimer = null;
    if (book.value && chapter.value) {
      readingApi.saveProgress(bookId.value, {
        percent: progressPercent.value,
        chapterNo: chapter.value.orderNo
      }).catch(() => {});
    }
  }, 3000);
}

function toggleDrawer(name) {
  drawer.value = drawer.value === name ? "" : name;
  controlsOpen.value = false;
  if (name === "stats") loadStats();
  if (name === "notes") loadNotes();
}

function closeDrawer() {
  drawer.value = "";
}

async function loadNotes() {
  noteLoading.value = true;
  try {
    notes.value = await notesApi.list({ bookId: bookId.value });
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    noteLoading.value = false;
  }
}

async function loadStats() {
  try {
    stats.value = await readingApi.stats();
  } catch (e) {
    stats.value = null;
  }
}

async function saveNote() {
  const text = noteInput.value.trim();
  if (!text && !pendingQuote.value) {
    ui.notify("写点什么再保存吧", "info");
    return;
  }
  try {
    await notesApi.create({
      bookId: bookId.value,
      chapterNo: chapter.value?.orderNo || 1,
      quote: pendingQuote.value,
      content: text,
      type: "NOTE",
      page: "当前位置"
    });
    noteInput.value = "";
    pendingQuote.value = "";
    await loadNotes();
    ui.notify("笔记已保存", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function deleteNote(id) {
  try {
    await notesApi.remove(id);
    await loadNotes();
    ui.notify("笔记已删除", "trash");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function saveHighlight(text) {
  try {
    await notesApi.create({
      bookId: bookId.value,
      chapterNo: chapter.value?.orderNo || 1,
      quote: text,
      content: "",
      type: "HIGHLIGHT",
      page: "当前位置"
    });
    await loadNotes();
    ui.notify("已划线", "highlighter");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function onSelectionEnd(event) {
  if (event?.target?.closest?.(".selection-pop")) return;
  setTimeout(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      selection.show = false;
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      selection.show = false;
      return;
    }
    const range = sel.getRangeAt(0);
    const content = document.getElementById("readerContent");
    if (!content || !content.contains(range.commonAncestorContainer)) {
      selection.show = false;
      return;
    }
    const rect = range.getBoundingClientRect();
    selection.text = text;
    selection.x = Math.min(window.innerWidth - 200, Math.max(10, rect.left + rect.width / 2 - 95));
    selection.y = rect.top > 60 ? rect.top - 44 : rect.bottom + 8;
    selection.show = true;
  }, 0);
}

function closeSelection() {
  selection.show = false;
}

async function highlightSelection() {
  const text = selection.text;
  closeSelection();
  if (!text) return;
  try {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const mark = document.createElement("mark");
      sel.getRangeAt(0).surroundContents(mark);
    }
  } catch (e) { /* 跨元素选择不强求视觉标记 */ }
  await saveHighlight(text);
}

function noteSelection() {
  pendingQuote.value = selection.text;
  closeSelection();
  toggleDrawer("notes");
  noteTab.value = "notes";
}

async function copySelection() {
  const text = selection.text;
  closeSelection();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    ui.notify("已复制选中文字", "copy");
  } catch (e) {
    ui.notify("复制失败，请手动选择文字", "info");
  }
}

function toggleBookmark() {
  const list = JSON.parse(localStorage.getItem("moread.bookmarks") || "[]");
  const index = list.indexOf(bookId.value);
  if (index >= 0) list.splice(index, 1);
  else list.push(bookId.value);
  localStorage.setItem("moread.bookmarks", JSON.stringify(list));
  bookmarked.value = index < 0;
  ui.notify(index >= 0 ? "已移除书签" : "已加入书签", "bookmark-simple");
}

function applyFont(delta) {
  settings.fs = delta === 0 ? 19 : Math.min(24, Math.max(16, settings.fs + delta));
}

function setLineHeight(value) {
  settings.lh = Number(value);
}

function setReaderTheme(theme) {
  settings.theme = theme;
}

function nextChapterAction() {
  if (nextChapter.value) loadChapter(nextChapter.value.orderNo);
  else ui.notify("已经是最后一章了", "info");
}

function sendFinalSession() {
  clearInterval(sessionTimer);
  const seconds = Math.round((Date.now() - sessionTick) / 1000);
  if (seconds > 5 && book.value) {
    readingApi.event({
      bookId: bookId.value,
      eventType: "SESSION",
      durationSeconds: seconds,
      percent: progressPercent.value
    }).catch(() => {});
  }
}

function onScroll() {
  if (Date.now() < ignoreScrollUntil) return;
  updateProgress(true);
}

watch(bookId, async () => {
  await load();
  updateProgress();
});

onMounted(async () => {
  await load();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("mouseup", onSelectionEnd);
  updateProgress();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  document.removeEventListener("mouseup", onSelectionEnd);
  sendFinalSession();
  if (userHasScrolled && book.value && chapter.value) {
    readingApi.saveProgress(bookId.value, {
      percent: progressPercent.value,
      chapterNo: chapter.value.orderNo
    }).catch(() => {});
  }
});
</script>

<template>
  <div
    class="reader"
    :data-reader-theme="settings.theme"
    :style="{ '--reader-fs': settings.fs + 'px', '--reader-lh': settings.lh }"
  >
    <header class="reader-bar">
      <div class="reader-bar__left">
        <RouterLink class="icon-btn" :to="'/book/' + bookId" aria-label="返回书籍详情">
          <Icon name="arrow-left" />
        </RouterLink>
        <div class="reader-bar__title">
          <strong>{{ book?.title || "阅读" }}</strong>
          <span>{{ chapter?.title || "" }}</span>
        </div>
      </div>
      <div class="reader-bar__right">
        <button class="reader-tool" type="button" @click="toggleDrawer('toc')"><Icon name="list" /><span>目录</span></button>
        <button class="reader-tool" type="button" @click="toggleDrawer('notes')"><Icon name="note-pencil" /><span>笔记</span></button>
        <button class="reader-tool" type="button" @click="toggleDrawer('stats')"><Icon name="chart-line" /><span>统计</span></button>
        <button class="reader-tool" type="button" @click="controlsOpen = !controlsOpen"><Icon name="text-aa" /><span>字号</span></button>
        <button class="reader-tool" type="button" @click="controlsOpen = !controlsOpen">
          <Icon :name="settings.theme === 'night' ? 'sun' : 'moon'" /><span>主题</span>
        </button>
        <button class="reader-tool" :class="{ 'is-on': bookmarked }" type="button" @click="toggleBookmark">
          <Icon name="bookmark-simple" /><span>{{ bookmarked ? "已收藏" : "书签" }}</span>
        </button>
      </div>
      <div class="reader-bar__line" :style="{ width: progressPercent + '%' }" />
    </header>

    <div class="reader-scrim" :class="{ 'is-on': Boolean(drawer) }" @click="closeDrawer" />

    <aside class="reader-drawer reader-drawer--left" :class="{ 'is-open': drawer === 'toc' }" aria-label="目录">
      <div class="drawer-head">
        <div><h2>目录</h2><p>{{ book?.chapters?.length || 0 }} 节 · 演示样章</p></div>
        <button class="drawer-close" type="button" aria-label="关闭目录" @click="closeDrawer"><Icon name="x" /></button>
      </div>
      <div class="drawer-body">
        <div v-if="book" class="toc-book">
          <BookCover :book="book" />
          <div>
            <div class="toc-book__title">{{ book.title }}</div>
            <div class="toc-book__meta">{{ book.author }} · 演示样章</div>
          </div>
        </div>
        <div class="toc-list">
          <button
            v-for="(item, i) in book?.chapters || []"
            :key="item.id"
            class="toc-item"
            :class="{ 'is-current': chapter?.orderNo === item.orderNo }"
            type="button"
            @click="loadChapter(item.orderNo)"
          >
            <span class="toc-item__no">{{ String(i + 1).padStart(2, "0") }}</span>
            <span>{{ item.title }}</span>
            <span class="toc-item__state">{{ chapter?.orderNo === item.orderNo ? "当前" : "" }}</span>
          </button>
        </div>
        <div class="toc-foot">
          <div class="toc-progress"><span>阅读进度</span><span>{{ progressPercent }}%</span></div>
          <div class="toc-progress__track"><i :style="{ width: progressPercent + '%' }" /></div>
          <RouterLink class="btn btn--ghost btn--sm" :to="'/book/' + bookId">返回书籍详情</RouterLink>
        </div>
      </div>
    </aside>

    <aside class="reader-drawer reader-drawer--right" :class="{ 'is-open': drawer === 'notes' }" aria-label="笔记">
      <div class="drawer-head">
        <div><h2>笔记</h2><p>划线、想法与出处</p></div>
        <button class="drawer-close" type="button" aria-label="关闭笔记" @click="closeDrawer"><Icon name="x" /></button>
      </div>
      <div class="drawer-tabs">
        <button class="drawer-tab" :class="{ 'is-active': noteTab === 'notes' }" type="button" @click="noteTab = 'notes'">笔记</button>
        <button class="drawer-tab" :class="{ 'is-active': noteTab === 'highlights' }" type="button" @click="noteTab = 'highlights'">划线</button>
      </div>
      <div class="drawer-body">
        <template v-if="noteTab === 'notes'">
          <div v-for="note in notes.filter((n) => n.type === 'NOTE')" :key="note.id" class="note-entry">
            <div v-if="note.quote" class="note-entry__quote">“{{ note.quote }}”</div>
            <div v-if="note.note" class="note-entry__text">{{ note.note }}</div>
            <div class="note-entry__meta">
              <span>{{ note.page || "当前位置" }}</span>
              <span class="row gap-6">{{ note.date }}<button class="note-entry__del" type="button" @click="deleteNote(note.id)"><Icon name="trash" /></button></span>
            </div>
          </div>
          <div v-if="!notes.some((n) => n.type === 'NOTE')" class="note-empty">
            <img src="/assets/img/undraw/reading-notes_dg9z.svg" alt="正在写笔记">
            <p>这本书还没有笔记。<br>选中一段文字，记下你的想法。</p>
          </div>
        </template>
        <template v-else>
          <div v-for="note in notes.filter((n) => n.type === 'HIGHLIGHT')" :key="note.id" class="note-entry">
            <div class="note-entry__quote">“{{ note.quote }}”</div>
            <div class="note-entry__meta">
              <span>划线</span>
              <span class="row gap-6">{{ note.date }}<button class="note-entry__del" type="button" @click="deleteNote(note.id)"><Icon name="trash" /></button></span>
            </div>
          </div>
          <div v-if="!notes.some((n) => n.type === 'HIGHLIGHT')" class="note-empty">
            <img src="/assets/img/undraw/annotations_2xx4.svg" alt="批注">
            <p>还没有划线。<br>选中正文中的句子，点击“划线”。</p>
          </div>
        </template>
      </div>
      <div v-if="noteTab === 'notes'" class="note-compose">
        <div v-if="pendingQuote" class="note-entry__quote">“{{ pendingQuote }}”</div>
        <label class="sr-only" for="noteInput">写笔记</label>
        <textarea id="noteInput" v-model="noteInput" class="textarea" placeholder="写下你的想法…" />
        <button class="btn btn--sm" type="button" @click="saveNote">保存笔记</button>
      </div>
    </aside>

    <aside class="reader-drawer reader-drawer--right" :class="{ 'is-open': drawer === 'stats' }" aria-label="阅读统计">
      <div class="drawer-head">
        <div><h2>阅读统计</h2><p>本次阅读与本书进度</p></div>
        <button class="drawer-close" type="button" aria-label="关闭统计" @click="closeDrawer"><Icon name="x" /></button>
      </div>
      <div class="drawer-body">
        <div class="stat-grid">
          <div class="stat-tile"><strong>{{ sessionMinutes() }}</strong><span>本次阅读（分钟）</span></div>
          <div class="stat-tile"><strong>{{ progressPercent }}%</strong><span>本书进度</span></div>
          <div class="stat-tile"><strong>{{ noteCount }}</strong><span>本书笔记</span></div>
          <div class="stat-tile"><strong>{{ highlightCount }}</strong><span>本书划线</span></div>
        </div>
        <div class="stat-section">
          <h3>本周阅读</h3>
          <div class="stat-week">
            <span v-for="(value, i) in stats?.weeklyMinutes || [0,0,0,0,0,0,0]" :key="i" class="stat-week__bar">
              <i :style="{ height: Math.max(6, Math.round((value / weekMax) * 100)) + '%' }" />
              <em>{{ (stats?.weeklyLabels || ['一','二','三','四','五','六','日'])[i] }}</em>
            </span>
          </div>
          <p class="stat-caption">共 {{ (stats?.weeklyMinutes || []).reduce((a, b) => a + b, 0) }} 分钟 · 本周记录</p>
        </div>
        <div class="stat-section">
          <h3>本书状态</h3>
          <ul class="stat-list">
            <li><span>开始阅读</span><span>{{ startTime() }}</span></li>
            <li><span>书签</span><span>{{ bookmarked ? "已收藏" : "未收藏" }}</span></li>
            <li><span>本章预计</span><span>约 6 分钟</span></li>
          </ul>
        </div>
        <div class="stat-section">
          <RouterLink class="btn btn--ghost btn--sm" :to="'/book/' + bookId">返回书目</RouterLink>
        </div>
      </div>
    </aside>

    <main class="reader-main">
      <article v-if="chapter" class="reader-article">
        <div class="reader-kicker"><span>墨阅 · 样章</span><span class="demo-badge">演示文本</span></div>
        <h1 class="reader-title">{{ chapter.title }}</h1>
        <p class="reader-subtitle">《{{ book?.title }}》 · 第 {{ chapter.orderNo }} 节 · 演示样章</p>
        <div class="reader-meta">
          <span>{{ book?.author }}</span>
          <span>约 {{ (chapter.content || "").length }} 字</span>
          <span>预计 6 分钟</span>
          <span>{{ book?.category }}</span>
        </div>
        <div class="reader-notice">说明：本页正文为平台演示文本，用于展示阅读器排版、划线、笔记与阅读统计；正式版接入授权内容后替换。</div>
        <div id="readerContent" class="reader-content">
          <template v-if="paragraphs.length">
            <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
            <div class="reader-ornament">※</div>
          </template>
          <div v-else class="reader-notice" style="margin-top:24px">
            本章正文尚未导入演示数据。你可以回到目录，从第一章开始阅读。
          </div>
        </div>
        <div class="reader-end">
          <h3>这一章读完了</h3>
          <p>书不会催人。你可以把书签留在这里，明天再回来。</p>
          <div class="reader-end__actions">
            <button class="btn btn--ghost" type="button" @click="nextChapterAction">下一章</button>
            <button class="btn btn--ghost" type="button" @click="toggleDrawer('notes')">写一条笔记</button>
            <RouterLink class="btn btn--accent" :to="'/book/' + bookId">返回书目</RouterLink>
          </div>
        </div>
      </article>
      <p v-else-if="loading" class="muted" style="padding:100px 24px;text-align:center">正在打开这一章…</p>
    </main>

    <div class="reader-float" aria-hidden="true">
      <span class="reader-float__pct">{{ progressPercent }}%</span>
      <span class="reader-float__track"><i :style="{ width: progressPercent + '%' }" /></span>
    </div>

    <div class="reader-controls" :class="{ 'is-open': controlsOpen }">
      <div class="reader-controls__row">
        <span class="reader-controls__label">字号</span>
        <div class="reader-controls__group">
          <button type="button" @click="applyFont(-1)">A−</button>
          <button type="button" @click="applyFont(0)">{{ settings.fs }}</button>
          <button type="button" @click="applyFont(1)">A+</button>
        </div>
      </div>
      <div class="reader-controls__row">
        <span class="reader-controls__label">行距</span>
        <div class="reader-controls__group">
          <button type="button" :class="{ 'is-active': settings.lh === 1.8 }" @click="setLineHeight(1.8)">紧</button>
          <button type="button" :class="{ 'is-active': settings.lh === 2 }" @click="setLineHeight(2)">标准</button>
          <button type="button" :class="{ 'is-active': settings.lh === 2.2 }" @click="setLineHeight(2.2)">松</button>
        </div>
      </div>
      <div class="reader-controls__row">
        <span class="reader-controls__label">主题</span>
        <div class="theme-swatches">
          <button class="theme-swatch" :class="{ 'is-active': settings.theme === 'paper' }" type="button" data-reader-theme="paper" aria-label="纸白主题" @click="setReaderTheme('paper')" />
          <button class="theme-swatch" :class="{ 'is-active': settings.theme === 'sepia' }" type="button" data-reader-theme="sepia" aria-label="米黄主题" @click="setReaderTheme('sepia')" />
          <button class="theme-swatch" :class="{ 'is-active': settings.theme === 'night' }" type="button" data-reader-theme="night" aria-label="夜间主题" @click="setReaderTheme('night')" />
        </div>
      </div>
    </div>

    <div
      v-if="selection.show"
      class="selection-pop is-on"
      :style="{ left: selection.x + 'px', top: selection.y + 'px' }"
      role="toolbar"
      aria-label="选中文字操作"
    >
      <button type="button" @click="highlightSelection"><Icon name="highlighter" />划线</button>
      <button type="button" @click="noteSelection"><Icon name="note-pencil" />记笔记</button>
      <button type="button" @click="copySelection"><Icon name="copy" />复制</button>
    </div>
  </div>
</template>
