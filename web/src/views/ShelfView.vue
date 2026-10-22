<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { shelfApi } from "../api/shelf";
import { profileApi } from "../api/profile";
import { useUiStore } from "../stores/ui";
import BookCover from "../components/BookCover.vue";
import StarRating from "../components/StarRating.vue";
import EmptyState from "../components/EmptyState.vue";
import Icon from "../components/Icon.vue";

const router = useRouter();
const ui = useUiStore();

const shelf = ref({ reading: [], want: [], finished: [], paused: [] });
const stats = ref(null);
const active = ref("reading");
const loading = ref(true);

const tabs = [
  { id: "reading", label: "在读" },
  { id: "want", label: "想读" },
  { id: "finished", label: "读完" },
  { id: "paused", label: "搁置" }
];

const counts = computed(() => ({
  reading: shelf.value.reading?.length || 0,
  want: shelf.value.want?.length || 0,
  finished: shelf.value.finished?.length || 0,
  paused: shelf.value.paused?.length || 0
}));

const currentItems = computed(() => shelf.value[active.value] || []);
const continueItem = computed(() => {
  const all = [...(shelf.value.reading || []), ...(shelf.value.want || [])];
  return all.find((item) => item.percent > 0) || all[0] || null;
});
const weekMax = computed(() => Math.max(1, ...(stats.value?.weeklyMinutes || [1])));

async function load() {
  loading.value = true;
  try {
    const [shelfData, statsData] = await Promise.all([
      shelfApi.get(),
      profileApi.stats()
    ]);
    shelf.value = shelfData;
    stats.value = statsData;
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    loading.value = false;
  }
}

