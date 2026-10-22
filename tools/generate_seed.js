/* Generate server/src/main/resources/seed/data.json from the static demo data.
   Usage: node tools/generate_seed.js
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "demo/assets/js/data.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const D = sandbox.window.MOREAD_DATA;

const pad = (n) => String(n).padStart(2, "0");
function localAt(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function daysAgo(days, hour = 21) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return localAt(d);
}
function hoursAgo(hours) {
  return localAt(new Date(Date.now() - hours * 3600 * 1000));
}
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pickFrom(list, seed, count) {
  const result = [];
  const used = new Set();
  let x = seed || 1;
  while (result.length < count && result.length < list.length) {
    x = (x * 1103515245 + 12345) >>> 0;
    const idx = x % list.length;
    if (!used.has(idx)) { used.add(idx); result.push(list[idx]); }
  }
  return result;
}

const DEMO_TEXT = [
  "夜色是从书页的边缘慢慢渗进来的。窗外的城市还在响，车流像一条不肯睡去的河。我把台灯往左挪了挪，光落在纸上，字便有了影子。白天读不进去的句子，到了这个时候，忽然愿意停下来，等一等我。",
  "小时候读书没有这样安静。那时候的书多半是借来的，封皮用旧报纸包着，翻页时要格外小心。夏天午后，蝉声把屋子填得满满的，我趴在竹席上，把一本《水浒》看得七零八落。很多字不认识，就跳过去；很多情节记不住，也不妨碍我第二天接着看。现在想来，那种读书法近乎鲁莽，却有一种后来再也没有的快乐：不为懂得，只为想知道后面发生了什么。",
  "后来读书变得有目的了。为了考试，为了论文，为了在谈话里不掉队。书页上开始出现铅笔线、折角、便签，出现“此处重要”“可引用”这样的批注。知识确实多了，但那种被一个句子忽然击中的时刻，反而少了。我们太急着把书读完，忘了书也可以把人读慢。",
  "我渐渐学会在书里留白。遇到喜欢的段落，不急着划下来，先合上书，去倒一杯水，或者站到窗前看一会儿。等那句话在心里沉下去，再回来找它。这样做很费时间，却让一本书真正变成了自己的。就像小时候外婆晒被子，总要在太阳最好的时候翻一次面，让另一面也晒透。",
  "读书说到底是一件很私人的事。别人推荐的书单，只能提供一个入口；真正走进去，要靠自己的脚步。有些书在二十岁读是路标，到了三十岁再读，可能只是一块石头。这没有什么可惜的。人和书的关系，本来就和人和人的关系一样，讲究一个恰逢其时。",
  "台灯的光圈慢慢缩小，杯子里的茶已经凉了。我合上书，把书签夹回刚才那一页。明天未必会接着读，但我知道它在那里。"
].join("\n\n");

/* ---------------- categories / books / chapters ---------------- */

const categories = D.categories.map((c, i) => ({
  id: c.id,
  name: c.name,
  mark: c.mark,
  description: c.desc,
  sort: i + 1
}));

const books = D.books.map((b) => ({
  id: b.id,
  title: b.title,
  author: b.author,
  categoryId: b.categoryId,
  tags: b.tags,
  rating: b.rating,
  readers: b.readers,
  words: b.words,
  publishedYear: b.year,
  status: b.status,
  free: !!b.free,
  original: !!b.original,
  featured: !!b.featured,
  listed: true,
  coverTheme: b.cover.theme,
  coverPattern: b.cover.pattern,
  blurb: b.blurb,
  intro: b.intro,
  authorBio: b.authorBio,
  reason: b.reason,
  scores: {
    content: b.scores.content,
    cf: b.scores.cf,
    popularity: b.scores.popularity,
    freshness: b.scores.freshness
  }
}));

const chapters = [];
for (const b of D.books) {
  (b.chapters || []).forEach((title, i) => {
    chapters.push({
      bookId: b.id,
      title,
      orderNo: i + 1,
      content: i === 0 ? DEMO_TEXT : "",
      free: !!b.free || i < 3
    });
  });
}

/* ---------------- users ---------------- */

