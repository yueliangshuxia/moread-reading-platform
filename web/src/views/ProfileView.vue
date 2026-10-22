<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { profileApi } from "../api/profile";
import { notesApi } from "../api/notes";
import { shelfApi } from "../api/shelf";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { achievements } from "../content";
import Avatar from "../components/Avatar.vue";
import BookCover from "../components/BookCover.vue";
import StarRating from "../components/StarRating.vue";
import EmptyState from "../components/EmptyState.vue";
import ModalShell from "../components/ModalShell.vue";
import Icon from "../components/Icon.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const profile = ref(null);
const notes = ref([]);
const reviews = ref([]);
const shelf = ref({ reading: [], want: [], finished: [], paused: [] });
const loading = ref(true);
const activeTab = ref("records");
const goalTarget = ref(24);
const editOpen = ref(false);
const editName = ref("");
const editBio = ref("");

const stats = computed(() => profile.value?.stats || {});
const goal = computed(() => stats.value.goal || { year: new Date().getFullYear(), target: 24, finished: 0, percent: 0 });
const categories = computed(() => stats.value.categories || []);
const maxShare = computed(() => Math.max(1, ...categories.value.map((c) => c.value)));
const records = computed(() => [...(shelf.value.reading || []), ...(shelf.value.finished || [])].slice(0, 6));
const statusLabel = { PENDING: "待审", PASSED: "已通过", REJECTED: "已驳回" };

const monthLabels = computed(() => {
  const labels = [];
  const now = new Date();
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - (83 - i * 7));
    labels.push(i % 4 === 0 ? (d.getMonth() + 1) + " 月" : "");
  }
  return labels;
});

async function load() {
  loading.value = true;
  try {
    const [profileData, noteList, reviewList, shelfData] = await Promise.all([
      profileApi.get(),
      notesApi.list(),
      profileApi.reviews(),
      shelfApi.get()
    ]);
    profile.value = profileData;
    notes.value = noteList || [];
    reviews.value = reviewList || [];
    shelf.value = shelfData;
    goalTarget.value = profileData?.stats?.goal?.target || 24;
    editName.value = profileData?.name || "";
    editBio.value = profileData?.bio || "";
  } catch (e) {
    ui.notify(e.message, "info");
  } finally {
    loading.value = false;
  }
}