async function remove(item) {
  try {
    await shelfApi.remove(item.book.id);
    await load();
    ui.notify("已从书架移除", "bookmark-simple");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function read(item) {
  router.push(`/reader/${item.book.id}`);
}

function resume(item) {
  router.push({ path: `/reader/${item.book.id}`, query: { resume: "1" } });
}

onMounted(load);
</script>

<template>
  <main id="main" class="main">
    <header class="page-head">
      <div class="page-head__main">
        <p class="kicker">你的阅读现场</p>
        <h1>我的书架</h1>
        <p class="page-head__meta">{{ counts.reading }} 本在读 · {{ counts.want }} 本想读 · {{ counts.finished }} 本读完</p>
      </div>
      <div class="page-head__aside">
        <button class="btn btn--quiet btn--sm" type="button" @click="ui.notify('管理书架：点击书封右上角可移除', 'sliders-horizontal')">
          <Icon name="sliders-horizontal" /> 管理书架
        </button>
        <RouterLink class="btn btn--ghost btn--sm" to="/discover">去书库</RouterLink>
      </div>
    </header>

    <section style="padding-top:26px" aria-label="继续阅读">
      <div v-if="continueItem" class="continue-card">
        <RouterLink class="continue-card__cover" :to="'/book/' + continueItem.book.id">
          <BookCover :book="continueItem.book" />
        </RouterLink>
        <div class="continue-card__body">
          <span class="continue-card__label">继续阅读</span>
          <h2 class="continue-card__title">
            <RouterLink :to="'/book/' + continueItem.book.id">{{ continueItem.book.title }}</RouterLink>
          </h2>
          <span class="continue-card__chapter">
            第 {{ continueItem.chapterNo || 1 }} 章 · 上次阅读 {{ continueItem.lastReadAt || "—" }}
          </span>
          <div class="continue-card__progress">
            <span>已读 {{ Math.round(continueItem.percent || 0) }}%</span>
            <span class="progress"><i class="progress__bar" :style="{ width: (continueItem.percent || 0) + '%' }" /></span>
            <span>{{ continueItem.book.words }} 字</span>
          </div>
        </div>
        <div class="continue-card__actions">
          <button class="btn btn--accent" type="button" @click="resume(continueItem)"><Icon name="book-open" /> 继续阅读</button>
          <RouterLink class="btn btn--ghost btn--sm" :to="'/book/' + continueItem.book.id">查看详情</RouterLink>
          <span class="muted">{{ continueItem.book.author }}</span>
        </div>
      </div>
      <EmptyState
        v-else
        title="书架还是空的"
        copy="去书库挑一本，从今天开始读。"
      >
        <RouterLink class="btn btn--sm" to="/discover">去书库</RouterLink>
      </EmptyState>
    </section>

    <div class="shelf-tabs-row">
      <div class="tabs" role="tablist" aria-label="书架分类">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ 'is-active': active === tab.id }"
          type="button"
          @click="active = tab.id"
        >
          {{ tab.label }}<span class="tab__count">{{ counts[tab.id] }}</span>
        </button>
      </div>
      <div class="shelf-toolbar">
        <button class="btn btn--quiet btn--sm" type="button" @click="ui.notify('已按最近阅读排序', 'arrows-clockwise')">
          <Icon name="arrows-clockwise" /> 最近阅读
        </button>
      </div>
    </div>

    <div class="shelf-grid">
      <article v-for="item in currentItems" :key="item.book.id" class="shelf-item">
        <div class="shelf-item__cover">
          <RouterLink :to="'/book/' + item.book.id">
            <BookCover :book="item.book" />
          </RouterLink>
          <button class="shelf-item__remove" type="button" aria-label="从书架移除" @click="remove(item)">
            <Icon name="x" />
          </button>
        </div>
        <div class="shelf-item__info">
          <RouterLink class="shelf-item__title" :to="'/book/' + item.book.id">{{ item.book.title }}</RouterLink>
          <div class="shelf-item__meta">
            <span>{{ item.book.author }}</span>
            <span>{{ item.book.category }}</span>
          </div>
          <div class="shelf-item__progress">
            <div class="shelf-item__meta">
              <span>{{ active === "finished" ? "已读完" : (item.percent ? "已读 " + Math.round(item.percent) + "%" : "尚未开始") }}</span>
              <StarRating v-if="active === 'finished'" :rating="item.book.rating" />
            </div>
            <div class="progress"><i class="progress__bar" :style="{ width: (active === 'finished' ? 100 : (item.percent || 0)) + '%' }" /></div>
          </div>
        </div>
      </article>
      <EmptyState
        v-if="!currentItems.length && !loading"
        :title="active === 'paused' ? '这里还没有搁置的书' : '这一格还是空的'"
        :copy="active === 'paused' ? '读不下去的书可以先放在这里，不着急。' : '去书库挑一本，加入书架后会出现在这里。'"
        style="grid-column:1/-1"
      >
        <RouterLink class="btn btn--ghost btn--sm" to="/discover">去书库</RouterLink>
      </EmptyState>
    </div>

    <section class="shelf-stats" aria-labelledby="statsTitle">
      <div>
        <div class="shelf-stats__head">
          <h3 id="statsTitle">本周阅读</h3>
          <span>共 {{ (stats?.weeklyMinutes || []).reduce((a, b) => a + b, 0) }} 分钟</span>
        </div>
        <div class="week-bars">
          <div
            v-for="(value, i) in stats?.weeklyMinutes || [0,0,0,0,0,0,0]"
            :key="i"
            class="week-bar"
            :title="'周' + (stats?.weeklyLabels?.[i] || '') + '：' + value + ' 分钟'"
          >
            <span class="week-bar__value">{{ value }}</span>
            <span class="week-bar__fill" :style="{ height: Math.max(4, Math.round((value / weekMax) * 100)) + '%' }" />
            <span class="week-bar__label">{{ (stats?.weeklyLabels || ['一','二','三','四','五','六','日'])[i] }}</span>
          </div>
        </div>
        <details class="chart-data" style="margin-top:12px">
          <summary>查看数据表</summary>
          <table>
            <thead><tr><th>星期</th><th>阅读时长（分钟）</th></tr></thead>
            <tbody>
              <tr v-for="(value, i) in stats?.weeklyMinutes || []" :key="i">
                <td>周{{ (stats?.weeklyLabels || [])[i] }}</td>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>
      <div class="shelf-stats__side">
        <div>
          <div class="big">{{ stats?.hours || 0 }}<span class="small muted" style="font-family:var(--sans);font-size:12px"> 小时</span></div>
          <p class="muted">累计阅读时长 · 超过大多数读者</p>
        </div>
        <div class="row gap-24 wrap">
          <div><strong style="font-family:var(--serif);font-size:22px">{{ stats?.streak || 0 }}</strong><div class="small muted">连续阅读天数</div></div>
          <div><strong style="font-family:var(--serif);font-size:22px">{{ stats?.finished || 0 }}</strong><div class="small muted">今年读完</div></div>
        </div>
        <img src="/assets/img/undraw/reading-time_jva3.svg" alt="一个人在阅读计时器旁读书">
      </div>
    </section>
  </main>
</template>