const userMap = new Map();
for (const u of D.users) {
  const handle = u.handle || "@moread";
  const isReader = u.name === "林见鹿";
  const email = isReader ? "reader@moread.cn" : handle.replace("@", "") + "@moread.cn";
  userMap.set(u.name, {
    email,
    password: "123456",
    name: u.name,
    handle,
    avatar: u.avatar,
    bio: u.bio,
    role: "READER",
    status: "ACTIVE",
    joinedAt: "2024-03-12T09:00:00"
  });
}
if (!userMap.has("老周")) {
  userMap.set("老周", {
    email: "laozhou@moread.cn", password: "123456", name: "老周", handle: "@laozhou",
    avatar: 5, bio: "读得很慢，但很认真。", role: "READER", status: "ACTIVE",
    joinedAt: "2023-10-01T09:00:00"
  });
}
userMap.set("管理员", {
  email: "admin@moread.cn", password: "admin123", name: "管理员", handle: "@admin",
  avatar: 0, bio: "墨阅管理员。", role: "ADMIN", status: "ACTIVE",
  joinedAt: "2023-01-01T09:00:00"
});
const users = [...userMap.values()];
const emailOf = (name) => (userMap.get(name) || userMap.get("林见鹿")).email;

/* ---------------- booklists ---------------- */

const booklists = D.booklists.map((l, i) => ({
  id: l.id,
  title: l.title,
  description: l.desc,
  mark: l.mark,
  theme: l.theme,
  sort: i + 1,
  bookIds: l.bookIds
}));

/* ---------------- shelves / progress / notes / reviews ---------------- */

const shelfPlan = {
  "reader@moread.cn": {
    reading: ["hulanhezhuan", "shanhaizhijian"],
    want: ["renjiancihua", "waerdengchu", "xishuda"],
    finished: ["zhaohuaxishi", "xiaowangzi"]
  }
};

for (const u of users) {
  if (u.role === "ADMIN" || shelfPlan[u.email]) continue;
  const seed = hash(u.email);
  const common = ["xiaowangzi", "zhaohuaxishi", "hulanhezhuan", "renjiancihua", "waerdengchu"];
  const extra = pickFrom(D.books.map((b) => b.id), seed, 3);
  const reading = new Set(pickFrom(common.concat(extra), seed + 7, 2));
  const finished = new Set(pickFrom(common.concat(extra).filter((id) => !reading.has(id)), seed + 13, 2));
  const want = new Set(pickFrom(D.books.map((b) => b.id).filter((id) => !reading.has(id) && !finished.has(id)), seed + 21, 2));
  shelfPlan[u.email] = {
    reading: [...reading],
    want: [...want],
    finished: [...finished]
  };
}

const shelves = [];
for (const [email, plan] of Object.entries(shelfPlan)) {
  for (const status of ["reading", "want", "finished"]) {
    for (const bookId of plan[status]) {
      shelves.push({
        email,
        bookId,
        status: status.toUpperCase(),
        createdAt: daysAgo(10 + (hash(email + bookId) % 80))
      });
    }
  }
}

const progress = [
  { email: "reader@moread.cn", bookId: "hulanhezhuan", chapterNo: 3, percent: 42, lastReadAt: hoursAgo(4) },
  { email: "reader@moread.cn", bookId: "shanhaizhijian", chapterNo: 2, percent: 18, lastReadAt: hoursAgo(26) },
  { email: "reader@moread.cn", bookId: "xiaowangzi", chapterNo: 9, percent: 100, lastReadAt: daysAgo(9) },
  { email: "reader@moread.cn", bookId: "zhaohuaxishi", chapterNo: 12, percent: 100, lastReadAt: daysAgo(31) }
];
for (const [email, plan] of Object.entries(shelfPlan)) {
  if (email === "reader@moread.cn") continue;
  for (const bookId of plan.reading) {
    progress.push({ email, bookId, chapterNo: 1 + (hash(email + bookId) % 3), percent: 15 + (hash(bookId + email) % 60), lastReadAt: daysAgo(hash(email + bookId) % 20) });
  }
  for (const bookId of plan.finished) {
    progress.push({ email, bookId, chapterNo: 5, percent: 100, lastReadAt: daysAgo(hash(email + bookId) % 40) });
  }
}

const notes = D.notes.map((n, i) => ({
  email: "reader@moread.cn",
  bookId: n.bookId,
  chapterNo: 1,
  quote: n.quote,
  content: n.note,
  type: "NOTE",
  page: n.page,
  createdAt: daysAgo(i * 3 + 2, 22)
}));
notes.push({
  email: "reader@moread.cn",
  bookId: "hulanhezhuan",
  chapterNo: 3,
  quote: "花开了，就像花睡醒了似的。鸟飞了，就像鸟上天了似的。",
  content: "",
  type: "HIGHLIGHT",
  page: "第 78 页",
  createdAt: daysAgo(3, 23)
});