async function updateGoal() {
  try {
    const updated = await profileApi.updateGoal({
      year: goal.value.year,
      target: Number(goalTarget.value)
    });
    if (profile.value) profile.value.stats.goal = updated;
    ui.notify("阅读目标已更新", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

async function saveProfile() {
  try {
    const updated = await profileApi.update({
      name: editName.value.trim(),
      bio: editBio.value
    });
    profile.value = updated;
    await auth.me();
    editOpen.value = false;
    ui.notify("资料已更新", "check-circle");
  } catch (e) {
    ui.notify(e.message, "info");
  }
}

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(load);
</script>

<template>
  <main id="main" class="main">
    <div v-if="loading" class="section"><p class="muted">正在打开个人中心…</p></div>

    <template v-if="profile">
      <header class="profile-head">
        <Avatar :name="profile.name" />
        <div class="profile-head__main">
          <h1>{{ profile.name }}</h1>
          <p class="profile-head__handle">{{ profile.handle }} · {{ profile.joined }}加入</p>
          <p class="profile-head__bio">{{ profile.bio }}</p>
        </div>
        <div class="profile-head__actions">
          <button class="btn btn--ghost btn--sm" type="button" @click="editOpen = true">
            <Icon name="pencil-simple" /> 编辑资料
          </button>
          <button class="btn btn--quiet btn--sm" type="button" @click="logout">
            <Icon name="sign-out" /> 退出
          </button>
        </div>
      </header>

      <div class="profile-stats">
        <div class="profile-stat"><strong>{{ stats.hours || 0 }}</strong><span>累计阅读（小时）</span></div>
        <div class="profile-stat"><strong>{{ stats.finished || 0 }}</strong><span>今年读完</span></div>
        <div class="profile-stat"><strong>{{ stats.notes || 0 }}</strong><span>笔记与划线</span></div>
        <div class="profile-stat"><strong>{{ stats.streak || 0 }}</strong><span>连续阅读天数</span></div>
      </div>

      <div class="profile-layout">
        <div class="profile-main">
          <div class="tabs" role="tablist" aria-label="个人内容">
            <button class="tab" :class="{ 'is-active': activeTab === 'records' }" type="button" @click="activeTab = 'records'">阅读记录</button>
            <button class="tab" :class="{ 'is-active': activeTab === 'notes' }" type="button" @click="activeTab = 'notes'">我的笔记</button>
            <button class="tab" :class="{ 'is-active': activeTab === 'reviews' }" type="button" @click="activeTab = 'reviews'">我的书评</button>
            <button class="tab" :class="{ 'is-active': activeTab === 'achievements' }" type="button" @click="activeTab = 'achievements'">成就</button>
          </div>

          <section v-if="activeTab === 'records'" class="tab-panel is-active" style="padding-top:18px">
            <article v-for="item in records" :key="item.book.id" class="record-item">
              <RouterLink :to="'/book/' + item.book.id"><BookCover :book="item.book" /></RouterLink>
              <div class="record-item__body">
                <RouterLink class="record-item__title" :to="'/book/' + item.book.id">{{ item.book.title }}</RouterLink>
                <div class="record-item__meta">
                  {{ item.book.author }} · {{ item.status === "FINISHED" ? "已读完" : "读到第 " + (item.chapterNo || 1) + " 章" }}
                </div>
              </div>
              <div class="record-item__progress">
                <span>{{ Math.round(item.status === "FINISHED" ? 100 : item.percent || 0) }}%</span>
                <div class="progress"><i class="progress__bar" :style="{ width: (item.status === 'FINISHED' ? 100 : item.percent || 0) + '%' }" /></div>
              </div>
            </article>
            <EmptyState
              v-if="!records.length"
              title="还没有阅读记录"
              copy="去书库挑一本，开始你的第一段阅读。"
            >
              <RouterLink class="btn btn--sm" to="/discover">去书库</RouterLink>
            </EmptyState>
          </section>

          <section v-if="activeTab === 'notes'" class="tab-panel is-active" style="padding-top:18px">
            <div class="note-list">
              <article v-for="note in notes" :key="note.id" class="note-item">
                <div class="note-item__quote">“{{ note.quote || note.note }}”</div>
                <div v-if="note.note && note.quote" class="note-item__text">{{ note.note }}</div>
                <div class="note-item__foot">
                  <span>《{{ note.bookTitle }}》 · {{ note.page || "当前位置" }}</span>
                  <span>{{ note.date }}</span>
                </div>
              </article>
            </div>
            <EmptyState
              v-if="!notes.length"
              image="/assets/img/undraw/reading-notes_dg9z.svg"
              alt="写笔记的人"
              title="还没有笔记"
              copy="在阅读器里选中一段文字，记下你的想法。"
            />
          </section>

          <section v-if="activeTab === 'reviews'" class="tab-panel is-active" style="padding-top:18px">
            <article v-for="review in reviews" :key="review.id" class="review">
              <Avatar :name="review.user" />
              <div>
                <div class="review__head">
                  <span class="review__name">《{{ review.bookTitle }}》</span>
                  <StarRating :rating="review.rating" />
                  <span class="review__date">{{ review.date }}</span>
                  <span class="badge" :class="{ 'badge--good': review.status === 'PASSED', 'badge--warn': review.status === 'PENDING', 'badge--bad': review.status === 'REJECTED' }">
                    {{ statusLabel[review.status] || review.status }}
                  </span>
                </div>
                <p class="review__text">{{ review.text }}</p>
              </div>
            </article>
            <EmptyState
              v-if="!reviews.length"
              image="/assets/img/undraw/reading-a-book_4cap.svg"
              alt="正在读书"
              title="还没有书评"
              copy="读完一本书，写几句留给下一个读者。"
            />
          </section>

          <section v-if="activeTab === 'achievements'" class="tab-panel is-active" style="padding-top:18px">
            <div class="achievement-grid">
              <div v-for="item in achievements" :key="item.title" class="achievement" :class="{ 'is-locked': item.locked }">
                <Icon :name="item.icon" />
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </div>
            </div>
          </section>
        </div>

        <aside class="profile-side">
          <section class="panel">
            <h3>阅读偏好 <span>近 90 天</span></h3>
            <div class="viz-bars">
              <div v-for="cat in categories" :key="cat.name" class="viz-bar-row">
                <span class="viz-bar-row__label">{{ cat.name }}</span>
                <span class="viz-bar-track"><i class="viz-bar-fill" :style="{ width: Math.round((cat.value / maxShare) * 100) + '%' }" /></span>
                <span class="viz-bar-row__value">{{ cat.value }}%</span>
              </div>
            </div>
            <p v-if="!categories.length" class="tiny muted" style="margin-top:10px">还没有足够的阅读数据，读完几章后这里会出现偏好分布。</p>
            <p style="margin-top:14px">偏好来自阅读时长、完读率与书架构成的加权统计。</p>
          </section>

          <section class="panel reading-goal">
            <h3>{{ goal.year }} 阅读目标 <span>{{ goal.finished }} / {{ goal.target }} 本</span></h3>
            <div class="goal-ring" :style="{ '--pct': goal.percent }"><span>{{ goal.percent }}%</span></div>
            <p>{{ goal.finished >= goal.target ? "今年已读完 " + goal.finished + " 本，目标完成。" : "今年已读完 " + goal.finished + " 本，还差 " + (goal.target - goal.finished) + " 本。" }}</p>
            <div class="row between gap-10" style="width:100%;margin-top:2px">
              <label class="tiny muted" for="goalSelect">调整目标</label>
              <select id="goalSelect" v-model="goalTarget" class="select" style="width:100px;min-height:34px;font-size:12px" @change="updateGoal">
                <option :value="12">12 本</option>
                <option :value="24">24 本</option>
                <option :value="36">36 本</option>
                <option :value="48">48 本</option>
              </select>
            </div>
          </section>

          <section class="panel">
            <h3>阅读热力图 <span>12 周</span></h3>
            <div class="month-labels">
              <span v-for="(label, i) in monthLabels" :key="i">{{ label }}</span>
            </div>
            <div class="heatmap" role="img" aria-label="最近十二周的阅读记录热力图">
              <span
                v-for="(level, i) in stats.heatmap || []"
                :key="i"
                class="heat-cell"
                :data-level="level"
                :title="'第 ' + (Math.floor(i / 7) + 1) + ' 周 · 第 ' + (i % 7 + 1) + ' 天：' + (level ? level + ' 级' : '没有记录')"
              />
            </div>
            <div class="heat-legend" style="margin-top:9px">
              <span>少</span>
              <i style="background:var(--heat-0)" /><i style="background:var(--heat-1)" />
              <i style="background:var(--heat-2)" /><i style="background:var(--heat-3)" />
              <i style="background:var(--heat-4)" /><span>多</span>
            </div>
          </section>

          <RouterLink v-if="auth.isAdmin" class="admin-link-card" to="/admin">
            <Icon name="gear" />
            <span><strong>管理后台</strong><span>图书、用户、书评与推荐配置</span></span>
          </RouterLink>
        </aside>
      </div>
    </template>

    <ModalShell :open="editOpen" title="编辑资料" subtitle="修改昵称和简介" @close="editOpen = false">
      <form class="stack gap-16" @submit.prevent="saveProfile">
        <div class="field">
          <label for="editName">昵称</label>
          <input id="editName" v-model="editName" class="input" maxlength="60">
        </div>
        <div class="field">
          <label for="editBio">简介</label>
          <textarea id="editBio" v-model="editBio" class="textarea" maxlength="500" />
        </div>
        <div class="row between">
          <span class="tiny muted">修改后会同步到公开资料。</span>
          <button class="btn btn--accent" type="submit">保存</button>
        </div>
      </form>
    </ModalShell>
  </main>
</template>
