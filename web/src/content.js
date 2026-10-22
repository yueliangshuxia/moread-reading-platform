export const featuredNotes = [
  {
    bookTitle: "朝花夕拾",
    page: "第 32 页",
    quote: "我有一时，曾经屡次忆起儿时在故乡所吃的蔬果：菱角，罗汉豆，茭白，香瓜。",
    note: "写的是味道，其实是回不去的时间。可以把这段和我自己的童年记忆放在一起读。",
    user: "林见鹿",
    date: "10 月 14 日"
  },
  {
    bookTitle: "呼兰河传",
    page: "第 78 页",
    quote: "花开了，就像花睡醒了似的。鸟飞了，就像鸟上天了似的。",
    note: "重复的句式像孩子的眼睛，简单但不幼稚。萧红的语言节奏值得单独拎出来看。",
    user: "林见鹿",
    date: "10 月 12 日"
  },
  {
    bookTitle: "人间词话",
    page: "第 12 页",
    quote: "词以境界为最上。有境界则自成高格，自有名句。",
    note: "“境界”不是题材大小，而是作品有没有让人进入的空间。可以用它重读三种境界。",
    user: "林见鹿",
    date: "10 月 9 日"
  }
];

export const coRead = {
  kicker: "本周共读 · 第 18 期",
  title: "《呼兰河传》：一个人如何写自己的故乡",
  copy: "本周我们一起读萧红。每晚八点共读室开放，周日晚上有一次线上讨论。读不完也没关系，带着你停下来的那一页来就好。",
  image: "/assets/img/pexels/reading-tea.jpg",
  bookId: "hulanhezhuan",
  participants: ["林", "周", "苏", "满"],
  joined: 36,
  progress: 62
};

export const activeReaders = [
  { name: "周野", bio: "写小说，也读别人的小说。", time: "1 小时前", avatar: 0 },
  { name: "苏禾", bio: "南方人，茶与家族史爱好者。", time: "2 小时前", avatar: 4 },
  { name: "陈默", bio: "悬疑作者，习惯在夜里读书。", time: "3 小时前", avatar: 3 },
  { name: "小满", bio: "通勤阅读选手，每周一本。", time: "4 小时前", avatar: 2 },
  { name: "阿棠", bio: "自然观察与散文。", time: "5 小时前", avatar: 2 }
];

export const communityRules = [
  "写具体的感受，不写“好看”“一般”。",
  "讨论章节时提前标注剧透范围。",
  "可以不同意，但不要否定别人的阅读。",
  "引用请注明书名与页码。"
];

export const achievements = [
  { icon: "fire", title: "连续 21 天", desc: "连续阅读超过三周", locked: false },
  { icon: "trophy", title: "十二本", desc: "今年读完十二本书", locked: false },
  { icon: "moon", title: "夜读者", desc: "在 23:00 后阅读 20 次", locked: false },
  { icon: "highlighter", title: "划线成瘾", desc: "累计划线 200 条", locked: false },
  { icon: "book-open", title: "长跑选手", desc: "单本连续阅读 30 天", locked: true },
  { icon: "seal-check", title: "共读发起人", desc: "发起一次共读讨论", locked: true }
];

export const heroTags = [
  { label: "鲁迅", query: "鲁迅" },
  { label: "散文", query: "散文" },
  { label: "科幻", query: "科幻" },
  { label: "本周共读", to: "/community" },
  { label: "适合通勤", query: "通勤" }
];