const reviews = D.reviews.map((r, i) => ({
  email: emailOf(r.user),
  bookId: r.bookId,
  rating: r.rating,
  content: r.text,
  status: "PASSED",
  likes: r.likes,
  createdAt: daysAgo(i + 1, 20)
}));
const adminReviewStatus = { "待审": "PENDING", "已通过": "PASSED", "已驳回": "REJECTED" };
for (const [i, r] of (D.adminReviews || []).entries()) {
  reviews.push({
    email: emailOf(r.user) || "reader@moread.cn",
    bookId: (D.books.find((b) => b.title === r.book))?.id || "zhaohuaxishi",
    rating: 5,
    content: r.text,
    status: adminReviewStatus[r.status] || "PENDING",
    likes: 0,
    createdAt: daysAgo(i + 1, 18)
  });
}

/* ---------------- posts / comments ---------------- */

const posts = D.posts.map((p, i) => ({
  id: p.id,
  email: emailOf(p.user),
  topic: p.topic,
  content: p.text,
  bookId: p.bookId || null,
  image: p.image || "",
  likes: p.likes,
  commentCount: p.comments,
  createdAt: i < 2 ? hoursAgo(i * 2 + 2) : daysAgo(Math.max(1, i - 1), 20)
}));

const comments = (D.postComments || []).map((c, i) => ({
  postId: c.postId,
  email: emailOf(c.user),
  content: c.text,
  createdAt: i < 2 ? hoursAgo(1 + i) : daysAgo(1, 20)
}));

/* ---------------- reading events ---------------- */

const events = [];
const readerBooks = ["hulanhezhuan", "shanhaizhijian", "zhaohuaxishi", "xiaowangzi", "renjiancihua", "waerdengchu", "xishuda"];
const lastSeven = [30, 48, 25, 60, 40, 70, 40];
for (let i = 0; i < 7; i += 1) {
  events.push({
    email: "reader@moread.cn",
    bookId: readerBooks[i % readerBooks.length],
    eventType: "SESSION",
    durationSeconds: lastSeven[i] * 60,
    percent: 30 + i * 5,
    createdAt: daysAgo(6 - i, 20 + (i % 3))
  });
}
for (let d = 7; d < 84; d += 1) {
  if ((hash("reader-day-" + d) % 100) < 18) continue;
  const mins = 40 + (hash("reader-min-" + d) % 110);
  events.push({
    email: "reader@moread.cn",
    bookId: readerBooks[hash("reader-book-" + d) % readerBooks.length],
    eventType: "SESSION",
    durationSeconds: mins * 60,
    percent: 10 + (hash("reader-pct-" + d) % 85),
    createdAt: daysAgo(d, 19 + (d % 5))
  });
}
events.push({ email: "reader@moread.cn", bookId: "hulanhezhuan", eventType: "START_READ", durationSeconds: 0, percent: 0, createdAt: daysAgo(2, 21) });
events.push({ email: "reader@moread.cn", bookId: "zhaohuaxishi", eventType: "FINISH", durationSeconds: 0, percent: 100, createdAt: daysAgo(31, 22) });
events.push({ email: "reader@moread.cn", bookId: "xiaowangzi", eventType: "FINISH", durationSeconds: 0, percent: 100, createdAt: daysAgo(9, 22) });

for (const u of users) {
  if (u.role === "ADMIN" || u.email === "reader@moread.cn") continue;
  const plan = shelfPlan[u.email];
  const pool = (plan.reading.concat(plan.finished, plan.want).length ? plan.reading.concat(plan.finished, plan.want) : D.books.map((b) => b.id));
  const count = 12 + (hash(u.email) % 24);
  for (let i = 0; i < count; i += 1) {
    const seed = hash(u.email + "-" + i);
    events.push({
      email: u.email,
      bookId: pool[seed % pool.length],
      eventType: "SESSION",
      durationSeconds: (20 + (seed % 70)) * 60,
      percent: 10 + (seed % 85),
      createdAt: daysAgo(seed % 84, 18 + (seed % 6))
    });
  }
}

/* ---------------- goals / weights ---------------- */

const goals = users.filter((u) => u.role === "READER").map((u) => ({
  email: u.email,
  year: 2026,
  target: u.email === "reader@moread.cn" ? 24 : 12
}));

const weights = { content: 0.35, cf: 0.30, popularity: 0.20, freshness: 0.15 };

const out = {
  categories,
  books,
  chapters,
  booklists,
  users,
  shelves,
  progress,
  notes,
  reviews,
  posts,
  comments,
  events,
  goals,
  weights
};

const target = path.join(ROOT, "server/src/main/resources/seed/data.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(out, null, 2), "utf8");
console.log("wrote", target);
console.log("counts:", {
  categories: categories.length,
  books: books.length,
  chapters: chapters.length,
  booklists: booklists.length,
  users: users.length,
  shelves: shelves.length,
  notes: notes.length,
  reviews: reviews.length,
  posts: posts.length,
  comments: comments.length,
  events: events.length
});
