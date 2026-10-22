/* 墨阅 MoRead — mock data for the static demo.
   All book records, reviews and posts are demonstration data. */
window.MOREAD_DATA = {
  categories: [
    { id: "classic", name: "文学经典", mark: "文", desc: "经过时间筛选的叙事与语言" },
    { id: "contemporary", name: "当代小说", mark: "今", desc: "此刻正在发生的写作" },
    { id: "prose", name: "诗歌散文", mark: "诗", desc: "短章、韵律与日常观察" },
    { id: "humanities", name: "人文社科", mark: "思", desc: "理解世界与自身的框架" },
    { id: "growth", name: "心理成长", mark: "心", desc: "与自己相处的练习" },
    { id: "biography", name: "传记纪实", mark: "传", desc: "他人的一生，自己的镜子" },
    { id: "scifi", name: "科幻奇幻", mark: "幻", desc: "另一种可能的世界" },
    { id: "life", name: "艺术生活", mark: "艺", desc: "把日子过成作品" }
  ],

  booklists: [
    {
      id: "commute",
      title: "在通勤路上读完的 5 本小书",
      desc: "短，但不轻。每本都能在两周的通勤里读完，适合在换乘的间隙翻开。",
      mark: "短",
      theme: "bottle",
      bookIds: ["xiaowangzi", "laorenyuhai", "jiuwairen", "feiniaoji", "caigentan"]
    },
    {
      id: "hometown",
      title: "重新认识故乡",
      desc: "从鲁迅的百草园到萧红的呼兰河，再到今天的海边小镇。故乡不是一个地点，是一种回望的方式。",
      mark: "乡",
      theme: "oxblood",
      bookIds: ["zhaohuaxishi", "hulanhezhuan", "shanhaizhijian", "nanfangyoujiamu"]
    },
    {
      id: "solitude",
      title: "关于独处的三本书",
      desc: "独处不是逃离，是把生活的节奏拿回自己手里。三本适合在周末慢慢读的书。",
      mark: "独",
      theme: "ink",
      bookIds: ["waerdengchu", "chensilu", "xishuda"]
    }
  ],

  books: [
    {
      id: "zhaohuaxishi", title: "朝花夕拾", author: "鲁迅", category: "文学经典", categoryId: "classic",
      tags: ["回忆", "散文", "现代文学"], rating: 9.2, readers: 18420, words: "8.6 万", year: 1926,
      status: "完结", free: true, cover: { theme: "bottle", pattern: "letter" },
      blurb: "鲁迅唯一一部回忆性散文集，在旧事重提里保存少年时代的温度与锋芒。",
      intro: "从百草园的虫鸣到三味书屋的戒尺，从长妈妈买到《山海经》的惊喜到藤野先生的讲义，鲁迅把童年与青年时代的碎片一一拾起。文字温和，锋芒仍在：他写的是自己的来路，也是一代人如何长大的证词。",
      authorBio: "鲁迅（1881—1936），原名周树人，中国现代文学的奠基人。小说、散文、杂文皆成高峰。",
      chapters: ["小引", "狗·猫·鼠", "阿长与《山海经》", "二十四孝图", "五猖会", "无常", "从百草园到三味书屋", "父亲的病", "琐记", "藤野先生", "范爱农", "后记"],
      scores: { content: 0.46, cf: 0.28, popularity: 0.17, freshness: 0.09 },
      reason: "你最近在读鲁迅，且对散文类作品的完读率较高",
      featured: true, original: false
    },
    {
      id: "nahan", title: "呐喊", author: "鲁迅", category: "文学经典", categoryId: "classic",
      tags: ["小说", "启蒙", "现代文学"], rating: 9.4, readers: 21340, words: "9.8 万", year: 1923,
      status: "完结", free: true, cover: { theme: "oxblood", pattern: "rules" },
      blurb: "中国现代小说的开端，十五篇作品写尽沉默与呼喊。",
      intro: "《狂人日记》撕开礼教的帷幕，《孔乙己》写尽一个读书人的窘迫，《故乡》留下那轮金黄的圆月。鲁迅以短篇小说的形式，为沉默的国民造像，也为后来者开辟了道路。",
      authorBio: "鲁迅（1881—1936），中国现代文学的奠基人，代表作有《呐喊》《彷徨》《朝花夕拾》等。",
      chapters: ["自序", "狂人日记", "孔乙己", "药", "明天", "一件小事", "头发的故事", "风波", "故乡", "阿Q正传", "端午节", "白光", "兔和猫", "鸭的喜剧", "社戏"],
      scores: { content: 0.51, cf: 0.24, popularity: 0.16, freshness: 0.09 },
      reason: "与你读过的《朝花夕拾》主题相近，且被相似读者反复重读",
      featured: true, original: false
    },
    {
      id: "luotuoxiangzi", title: "骆驼祥子", author: "老舍", category: "文学经典", categoryId: "classic",
      tags: ["小说", "城市", "命运"], rating: 9.1, readers: 16780, words: "14.2 万", year: 1936,
      status: "完结", free: true, cover: { theme: "mustard", pattern: "grid" },
      blurb: "一个拉车人的三次买车梦，照见旧城里个人奋斗的尽头。",
      intro: "祥子从乡下来到北平，最大的愿望是拥有一辆自己的车。他勤恳、强壮、相信力气可以换来体面。可一次次意外把生活推回原点，也把一个老实人慢慢磨成了另一个人。",
      authorBio: "老舍（1899—1966），原名舒庆春，北京人，代表作有《骆驼祥子》《四世同堂》《茶馆》。",
      chapters: ["第一章 车", "第二章 兵乱", "第三章 逃", "第四章 骆驼", "第五章 虎妞", "第六章 拉车", "第七章 雨", "第八章 败", "第九章 空"],
      scores: { content: 0.39, cf: 0.33, popularity: 0.19, freshness: 0.09 },
      reason: "与你书架中的现实主义小说相似度较高",
      featured: false, original: false
    },
    {
      id: "hulanhezhuan", title: "呼兰河传", author: "萧红", category: "文学经典", categoryId: "classic",
      tags: ["小说", "故乡", "女性"], rating: 9.3, readers: 15260, words: "12.1 万", year: 1940,
      status: "完结", free: true, cover: { theme: "paper", pattern: "arch" },
      blurb: "一条北方小城的河，一座荒凉的院子，和一群认真活着的人。",
      intro: "呼兰河的小城冬天很长，人们把日子过得缓慢而结实。萧红写祖父的后花园、写跳大神、写小团圆媳妇，也写自己回不去的童年。它不像小说，更像一个人站在很远的地方，回头望故乡。",
      authorBio: "萧红（1911—1942），黑龙江呼兰人，代表作有《呼兰河传》《生死场》。",
      chapters: ["第一章 小城", "第二章 祖父的花园", "第三章 团圆媳妇", "第四章 有二伯", "第五章 冯歪嘴子", "第六章 后花园", "尾声"],
      scores: { content: 0.44, cf: 0.27, popularity: 0.18, freshness: 0.11 },
      reason: "本周共读书目，且与你偏爱的女性写作高度相关",
      featured: true, original: false
    },
    {
      id: "jiuwairen", title: "局外人", author: "加缪", category: "文学经典", categoryId: "classic",
      tags: ["小说", "存在主义", "荒诞"], rating: 9.2, readers: 14120, words: "6.4 万", year: 1942,
      status: "完结", free: true, cover: { theme: "ink", pattern: "rings" },
      blurb: "一个人因为没有在葬礼上哭泣，被世界判了死刑。",
      intro: "默尔索在母亲去世后照常游泳、看喜剧电影，又在海滩上开枪杀人。审判他的不是那颗子弹，而是他不肯表演的悲伤。加缪用冷静的句子，写出人与世界之间那道无法弥合的距离。",
      authorBio: "阿尔贝·加缪（1913—1960），法国作家、哲学家，1957 年诺贝尔文学奖得主。",
      chapters: ["第一部 一", "第一部 二", "第一部 三", "第一部 四", "第一部 五", "第一部 六", "第二部 一", "第二部 二", "第二部 三", "第二部 四", "第二部 五"],
      scores: { content: 0.36, cf: 0.35, popularity: 0.17, freshness: 0.12 },
      reason: "与你在读的《月亮与六便士》共享存在主义主题",
      featured: false, original: false
    },
    {
      id: "laorenyuhai", title: "老人与海", author: "海明威", category: "文学经典", categoryId: "classic",
      tags: ["小说", "勇气", "海洋"], rating: 9.0, readers: 19430, words: "5.2 万", year: 1952,
      status: "完结", free: true, cover: { theme: "navy", pattern: "bands" },
      blurb: "一个老人、一条大马林鱼，和一场注定失去的搏斗。",
      intro: "圣地亚哥八十四天没有捕到鱼。第八十五天，他独自出海，钓到一条比船还长的马林鱼。海明威用极简的语言写人与自然的较量，也写一个人如何在失败中保住尊严。",
      authorBio: "欧内斯特·海明威（1899—1961），美国作家，1954 年诺贝尔文学奖得主。",
      chapters: ["第一章 出海", "第二章 大鱼", "第三章 对峙", "第四章 鲨鱼", "第五章 归来"],
      scores: { content: 0.32, cf: 0.38, popularity: 0.2, freshness: 0.1 },
      reason: "读完《局外人》的读者中，有 38% 接着读了这本书",
      featured: false, original: false
    },
    {
      id: "yueliangliubianshi", title: "月亮与六便士", author: "毛姆", category: "文学经典", categoryId: "classic",
      tags: ["小说", "理想", "艺术"], rating: 9.3, readers: 22160, words: "18.6 万", year: 1919,
      status: "完结", free: true, cover: { theme: "plum", pattern: "letter" },
      blurb: "满地都是六便士，他却抬头看见了月亮。",
      intro: "证券经纪人思特里克兰德突然抛下家庭与体面生活，去巴黎学画。他粗鲁、自私、穷困，却像被某种东西攫住一样非画不可。毛姆借一个极端的人，追问艺术、欲望与自由的代价。",
      authorBio: "威廉·萨默塞特·毛姆（1874—1965），英国小说家、剧作家，代表作有《人性的枷锁》《月亮与六便士》。",
      chapters: ["第一章 相遇", "第二章 出走", "第三章 巴黎", "第四章 画室", "第五章 塔希提", "第六章 月亮", "第七章 尾声"],
      scores: { content: 0.33, cf: 0.37, popularity: 0.2, freshness: 0.1 },
      reason: "你收藏过 3 本关于艺术与理想的小说",
      featured: false, original: false
    },
    {
      id: "shanhaizhijian", title: "山海之间", author: "林见鹿", category: "当代小说", categoryId: "contemporary",
      tags: ["原创", "成长", "山海"], rating: 8.6, readers: 3240, words: "21.4 万", year: 2024,
      status: "连载", free: false, cover: { theme: "oxblood", pattern: "letter" },
      blurb: "一个沿海小镇的青年回到故乡，在拆迁与潮汐之间重新认识父亲。",
      intro: "阿岸离开岚屿七年，带着一身城市里的疲惫回来。父亲还在修那条永远修不完的船，小镇的地皮已经被画上了新的红线。他要处理的是一栋老屋，却意外翻出父亲年轻时写给母亲的一沓信。",
      authorBio: "林见鹿，站内原创作者，写作关注沿海小城与代际关系。",
      chapters: ["第一章 归潮", "第二章 老屋", "第三章 修船的人", "第四章 红线", "第五章 信", "第六章 台风", "第七章 山海之间"],
      scores: { content: 0.41, cf: 0.22, popularity: 0.14, freshness: 0.23 },
      reason: "站内原创 · 与你关注的“故乡与代际”主题匹配",
      featured: true, original: true
    },
    {
      id: "changyejiangjin", title: "长夜将尽", author: "陈默", category: "当代小说", categoryId: "contemporary",
      tags: ["原创", "悬疑", "小镇"], rating: 8.7, readers: 2860, words: "24.8 万", year: 2023,
      status: "连载", free: false, cover: { theme: "ink", pattern: "grid" },
      blurb: "二十年前的失踪案，在停电的夜里重新亮起一盏灯。",
      intro: "小镇唯一的路灯坏了二十年，没人去修。直到一场持续七天的停电，让所有人重新想起那个晚上。记者沈岚回到家乡调查旧案，发现每个熟人都在守护同一个秘密。",
      authorBio: "陈默，站内原创作者，擅长小镇悬疑与多视角叙事。",
      chapters: ["第一章 停电", "第二章 旧案", "第三章 路灯", "第四章 证词", "第五章 第二个人", "第六章 长夜", "第七章 将尽"],
      scores: { content: 0.34, cf: 0.26, popularity: 0.15, freshness: 0.25 },
      reason: "你最近追更的悬疑作品相似度较高",
      featured: false, original: true
    },
    {
      id: "nanfangyoujiamu", title: "南方有嘉木", author: "苏禾", category: "当代小说", categoryId: "contemporary",
      tags: ["原创", "家族", "茶"], rating: 8.4, readers: 1980, words: "19.2 万", year: 2025,
      status: "完结", free: false, cover: { theme: "bottle", pattern: "arch" },
      blurb: "一座茶山、三代女性，和一份没有写进族谱的遗嘱。",
      intro: "外婆去世后，留在城里的三姐妹回到南方茶山。老宅要卖，茶园要分，母亲留下的那只铁盒里却只有一包陈茶和一张手绘的山地图。她们沿着地图走了一圈，才明白母亲真正想留下的是什么。",
      authorBio: "苏禾，站内原创作者，作品多写女性家族史与南方风物。",
      chapters: ["第一章 茶山", "第二章 铁盒", "第三章 三姐妹", "第四章 春茶", "第五章 族谱", "第六章 嘉木"],
      scores: { content: 0.38, cf: 0.2, popularity: 0.12, freshness: 0.3 },
      reason: "站内新作 · 与你收藏的家族叙事相似",
      featured: false, original: true
    },
    {
      id: "renjiancihua", title: "人间词话", author: "王国维", category: "诗歌散文", categoryId: "prose",
      tags: ["词学", "美学", "文论"], rating: 9.5, readers: 12680, words: "4.8 万", year: 1908,
      status: "完结", free: true, cover: { theme: "paper", pattern: "rules" },
      blurb: "以“境界”论词，一部短小却影响深远的中国美学经典。",
      intro: "王国维以“境界”为核心，重新评价五代、北宋以来的词人。他谈有我之境与无我之境，谈隔与不隔，也谈古今成大事业、大学问者必经的三种境界。短短数十则，几乎每一则都值得停下来想一想。",
      authorBio: "王国维（1877—1927），近代学者、美学家，著有《人间词话》《宋元戏曲考》等。",
      chapters: ["一 境界", "二 有我之境", "三 无我之境", "四 隔与不隔", "五 赤子之心", "六 三种境界", "七 词人者不失赤子之心", "八 后记"],
      scores: { content: 0.48, cf: 0.21, popularity: 0.16, freshness: 0.15 },
      reason: "你对“如何读一首诗”的兴趣高于 82% 的读者",
      featured: false, original: false
    },
    {
      id: "fushengliuji", title: "浮生六记", author: "沈复", category: "诗歌散文", categoryId: "prose",
      tags: ["散文", "生活", "爱情"], rating: 9.0, readers: 14320, words: "7.2 万", year: 1808,
      status: "完结", free: true, cover: { theme: "mustard", pattern: "letter" },
      blurb: "清代文人的日常与深情，一部关于生活本身的回忆录。",
      intro: "沈复记与妻子芸娘的相处，记插花、烹茶、游赏、拮据，也记生离死别。没有宏大叙事，只有细碎的欢喜与哀愁。林语堂曾说，芸娘是中国文学中最可爱的女人。",
      authorBio: "沈复（1763—约1832），字三白，清代文学家，《浮生六记》为其自传体散文。",
      chapters: ["闺房记乐", "闲情记趣", "坎坷记愁", "浪游记快", "中山记历", "养生记道"],
      scores: { content: 0.4, cf: 0.26, popularity: 0.15, freshness: 0.19 },
      reason: "与你在读的《朝花夕拾》同属回忆性散文",
      featured: false, original: false
    },
    {
      id: "zhimodeshi", title: "志摩的诗", author: "徐志摩", category: "诗歌散文", categoryId: "prose",
      tags: ["诗歌", "新月派", "爱情"], rating: 8.7, readers: 9680, words: "3.6 万", year: 1925,
      status: "完结", free: true, cover: { theme: "navy", pattern: "rings" },
      blurb: "“轻轻的我走了”，新月派最明亮也最忧伤的声音。",
      intro: "徐志摩的诗里有康桥的水、伦敦的雾、爱而不得的惆怅，也有对自由与美的执拗。他写得很轻，却常常落在很重的地方。",
      authorBio: "徐志摩（1897—1931），新月派代表诗人，代表作有《再别康桥》《翡冷翠的一夜》。",
      chapters: ["再别康桥", "沙扬娜拉", "偶然", "我不知道风是在哪一个方向吹", "雪花的快乐", "翡冷翠的一夜"],
      scores: { content: 0.31, cf: 0.29, popularity: 0.17, freshness: 0.23 },
      reason: "你最近摘录过 2 首新月派诗歌",
      featured: false, original: false
    },
    {
      id: "feiniaoji", title: "飞鸟集", author: "泰戈尔", category: "诗歌散文", categoryId: "prose",
      tags: ["诗歌", "哲思", "自然"], rating: 8.8, readers: 17240, words: "2.8 万", year: 1916,
      status: "完结", free: true, cover: { theme: "paper", pattern: "letter" },
      blurb: "三百余首短诗，像鸟掠过天空时留下的句子。",
      intro: "“生如夏花之绚烂，死如秋叶之静美。”泰戈尔用最轻的句子谈神、自然、爱与死亡。它们不适合一口气读完，适合在清晨或睡前翻开任意一页。",
      authorBio: "拉宾德拉纳特·泰戈尔（1861—1941），印度诗人、哲学家，1913 年诺贝尔文学奖得主。",
      chapters: ["飞鸟集 一", "飞鸟集 二", "飞鸟集 三", "飞鸟集 四", "飞鸟集 五", "飞鸟集 六"],
      scores: { content: 0.29, cf: 0.31, popularity: 0.18, freshness: 0.22 },
      reason: "适合你近期的短篇阅读节奏（单次 10—15 分钟）",
      featured: false, original: false
    },
    {
      id: "chensilu", title: "沉思录", author: "马可·奥勒留", category: "人文社科", categoryId: "humanities",
      tags: ["哲学", "斯多葛", "自省"], rating: 8.8, readers: 11360, words: "11.4 万", year: 180,
      status: "完结", free: true, cover: { theme: "slate", pattern: "rules" },
      blurb: "一位罗马皇帝写给自己的十二卷札记。",
      intro: "马可·奥勒留在战事与政务之间，反复提醒自己：能控制的只有判断与行动。他谈死亡、名誉、愤怒与责任，语气并不高高在上，更像一个人在深夜里一遍遍劝住自己。",
      authorBio: "马可·奥勒留（121—180），罗马帝国皇帝，斯多葛派哲学代表人物。",
      chapters: ["卷一 从他人身上学习", "卷二 专注于当下", "卷三 内在的城堡", "卷四 关于死亡", "卷五 责任", "卷六 与他人相处", "卷七 逆境", "卷八 清晨", "卷九 理性", "卷十 平静", "卷十一 真诚", "卷十二 告别"],
      scores: { content: 0.35, cf: 0.3, popularity: 0.16, freshness: 0.19 },
      reason: "你连续 12 天在深夜阅读，匹配“睡前短读”偏好",
      featured: false, original: false
    },
    {
      id: "kunchongji", title: "昆虫记", author: "法布尔", category: "人文社科", categoryId: "humanities",
      tags: ["科普", "自然", "观察"], rating: 9.2, readers: 13780, words: "32.6 万", year: 1879,
      status: "完结", free: true, cover: { theme: "bottle", pattern: "grid" },
      blurb: "一个人趴在地上看虫子，看了几十年。",
      intro: "法布尔用文学家的耐心和科学家的眼睛，记录蝉、螳螂、蜘蛛、蜣螂的生活。他不急着下结论，只是看，反复地看。读完之后，你会重新注意到脚边那个忙碌的世界。",
      authorBio: "让-亨利·法布尔（1823—1915），法国昆虫学家、文学家，被誉为“昆虫界的荷马”。",
      chapters: ["蝉", "螳螂", "蜣螂", "蜘蛛", "蜜蜂", "蚂蚁", "萤火虫", "田野的黄昏"],
      scores: { content: 0.33, cf: 0.27, popularity: 0.18, freshness: 0.22 },
      reason: "你收藏过自然观察类作品，且偏爱可碎片阅读的长篇",
      featured: false, original: false
    },
    {
      id: "mengxibitan", title: "梦溪笔谈", author: "沈括", category: "人文社科", categoryId: "humanities",
      tags: ["博物", "科技史", "宋代"], rating: 9.0, readers: 6420, words: "18.2 万", year: 1088,
      status: "完结", free: true, cover: { theme: "slate", pattern: "letter" },
      blurb: "北宋的“百科笔记”，从活字印刷到地质成因都有记录。",
      intro: "沈括把一生见闻分门别类地记下来：天文、历法、地理、医药、音乐、书画、器物。它不像一部正经的专著，更像一个好奇心极强的人留下的工作笔记。",
      authorBio: "沈括（1031—1095），北宋科学家、政治家，《梦溪笔谈》为其晚年所著。",
      chapters: ["故事", "辩证", "乐律", "象数", "人事", "官政", "权智", "艺文", "书画", "技艺", "器用", "神奇", "异事", "谬误", "讥谑", "杂志", "药议"],
      scores: { content: 0.3, cf: 0.24, popularity: 0.14, freshness: 0.32 },
      reason: "你对“博物与科技史”标签的点击率较高",
      featured: false, original: false
    },
    {
      id: "shishuoxinyu", title: "世说新语", author: "刘义庆", category: "人文社科", categoryId: "humanities",
      tags: ["笔记", "人物", "魏晋"], rating: 9.2, readers: 10540, words: "9.4 万", year: 430,
      status: "完结", free: true, cover: { theme: "ink", pattern: "rules" },
      blurb: "魏晋名士的言行碎片，一部关于风度与性情的笔记。",
      intro: "三言两语写一个人：有人雪夜访友，到了门口却转身回去；有人见路边李子苦，偏要尝一口。刘义庆不评价，只记录。千百年后读来，仍觉得那些人活得有声有色。",
      authorBio: "刘义庆（403—444），南朝宋宗室、文学家，组织门客编撰《世说新语》。",
      chapters: ["德行", "言语", "政事", "文学", "方正", "雅量", "识鉴", "赏誉", "品藻", "规箴", "捷悟", "夙惠", "豪爽", "容止", "自新", "企羡", "伤逝", "栖逸", "贤媛", "术解", "巧艺", "宠礼", "任诞", "简傲", "排调", "轻诋", "假谲", "黜免", "俭啬", "汰侈", "忿狷", "谗险", "尤悔", "纰漏", "惑溺", "仇隙"],
      scores: { content: 0.37, cf: 0.25, popularity: 0.15, freshness: 0.23 },
      reason: "与你在读的《人间词话》同属中国古典文论谱系",
      featured: false, original: false
    },
    {
      id: "xishuda", title: "悉达多", author: "赫尔曼·黑塞", category: "心理成长", categoryId: "growth",
      tags: ["小说", "成长", "东方哲思"], rating: 9.1, readers: 15860, words: "8.8 万", year: 1922,
      status: "完结", free: true, cover: { theme: "bottle", pattern: "rings" },
      blurb: "一个婆罗门青年离开家门，去亲身体验世界，而不是只听说它。",
      intro: "悉达多听过所有教诲，却仍觉得知识可以传授，智慧不能。他走进市井，经历爱欲、财富与失去，最后在河边学会倾听。黑塞写的是一个人的求道，也是每个人都要走的路。",
      authorBio: "赫尔曼·黑塞（1877—1962），德国作家，1946 年诺贝尔文学奖得主。",
      chapters: ["婆罗门之子", "沙门", "乔达摩", "觉醒", "迦摩罗", "尘世", "轮回", "河边", "船夫", "儿子", "唵", "悉达多"],
      scores: { content: 0.4, cf: 0.28, popularity: 0.17, freshness: 0.15 },
      reason: "你最近标记了 4 条关于“自我成长”的笔记",
      featured: false, original: false
    },
    {
      id: "caigentan", title: "菜根谭", author: "洪应明", category: "心理成长", categoryId: "growth",
      tags: ["处世", "格言", "修养"], rating: 8.9, readers: 8920, words: "5.6 万", year: 1590,
      status: "完结", free: true, cover: { theme: "paper", pattern: "bands" },
      blurb: "嚼得菜根，百事可做。一本写给普通人的处世笔记。",
      intro: "洪应明把儒、释、道的修养工夫写成短句：如何在顺境中收敛，在逆境中安顿，在人际里留余地。它不提供标准答案，只提供一些可以反复咀嚼的判断。",
      authorBio: "洪应明，字自诚，明代学者，生平事迹留有争议，《菜根谭》为其代表作。",
      chapters: ["修省", "应酬", "评议", "闲适", "概论 一", "概论 二", "概论 三"],
      scores: { content: 0.28, cf: 0.22, popularity: 0.16, freshness: 0.34 },
      reason: "与你近期的短读习惯匹配，单则 1—2 分钟",
      featured: false, original: false
    },
    {
      id: "fankelinzizhuan", title: "富兰克林自传", author: "本杰明·富兰克林", category: "传记纪实", categoryId: "biography",
      tags: ["传记", "自律", "美国"], rating: 8.6, readers: 7360, words: "16.8 万", year: 1791,
      status: "完结", free: true, cover: { theme: "navy", pattern: "letter" },
      blurb: "一个印刷学徒如何把自己训练成科学家、政治家与作家。",
      intro: "富兰克林在自传里详细记录了自己的读书方法、十三条美德训练和犯错经历。他相信人是可以自我塑造的，也毫不掩饰塑造过程中的虚荣与反复。",
      authorBio: "本杰明·富兰克林（1706—1790），美国政治家、科学家、作家。",
      chapters: ["第一章 少年", "第二章 印刷所", "第三章 费城", "第四章 图书馆", "第五章 十三条美德", "第六章 公共事业", "第七章 电", "第八章 晚年"],
      scores: { content: 0.26, cf: 0.24, popularity: 0.15, freshness: 0.35 },
      reason: "你读过 2 本关于习惯与自律的书",
      featured: false, original: false
    },
    {
      id: "waerdengchu", title: "瓦尔登湖", author: "亨利·戴维·梭罗", category: "传记纪实", categoryId: "biography",
      tags: ["自然", "独处", "生活实验"], rating: 8.9, readers: 12180, words: "18.4 万", year: 1854,
      status: "完结", free: true, cover: { theme: "bottle", pattern: "arch" },
      blurb: "在湖边住两年，看看人到底需要多少东西才能生活。",
      intro: "梭罗在瓦尔登湖边搭了一间小木屋，种豆、读书、观察四季。他不是要教人隐居，而是想验证：许多被当作必需的东西，其实只是习惯。",
      authorBio: "亨利·戴维·梭罗（1817—1862），美国作家、哲学家，代表作有《瓦尔登湖》《论公民的不服从》。",
      chapters: ["经济", "我生活的地方", "阅读", "声音", "独处", "访客", "豆田", "村庄", "湖", "更高的规律", "禽兽为邻", "冬天的湖", "春天", "结语"],
      scores: { content: 0.34, cf: 0.26, popularity: 0.17, freshness: 0.23 },
      reason: "你连续三周在周末阅读自然类作品",
      featured: false, original: false
    },
    {
      id: "haidiliangwanli", title: "海底两万里", author: "儒勒·凡尔纳", category: "科幻奇幻", categoryId: "scifi",
      tags: ["科幻", "冒险", "海洋"], rating: 8.9, readers: 16340, words: "22.6 万", year: 1870,
      status: "完结", free: true, cover: { theme: "navy", pattern: "bands" },
      blurb: "跟随鹦鹉螺号，潜入十九世纪想象力的最深处。",
      intro: "阿龙纳斯教授被神秘潜艇鹦鹉螺号俘获，随尼摩船长穿越珊瑚礁、海底森林与亚特兰蒂斯废墟。凡尔纳在电灯尚未普及的年代，写出了一个完整而可信的海底世界。",
      authorBio: "儒勒·凡尔纳（1828—1905），法国科幻小说家，被誉为“科幻小说之父”。",
      chapters: ["飞驰的暗礁", "鹦鹉螺号", "尼摩船长", "海底森林", "珊瑚王国", "亚特兰蒂斯", "冰山", "章鱼", "复仇", "尾声"],
      scores: { content: 0.3, cf: 0.32, popularity: 0.19, freshness: 0.19 },
      reason: "与你收藏的《小王子》同属“想象力”书单",
      featured: false, original: false
    },
    {
      id: "xiaowangzi", title: "小王子", author: "圣埃克苏佩里", category: "科幻奇幻", categoryId: "scifi",
      tags: ["童话", "哲思", "爱"], rating: 9.4, readers: 28640, words: "3.2 万", year: 1943,
      status: "完结", free: true, cover: { theme: "mustard", pattern: "rings" },
      blurb: "“真正重要的东西，用眼睛是看不见的。”",
      intro: "飞行员在撒哈拉沙漠遇见一个来自 B612 星球的小王子。小王子讲他的玫瑰、狐狸和旅途中遇见的奇怪大人。它被当作童话读，却常常在成年后的某个时刻突然击中你。",
      authorBio: "安托万·德·圣埃克苏佩里（1900—1944），法国飞行员、作家。",
      chapters: ["一 帽子", "二 沙漠", "三 星球", "四 玫瑰", "五 猴面包树", "六 日落", "七 狐狸", "八 离别", "九 回家"],
      scores: { content: 0.3, cf: 0.36, popularity: 0.21, freshness: 0.13 },
      reason: "你重读过 3 次以上，且评分高于同类作品均值",
      featured: true, original: false
    },
    {
      id: "shijiandezhezhou", title: "时间的褶皱", author: "顾行", category: "科幻奇幻", categoryId: "scifi",
      tags: ["原创", "科幻", "时间"], rating: 8.8, readers: 4120, words: "23.6 万", year: 2025,
      status: "连载", free: false, cover: { theme: "ink", pattern: "letter" },
      blurb: "每次睡着，他都会提前一天醒来。",
      intro: "气象工程师周野发现自己每天醒来都比别人早一天：他能看到尚未发生的天气，却无法阻止任何一场雨。直到他在一次异常的台风路径里，看见了自己的名字。",
      authorBio: "顾行，站内原创作者，写作偏向近未来与时间叙事。",
      chapters: ["第一章 提前一天", "第二章 台风眼", "第三章 气象站", "第四章 第二封信", "第五章 褶皱", "第六章 逆流", "第七章 明天见"],
      scores: { content: 0.36, cf: 0.2, popularity: 0.14, freshness: 0.3 },
      reason: "站内新作 · 与你收藏的科幻标签匹配",
      featured: false, original: true
    },
    {
      id: "suiyuanshidan", title: "随园食单", author: "袁枚", category: "艺术生活", categoryId: "life",
      tags: ["饮食", "生活", "清代"], rating: 8.8, readers: 6240, words: "6.8 万", year: 1792,
      status: "完结", free: true, cover: { theme: "mustard", pattern: "letter" },
      blurb: "清代文人的餐桌笔记，一本可以读饿的书。",
      intro: "袁枚写菜，也写做菜的人：火候、时节、器皿、待客之道。他不追求珍稀，讲究的是“有味者使之出，无味者使之入”。读它，像跟着一个讲究人逛了一趟菜场。",
      authorBio: "袁枚（1716—1797），清代诗人、美食家，著有《随园诗话》《随园食单》。",
      chapters: ["须知单", "戒单", "海鲜单", "江鲜单", "特牲单", "杂牲单", "羽族单", "水族有鳞单", "水族无鳞单", "杂素菜单", "小菜单", "点心单", "饭粥单", "茶酒单"],
      scores: { content: 0.27, cf: 0.25, popularity: 0.16, freshness: 0.32 },
      reason: "你收藏过“饮食与生活美学”主题书单",
      featured: false, original: false
    },
    {
      id: "yuanye", title: "园冶", author: "计成", category: "艺术生活", categoryId: "life",
      tags: ["园林", "美学", "营造"], rating: 8.7, readers: 4380, words: "3.4 万", year: 1631,
      status: "完结", free: true, cover: { theme: "bottle", pattern: "grid" },
      blurb: "中国第一部园林营造专著，讲如何把山水搬进院子。",
      intro: "计成谈相地、立基、屋宇、掇山、借景。他反对堆砌，主张“虽由人作，宛自天开”。短短几卷，既是造园手册，也是一种关于空间与自然的审美观。",
      authorBio: "计成（1582—1642），明代造园家，《园冶》为其代表作。",
      chapters: ["兴造论", "园说", "相地", "立基", "屋宇", "装折", "门窗", "墙垣", "铺地", "掇山", "选石", "借景"],
      scores: { content: 0.25, cf: 0.21, popularity: 0.14, freshness: 0.4 },
      reason: "你最近收藏了 2 本空间美学类作品",
      featured: false, original: false
    }
  ],

  reviews: [
    { id: "r1", bookId: "zhaohuaxishi", user: "周野", avatar: 0, date: "2 天前", rating: 5, likes: 42, text: "读《从百草园到三味书屋》时忽然想起外婆家的院子。鲁迅写童年没有把它写美，只是写得真，所以那些草木虫鱼才会一直活着。" },
    { id: "r2", bookId: "hulanhezhuan", user: "苏禾", avatar: 4, date: "3 天前", rating: 5, likes: 38, text: "萧红写的是呼兰河，也是所有人的故乡。最难过的是她写那些受苦的人时，语气里没有居高临下，只有一种近乎温柔的记得。" },
    { id: "r3", bookId: "jiuwairen", user: "陈默", avatar: 3, date: "5 天前", rating: 5, likes: 27, text: "第一次读觉得冷，第二次读才明白那不是冷漠，是一个人拒绝撒谎。审判他的世界，其实比默尔索更荒诞。" },
    { id: "r4", bookId: "xiaowangzi", user: "林见鹿", avatar: 1, date: "1 周前", rating: 5, likes: 61, text: "小时候以为是童话，现在知道它是关于失去的说明书。狐狸那段每次读都会停很久。" },
    { id: "r5", bookId: "renjiancihua", user: "许知白", avatar: 5, date: "1 周前", rating: 5, likes: 33, text: "“境界”二字看似玄，其实说的是作品能不能让人走进去。王国维的厉害之处在于，他既懂词，也懂人。" },
    { id: "r6", bookId: "shanhaizhijian", user: "阿棠", avatar: 2, date: "4 天前", rating: 4, likes: 18, text: "父子和解写得克制，没有煽情。修船那条线很好，船修好了，人也终于愿意说一句软话。" },
    { id: "r7", bookId: "waerdengchu", user: "顾行", avatar: 0, date: "2 周前", rating: 5, likes: 24, text: "独处不是逃离社会，而是把自己从别人的节奏里暂时拿回来。读到“我步入丛林”那段时，窗外正好下雨。" },
    { id: "r8", bookId: "laorenyuhai", user: "老周", avatar: 5, date: "2 周前", rating: 5, likes: 45, text: "“人可以被毁灭，但不能被打败。”年轻时觉得这是热血，现在觉得这是一个人对自己的交代。" },
    { id: "r9", bookId: "chensilu", user: "林见鹿", avatar: 1, date: "3 天前", rating: 4, likes: 19, text: "每天读两页，像是有人在耳边提醒：今天也不必被别人的情绪带走。适合放在床头，不适合一口气读完。" },
    { id: "r10", bookId: "changyejiangjin", user: "小满", avatar: 2, date: "6 天前", rating: 4, likes: 12, text: "前六章铺得很稳，第七章收得有点急。但停电夜里的那场对话写得好，每个人的证词都在保护自己。" },
    { id: "r11", bookId: "feiniaoji", user: "周野", avatar: 0, date: "1 周前", rating: 5, likes: 29, text: "短句的好处是可以随时放下，也随时被击中。最喜欢“我们看错了世界，却说世界欺骗了我们”。" },
    { id: "r12", bookId: "kunchongji", user: "阿棠", avatar: 2, date: "2 周前", rating: 5, likes: 21, text: "法布尔最难得的是耐心。他不急着给虫子下结论，只是看。读完会想去楼下草丛蹲一会儿。" }
  ],

  notes: [
    { id: "n1", bookId: "zhaohuaxishi", user: "林见鹿", date: "10 月 14 日", page: "第 32 页", quote: "我有一时，曾经屡次忆起儿时在故乡所吃的蔬果：菱角，罗汉豆，茭白，香瓜。", note: "写的是味道，其实是回不去的时间。可以把这段和我自己的童年记忆放在一起读。" },
    { id: "n2", bookId: "hulanhezhuan", user: "林见鹿", date: "10 月 12 日", page: "第 78 页", quote: "花开了，就像花睡醒了似的。鸟飞了，就像鸟上天了似的。", note: "重复的句式像孩子的眼睛，简单但不幼稚。萧红的语言节奏值得单独拎出来看。" },
    { id: "n3", bookId: "renjiancihua", user: "林见鹿", date: "10 月 9 日", page: "第 12 页", quote: "词以境界为最上。有境界则自成高格，自有名句。", note: "“境界”不是题材大小，而是作品有没有让人进入的空间。可以用它重读《人间词话》里的三种境界。" },
    { id: "n4", bookId: "waerdengchu", user: "林见鹿", date: "10 月 6 日", page: "第 56 页", quote: "我步入丛林，因为我希望生活得有意义。", note: "不是鼓励所有人去隐居，而是提醒自己：有些忙碌需要被重新检查。" },
    { id: "n5", bookId: "xiaowangzi", user: "林见鹿", date: "9 月 28 日", page: "第 21 页", quote: "真正重要的东西，用眼睛是看不见的。", note: "这句话被引用得太多了，几乎失去了重量。放回狐狸和玫瑰的上下文里，才重新变得具体。" },
    { id: "n6", bookId: "shanhaizhijian", user: "林见鹿", date: "9 月 25 日", page: "第 103 页", quote: "船修好了，父亲却没有立刻下水。他在船头坐了很久，像在等一个不必说出口的答案。", note: "好的留白。作者没有解释父亲在想什么，读者自己会补上。" }
  ],

  posts: [
    { id: "p1", user: "林见鹿", avatar: 1, time: "2 小时前", topic: "本周共读", bookId: "hulanhezhuan", text: "读到团圆媳妇那一章，停下来很久。萧红没有替她喊冤，只是把周围人的语气、动作、看热闹的姿势一一写下来。冷漠有时候不是恶意，是一群人一起把某件事当成“正常”。今晚八点共读室聊聊这一章。", image: "assets/img/pexels/reading-window.jpg", likes: 46, comments: 12 },
    { id: "p2", user: "周野", avatar: 0, time: "4 小时前", topic: "摘录", bookId: "zhaohuaxishi", text: "“我有一时，曾经屡次忆起儿时在故乡所吃的蔬果：菱角，罗汉豆，茭白，香瓜。”——鲁迅写故乡，先写的是舌头记得的东西。", image: "", likes: 31, comments: 5 },
    { id: "p3", user: "苏禾", avatar: 4, time: "昨天", topic: "书评", bookId: "shanhaizhijian", text: "《山海之间》最打动我的是它没有把“回乡”写成和解。阿岸和父亲到最后也没有抱头痛哭，只是把船推下了水。很多时候，关系就是这样慢慢修好的。", image: "assets/img/picsum/moread-post-1.jpg", likes: 18, comments: 7 },
    { id: "p4", user: "陈默", avatar: 3, time: "昨天", topic: "提问", bookId: "jiuwairen", text: "如果默尔索在葬礼上哭了，他还会被判死刑吗？加缪想写的到底是司法的荒诞，还是“不表演”的代价？想听听大家的读法。", image: "", likes: 9, comments: 14 },
    { id: "p5", user: "小满", avatar: 2, time: "2 天前", topic: "本周共读", bookId: "hulanhezhuan", text: "今天在通勤路上读完了第四章。萧红写有二伯偷东西那段，又好笑又心酸。她写人的缺点时，从不站在高处。", image: "assets/img/pexels/reading-tea.jpg", likes: 22, comments: 3 },
    { id: "p6", user: "阿棠", avatar: 2, time: "3 天前", topic: "摘录", bookId: "feiniaoji", text: "“如果你因错过了太阳而流泪，那么你也将错过群星了。”——适合贴在书桌前的一句话。", image: "", likes: 27, comments: 4 },
    { id: "p7", user: "顾行", avatar: 0, time: "3 天前", topic: "书评", bookId: "shijiandezhezhou", text: "站内原创里少见的硬科幻。时间褶皱的设定没有停留在炫技，最后落回到“人愿不愿意接受明天”这个问题上。推荐给喜欢《你一生的故事》的读者。", image: "assets/img/picsum/moread-post-2.jpg", likes: 14, comments: 6 },
    { id: "p8", user: "许知白", avatar: 5, time: "4 天前", topic: "提问", bookId: "renjiancihua", text: "王国维说“有境界则自成高格”，但又说“境界有大小，不以是而分优劣”。这两句怎么放在一起理解？", image: "", likes: 11, comments: 8 }
  ],

  postComments: [
    { postId: "p1", user: "周野", avatar: 0, time: "1 小时前", text: "团圆媳妇那一章我读了两遍。最难受的是围观的人并不觉得自己在作恶。" },
    { postId: "p1", user: "苏禾", avatar: 4, time: "42 分钟前", text: "萧红的克制很厉害。她越是不评判，读者越没法轻松地翻过去。" },
    { postId: "p1", user: "小满", avatar: 2, time: "18 分钟前", text: "今晚共读室会聊这一章吗？我想听听大家怎么看“正常”这件事。" },
    { postId: "p2", user: "阿棠", avatar: 2, time: "3 小时前", text: "味觉记忆真的很顽固。我每次回到老家，先找的不是人，是那家早餐店。" },
    { postId: "p4", user: "许知白", avatar: 5, time: "昨天", text: "我倾向于两者都有：司法程序的荒诞，和默尔索拒绝表演的代价，是同一件事的两面。" },
    { postId: "p5", user: "林见鹿", avatar: 1, time: "2 天前", text: "通勤读长篇很容易断，但萧红的章节短，反而适合一站一站地接上。" }
  ],

  users: [
    { name: "林见鹿", handle: "@linjianlu", avatar: 1, bio: "在出版社做编辑，读得慢，记得多。", joined: "2024 年 3 月", stats: { hours: 128, finished: 12, notes: 86, streak: 23 } },
    { name: "周野", handle: "@zhouye", avatar: 0, bio: "写小说，也读别人的小说。", joined: "2023 年 11 月" },
    { name: "苏禾", handle: "@suhe", avatar: 4, bio: "南方人，茶与家族史爱好者。", joined: "2024 年 6 月" },
    { name: "陈默", handle: "@chenmo", avatar: 3, bio: "悬疑作者，习惯在夜里读书。", joined: "2023 年 8 月" },
    { name: "小满", handle: "@xiaoman", avatar: 2, bio: "通勤阅读选手，每周一本。", joined: "2024 年 1 月" },
    { name: "阿棠", handle: "@atang", avatar: 2, bio: "自然观察与散文。", joined: "2024 年 9 月" },
    { name: "顾行", handle: "@guxing", avatar: 0, bio: "写科幻，关心时间与记忆。", joined: "2024 年 4 月" },
    { name: "许知白", handle: "@xuzhibai", avatar: 5, bio: "古典文学研究生，正在补课。", joined: "2023 年 12 月" }
  ],

  stats: {
    readingGoal: { year: 2026, target: 24, finished: 12 },
    weeklyActive: [820, 932, 901, 1034, 1290, 1130, 980],
    weeklyLabels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    categoryDistribution: [
      { name: "文学经典", value: 28 },
      { name: "诗歌散文", value: 19 },
      { name: "人文社科", value: 16 },
      { name: "当代小说", value: 14 },
      { name: "科幻奇幻", value: 11 },
      { name: "心理成长", value: 7 },
      { name: "其他", value: 5 }
    ],
    kpis: { users: 3240, books: 27, todayMinutes: 18620, pendingReviews: 12 },
    profileWeekly: [35, 52, 28, 64, 41, 78, 46],
    profileWeeklyLabels: ["一", "二", "三", "四", "五", "六", "日"],
    profileCategories: [
      { name: "文学经典", value: 38 },
      { name: "诗歌散文", value: 24 },
      { name: "人文社科", value: 18 },
      { name: "心理成长", value: 12 },
      { name: "其他", value: 8 }
    ],
    heatmap: Array.from({ length: 84 }, (_, i) => {
      const seed = (i * 37 + 11) % 100;
      if (seed < 34) return 0;
      if (seed < 56) return 1;
      if (seed < 74) return 2;
      if (seed < 92) return 3;
      return 4;
    })
  },

  adminUsers: [
    { name: "林见鹿", email: "lin@moread.cn", role: "读者", joined: "2024-03-12", status: "正常" },
    { name: "周野", email: "zhou@moread.cn", role: "读者", joined: "2023-11-03", status: "正常" },
    { name: "苏禾", email: "su@moread.cn", role: "作者", joined: "2024-06-18", status: "正常" },
    { name: "陈默", email: "chen@moread.cn", role: "作者", joined: "2023-08-21", status: "正常" },
    { name: "小满", email: "man@moread.cn", role: "读者", joined: "2024-01-09", status: "正常" },
    { name: "阿棠", email: "tang@moread.cn", role: "读者", joined: "2024-09-02", status: "禁言" },
    { name: "顾行", email: "gu@moread.cn", role: "作者", joined: "2024-04-15", status: "正常" },
    { name: "许知白", email: "xu@moread.cn", role: "读者", joined: "2023-12-27", status: "正常" }
  ],

  adminReviews: [
    { id: "ar1", user: "周野", book: "朝花夕拾", text: "读《从百草园到三味书屋》时忽然想起外婆家的院子。", date: "10-16 21:40", status: "待审" },
    { id: "ar2", user: "苏禾", book: "呼兰河传", text: "萧红写的是呼兰河，也是所有人的故乡。", date: "10-16 18:12", status: "待审" },
    { id: "ar3", user: "陈默", book: "局外人", text: "第一次读觉得冷，第二次读才明白那不是冷漠。", date: "10-15 23:05", status: "待审" },
    { id: "ar4", user: "阿棠", book: "山海之间", text: "父子和解写得克制，没有煽情。", date: "10-15 20:31", status: "已通过" },
    { id: "ar5", user: "小满", book: "长夜将尽", text: "前六章铺得很稳，第七章收得有点急。", date: "10-15 12:18", status: "已驳回" }
  ]
};
