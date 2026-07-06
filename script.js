const taskCards = document.querySelectorAll(".task-card");
const composeForm = document.querySelector("#composeForm");
const profileInput = document.querySelector("#profileInput");
const ideaInput = document.querySelector("#ideaInput");
const imageInput = document.querySelector("#imageInput");
const previewImage = document.querySelector("#previewImage");
const resultGrid = document.querySelector("#resultGrid");
const resultMeta = document.querySelector("#resultMeta");
const historyList = document.querySelector("#historyList");
const toast = document.querySelector("#toast");
const sampleButton = document.querySelector("#sampleButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const copyAllButton = document.querySelector("#copyAllButton");
const softenButton = document.querySelector("#softenButton");
const shortenButton = document.querySelector("#shortenButton");
const testCaseSelect = document.querySelector("#testCaseSelect");
const loadTestCaseButton = document.querySelector("#loadTestCaseButton");
const scoreSelects = document.querySelectorAll(".score-select");
const scoreSummary = document.querySelector("#scoreSummary");
const saveScoreButton = document.querySelector("#saveScoreButton");
const scoreHistory = document.querySelector("#scoreHistory");
const promptPreview = document.querySelector("#promptPreview");
const copyPromptButton = document.querySelector("#copyPromptButton");
const aiResponsePreview = document.querySelector("#aiResponsePreview");
const copyAiResponseButton = document.querySelector("#copyAiResponseButton");

const storageKey = "tuxiaoer-history-v1";
const scoreStorageKey = "tuxiaoer-score-v1";

const samples = [
  "这款珍珠耳环适合通勤，想发一篇自然一点的小红书种草。",
  "宝宝最近开始吃辅食了，想记录一下第 3 周的变化。",
  "今天做了一组法式美甲，想发给附近的女生看看。",
  "我想做一个 30 岁宝妈生活记录账号，但不知道第一周发什么。",
  "店里新到一款奶油色针织开衫，想拍一条口播视频。"
];

const taskNames = {
  note: "小红书笔记",
  script: "抖音脚本",
  cover: "封面标题",
  plan: "一周选题"
};

const testCases = [
  {
    id: 1,
    user: "小店店主",
    profile: "饰品分享小店主，发通勤搭配和温柔种草。",
    platform: "小红书",
    task: "note",
    tone: "温柔种草",
    idea: "这款珍珠耳环适合通勤，想发自然一点的种草。"
  },
  {
    id: 2,
    user: "小店店主",
    profile: "服装店主，发日常穿搭和上新。",
    platform: "抖音",
    task: "script",
    tone: "轻松口播",
    idea: "奶油色针织开衫上新，想拍一条 30 秒口播。"
  },
  {
    id: 3,
    user: "宝妈",
    profile: "30 岁宝妈，记录辅食和育儿日常。",
    platform: "小红书",
    task: "note",
    tone: "真实分享",
    idea: "宝宝辅食第 3 周记录，想写得温柔真实。"
  },
  {
    id: 4,
    user: "宝妈",
    profile: "宝妈生活记录账号，想稳定更新。",
    platform: "小红书",
    task: "plan",
    tone: "真实分享",
    idea: "不知道下周发什么，方向是带娃日常和好物。"
  },
  {
    id: 5,
    user: "美甲店主",
    profile: "本地美甲店主，发案例和到店引导。",
    platform: "抖音",
    task: "script",
    tone: "轻松口播",
    idea: "今天做了一组法式美甲，想吸引附近女生。"
  },
  {
    id: 6,
    user: "本地餐饮",
    profile: "甜品店主，发新品和门店日常。",
    platform: "小红书",
    task: "note",
    tone: "真实分享",
    idea: "新品草莓蛋糕上市，想发一篇探店感内容。"
  },
  {
    id: 7,
    user: "课程老师",
    profile: "亲子阅读老师，发课程案例和育儿建议。",
    platform: "小红书",
    task: "cover",
    tone: "专业建议",
    idea: "亲子阅读课上孩子主动讲故事了。"
  },
  {
    id: 8,
    user: "家居博主",
    profile: "小户型收纳博主，发改造和清单。",
    platform: "小红书",
    task: "note",
    tone: "真实分享",
    idea: "整理了一个小户型收纳角落。"
  },
  {
    id: 9,
    user: "健身教练",
    profile: "产后恢复教练，发温和训练建议。",
    platform: "抖音",
    task: "script",
    tone: "专业建议",
    idea: "产后妈妈如何开始恢复训练。"
  },
  {
    id: 10,
    user: "普通用户",
    profile: "周末亲子生活记录，偶尔发小红书。",
    platform: "小红书",
    task: "note",
    tone: "真实分享",
    idea: "周末带娃去公园，拍了几张照片。"
  }
];

let activeTask = "note";
let lastGenerated = null;

function getCheckedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function setCheckedValue(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function setActiveTask(task) {
  activeTask = task;
  taskCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.task === activeTask);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function pickSubject(idea) {
  const cleaned = idea.trim().replace(/\s+/g, " ");
  if (!cleaned) return "今天这份素材";
  return cleaned.length > 26 ? `${cleaned.slice(0, 26)}...` : cleaned;
}

function buildNote(idea, tone, profile) {
  const subject = pickSubject(idea);
  const role = profile || "轻量创作者";
  return [
    {
      title: "标题推荐",
      body: `1. ${subject}，这样发更像真实分享\n2. 不用太用力，也能把这件事讲清楚\n3. 最近很想记录的一点小变化`
    },
    {
      title: "封面短句",
      body: `把日常素材整理成一篇能发的内容\n语气：${tone}\n账号：${role}`
    },
    {
      title: "正文草稿",
      body: `今天想分享的是：${idea || "一件最近很有感触的小事"}。\n\n作为${role}，我会先从真实使用场景讲起，不急着把卖点堆满。先说为什么会注意到它，再说一个具体细节，最后给一点自己的小建议。\n\n如果你也有类似情况，可以先从一张图、一句话开始，不用等准备得特别完美。`
    },
    {
      title: "标签建议",
      body: "#小红书笔记 #真实分享 #生活记录 #好物分享 #新手博主 #内容创作"
    }
  ];
}

function buildScript(idea, tone, profile) {
  const subject = pickSubject(idea);
  const role = profile || "轻量创作者";
  return [
    {
      title: "开场 3 秒",
      body: `如果你也在纠结怎么把“${subject}”讲清楚，可以先这样拍。`
    },
    {
      title: "口播脚本",
      body: `今天想跟你们分享一个很适合做内容的小主题：${idea || "我最近的一段真实体验"}。\n\n我是${role}，所以这条内容不用拍得太复杂。第一步，先拍清楚真实场景。第二步，用一句话讲出为什么值得分享。第三步，讲一个具体细节就够了。\n\n这样拍出来会更像真实表达，也更容易让人看完。`
    },
    {
      title: "镜头提示",
      body: "1. 先拍一个近景，交代主体\n2. 再拍使用或生活场景\n3. 中间加一段手部操作或细节特写\n4. 最后看镜头说一句互动问题"
    },
    {
      title: "结尾互动",
      body: `你们想看我继续拆“${subject}”这一类内容怎么发吗？`
    }
  ];
}

function buildCover(idea, tone, profile) {
  const subject = pickSubject(idea);
  const role = profile || "轻量创作者";
  return [
    {
      title: "封面短句",
      body: `1. 这件事，真的可以从一张图开始\n2. ${subject}，我会这样发\n3. 普通人也能用的内容思路\n4. 别急着写长文，先抓这个点`
    },
    {
      title: "点击理由",
      body: "把用户最关心的结果放在前面：省时间、能照做、像真实分享、不像硬广。"
    },
    {
      title: "标题方向",
      body: `真实记录型：我最近才发现，${subject}可以这样表达\n经验总结型：新手做内容，先别忽略这个细节\n种草分享型：不是硬推，是我真的会这样用`
    },
    {
      title: "语气建议",
      body: `当前语气：${tone}\n账号定位：${role}\n建议封面字数控制在 8-16 个字，正文标题可以稍微长一点。`
    }
  ];
}

function buildPlan(idea, tone, profile) {
  const subject = pickSubject(idea);
  const role = profile || "轻量创作者";
  return [
    {
      title: "一周选题",
      body: `周一：真实记录 - ${subject}\n周二：经验分享 - 我是怎么想到这个内容的\n周三：细节拆解 - 拍摄/使用/体验里的一个小点\n周四：避坑总结 - 新手容易卡住的地方\n周五：清单整理 - 3 个可以直接照做的方法\n周六：轻种草 - 为什么我会推荐这个方向\n周日：复盘互动 - 这一周你们最想看哪个主题`
    },
    {
      title: "拍摄提示",
      body: "每条内容至少准备 3 个画面：主体图、过程图、结果图。短视频可以按“开场问题 -> 过程展示 -> 总结建议”来拍。"
    },
    {
      title: "发布节奏",
      body: "小红书适合图文沉淀，抖音适合把同一个主题拆成口播。第一周先不要追求爆款，先稳定发完 7 条。"
    },
    {
      title: "账号提醒",
      body: `账号定位：${role}\n语气保持：${tone}。每条内容都留一个互动问题，让评论区有话可接。`
    }
  ];
}

function generateSections(task, idea, tone, profile) {
  if (task === "script") return buildScript(idea, tone, profile);
  if (task === "cover") return buildCover(idea, tone, profile);
  if (task === "plan") return buildPlan(idea, tone, profile);
  return buildNote(idea, tone, profile);
}

function normalizeText(text) {
  return (text || "")
    .replace(/\s+/g, " ")
    .replace(/[。！？,.，；;：:]+$/g, "")
    .trim();
}

function getScenario(profile, idea) {
  const text = `${profile} ${idea}`;
  const base = {
    subject: normalizeText(idea) || "这份素材",
    titles: [
      "今天这条内容，可以这样自然地发",
      "把手里的素材整理成一篇能发的内容",
      "新手也能照着发的一版内容"
    ],
    coverText: "一张图，也能讲清楚",
    body: `今天这条内容可以先从真实场景开始写。\n\n先交代你为什么拍下它，再补一个具体细节，最后给出自己的感受或小建议。这样不会像硬广，也比直接堆卖点更自然。\n\n如果暂时不知道怎么写，就先用“我为什么想分享它 + 一个细节 + 一个小建议”的结构。`,
    tags: ["小红书笔记", "真实分享", "生活记录", "内容创作"],
    hook: "这条内容如果不知道怎么开头，可以先用一个真实问题切入。",
    voiceover: "先拍清楚主体，再讲你为什么想分享它。中间补一个细节，最后留一个互动问题。",
    shots: ["主体近景", "使用或真实场景", "细节特写", "结尾互动"],
    ending: "你们还想看这一类内容怎么发吗？",
    publishAdvice: "先发自然版，不要急着堆卖点；发布后看评论再决定下一条怎么延展。",
    weeklyPlan: []
  };

  if (/珍珠|耳环|饰品/.test(text)) {
    return {
      ...base,
      subject: "通勤珍珠耳环",
      titles: ["通勤戴珍珠耳环，真的比想象中耐看", "上班不想太夸张，可以试试小珍珠", "这副耳环，是低调但提气色的那种"],
      coverText: "通勤精致感，就藏在耳边",
      body: `最近很常戴这副珍珠耳环，原因不是它多抢眼，而是它刚好适合通勤。\n\n它的存在感比较轻，搭衬衫、针织衫或者简单白 T 都不会突兀。珍珠会让整个人看起来柔和一点，但又不会有“刻意打扮”的感觉。\n\n如果你平时不太敢戴夸张饰品，可以先从这种小颗珍珠开始。拍图时建议拍一个上耳近景，再补一张搭配全身，会比单独拍商品更有种草感。`,
      tags: ["珍珠耳环", "通勤穿搭", "饰品分享", "温柔种草", "小店日常", "上班穿搭"],
      hook: "上班想戴耳环，但又怕太夸张？这副小珍珠可以看看。",
      voiceover: `这副珍珠耳环我觉得很适合通勤。它不是那种一眼很抢的款，但戴上会让脸边多一点柔和感。\n\n我会建议你们拍三组画面：先拍耳环细节，再拍上耳效果，最后搭一件衬衫或针织衫。这样观众能直接看到它适合什么场景。`,
      shots: ["耳环放在浅色布面上拍细节", "上耳近景，展示大小和光泽", "搭配衬衫或针织衫的半身画面", "对镜说一句适合通勤的原因"],
      ending: "你们通勤更喜欢珍珠款，还是金属款？",
      publishAdvice: "适合小红书图文，也适合抖音 20-30 秒口播；重点拍上耳和通勤搭配，不要只拍商品。"
    };
  }

  if (/针织|开衫|服装|穿搭/.test(text)) {
    return {
      ...base,
      subject: "奶油色针织开衫",
      titles: ["奶油色开衫上身，比想象中显温柔", "春秋衣柜里，这种开衫真的很实穿", "新到的针织开衫，我会这样搭"],
      coverText: "奶油色开衫，温柔但不挑人",
      body: `这件奶油色针织开衫属于很好搭的基础款。\n\n颜色不是特别白，所以不会显得冷；版型可以敞开穿，也可以单穿。日常可以搭牛仔裤、半裙，或者直接内搭白 T。\n\n拍内容时不要只说“上新了”，可以直接给 3 套搭配，让用户看到它能穿去上班、约会和周末出门。`,
      tags: ["针织开衫", "日常穿搭", "服装上新", "温柔穿搭", "小店主日常"],
      hook: "新到一件奶油色开衫，我先给你们搭 3 套看看。",
      voiceover: `这件奶油色针织开衫不是那种很挑人的白，它会更柔和一点。\n\n第一套我会搭牛仔裤，适合日常出门。第二套搭半裙，会更温柔。第三套里面穿白 T，直接当薄外套。\n\n如果你店里也有这种基础款，不要只拍挂拍，直接拍上身搭配，用户会更容易想象自己穿起来的样子。`,
      shots: ["挂拍展示颜色和纹理", "上身搭牛仔裤", "上身搭半裙", "镜头前说明适合什么身材和场景"],
      ending: "你们想看这件开衫更日常的搭配，还是更温柔的搭配？",
      publishAdvice: "抖音脚本重点用“3 套搭配”承接，不要只说上新。"
    };
  }

  if (/辅食|宝宝/.test(text)) {
    return {
      ...base,
      subject: "宝宝辅食第 3 周记录",
      titles: ["辅食第 3 周，我更在意宝宝的反应", "宝宝辅食记录：慢慢来真的很重要", "第 3 周辅食小记录，给新手妈妈参考"],
      coverText: "辅食第 3 周，别急着加太多",
      body: `这周继续记录宝宝辅食的变化。\n\n第 3 周我没有急着加很多新东西，更多是在观察宝宝的接受度：愿不愿意张嘴、吃完有没有明显不舒服、对哪种口感更有兴趣。\n\n我觉得新手妈妈不用把辅食做得很复杂，先稳定节奏，再慢慢增加种类。每个宝宝情况都不一样，记录下来比跟别人比较更有用。`,
      tags: ["宝宝辅食", "辅食记录", "新手妈妈", "育儿日常", "宝妈分享"],
      hook: "辅食第 3 周，我发现比吃多少更重要的是观察反应。",
      voiceover: "这周我主要记录宝宝对不同口感的反应，没有急着加很多新东西。每次吃完都会观察状态，慢慢找到适合自己的节奏。",
      shots: ["辅食准备过程", "小碗和勺子近景", "宝宝吃饭的手部或背影", "记录本或当天菜单"],
      ending: "你们家宝宝刚开始辅食时，最先接受的是哪一种？",
      publishAdvice: "避免医疗化建议，重点写个人记录和观察，不制造育儿焦虑。"
    };
  }

  if (/下周|一周|选题|带娃日常/.test(text)) {
    return {
      ...base,
      subject: "宝妈一周内容计划",
      titles: ["宝妈日常一周怎么发", "带娃账号 7 天选题安排", "新手宝妈也能照着发的一周内容"],
      coverText: "宝妈账号，一周这样发",
      body: "这一周不要追求每条都很完整，先围绕真实生活记录、经验复盘、好物使用和轻互动来排。",
      tags: ["宝妈日常", "小红书选题", "育儿记录", "好物分享"],
      weeklyPlan: [
        "周一：宝宝早餐/辅食记录，拍准备过程和吃饭反应",
        "周二：带娃出门包清单，展示真正用到的 5 样东西",
        "周三：一个新手妈妈踩过的小坑，写经验复盘",
        "周四：家里某个带娃小角落，拍整理前后",
        "周五：本周最省心的一个好物，讲使用场景",
        "周六：周末亲子出门记录，拍路线和小细节",
        "周日：一周复盘，问粉丝下周想看辅食还是好物"
      ],
      shots: ["每天先拍一个真实画面", "补一个过程细节", "最后留一个互动问题"],
      publishAdvice: "一周选题要先保证能拍、能写、能持续，不要一开始追热点。"
    };
  }

  if (/美甲|法式/.test(text)) {
    return {
      ...base,
      subject: "法式美甲案例",
      titles: ["这组法式美甲，干净但很显手长", "想做不夸张的美甲，可以看这组", "本地女生会喜欢的法式款"],
      coverText: "干净显手长的法式美甲",
      body: "这组法式美甲适合想要干净、耐看、不夸张效果的女生。重点可以讲甲型、颜色、适合的手型和通勤场景。",
      tags: ["法式美甲", "本地美甲", "美甲案例", "显手长", "到店日常"],
      hook: "想做美甲，但又怕太夸张？这组法式可以参考。",
      voiceover: `今天这组是比较干净的法式美甲，适合喜欢低调一点的女生。\n\n它的重点不是花样很多，而是边缘线条干净，颜色也比较显手白。拍的时候可以先给成品近景，再拍客户上手效果，最后补一句适合通勤和日常。\n\n如果你在附近，也可以拿这组图来店里沟通款式。`,
      shots: ["成品近景，展示线条", "手部自然动作，展示显手长效果", "不同光线下拍颜色", "结尾拍门店或工具台一角"],
      ending: "你们喜欢这种干净法式，还是更明显的款式？",
      publishAdvice: "服务型商家要自然放到店引导，比如“附近女生可以拿图沟通”，不要硬喊促销。"
    };
  }

  if (/草莓|蛋糕|甜品/.test(text)) {
    return {
      ...base,
      subject: "草莓蛋糕新品",
      titles: ["草莓季新品，今天店里先上这一款", "这块草莓蛋糕，适合下午来一口", "不是很甜的草莓蛋糕，想分享给你们"],
      coverText: "草莓蛋糕上新啦",
      body: `今天店里上了草莓蛋糕，想把它拍成一篇有探店感的内容。\n\n可以先写第一口感受：草莓的酸甜、奶油的轻盈度、蛋糕胚是否湿润。再补一个适合场景，比如下午茶、朋友小聚，或者下班后带一块回家。\n\n图片建议拍切面、整块、店内小角落，不要只拍一张成品图。`,
      tags: ["草莓蛋糕", "甜品店", "新品上市", "下午茶", "本地探店", "小店日常"],
      hook: "草莓季到了，店里今天先上这一块。",
      voiceover: "这款草莓蛋糕重点可以拍切面和第一口感受。先让大家看到草莓和奶油的比例，再说适合下午茶或下班带走。",
      shots: ["整块蛋糕近景", "切面特写", "叉子挖第一口", "店内桌面或包装画面"],
      ending: "你们吃草莓蛋糕喜欢奶油多一点，还是草莓多一点？",
      publishAdvice: "小红书要写得像探店体验，弱化促销语，强化口感和场景。"
    };
  }

  if (/亲子阅读|讲故事/.test(text)) {
    return {
      ...base,
      subject: "孩子主动讲故事",
      titles: ["孩子主动讲故事的那一刻", "亲子阅读，不只是把书读完", "比识字更让我惊喜的是表达欲"],
      coverText: "孩子开口讲故事了",
      body: "这条内容适合做成教育类案例：先写孩子原本的状态，再写课堂中的一个变化，最后给家长一个温和建议。",
      tags: ["亲子阅读", "阅读启蒙", "表达能力", "课程案例", "育儿建议"],
      hook: "有时候亲子阅读的进步，不是读了几本书，而是孩子开始愿意讲。",
      voiceover: "今天有个孩子在阅读课上主动讲故事了。这个变化不一定很大，但说明他开始愿意表达。家长在家也可以多问开放问题，而不是只问记住了没有。",
      shots: ["绘本封面或书页", "课堂互动背影", "孩子指图讲述的手部画面", "老师总结一个方法"],
      ending: "你们家孩子读绘本时，更喜欢听故事还是自己讲？",
      publishAdvice: "封面标题要短，避免夸张承诺，不要写成“立刻提升表达力”。"
    };
  }

  if (/收纳|小户型/.test(text)) {
    return {
      ...base,
      subject: "小户型收纳角落",
      titles: ["小户型这个角落，整理完清爽很多", "收纳不是买盒子，是先分清常用和不常用", "这个小角落，我按 3 步整理好了"],
      coverText: "小户型角落整理前后",
      body: `这次整理的是一个小户型里容易堆东西的角落。\n\n我会先把东西全部拿出来，分成常用、不常用、可以丢掉三类。常用的放在伸手能拿到的位置，不常用的收进盒子里，最后只留一个视觉上清爽的台面。\n\n拍内容时一定要有前后对比，再补一个清单，用户会更容易照着做。`,
      tags: ["小户型收纳", "收纳整理", "家居改造", "整理前后", "生活方式"],
      hook: "小户型收纳别急着买盒子，先把常用和不常用分开。",
      voiceover: "我今天整理的是一个很容易乱的小角落。先清空，再分类，最后把常用物放到最顺手的位置。",
      shots: ["整理前全景", "物品分类平铺", "收纳过程", "整理后对比"],
      ending: "你们家最容易乱的是玄关、厨房，还是书桌？",
      publishAdvice: "小红书笔记建议用前后对比做首图，正文按步骤写。"
    };
  }

  if (/产后|恢复|训练/.test(text)) {
    return {
      ...base,
      subject: "产后恢复训练入门",
      titles: ["产后恢复别急，先从这几个动作开始", "产后妈妈开始训练前，先确认这 3 件事", "温和恢复，比猛练更重要"],
      coverText: "产后恢复，先慢一点",
      body: "这类内容要谨慎表达，强调个体差异和必要时咨询专业人士，不承诺效果，不制造身材焦虑。",
      tags: ["产后恢复", "温和训练", "健身教练", "新手训练", "健康科普"],
      hook: "产后想恢复训练，第一步不是猛练，而是先确认身体状态。",
      voiceover: `很多产后妈妈想开始训练，但我更建议先慢一点。\n\n第一，确认身体恢复情况，有不适先咨询医生或专业人士。第二，从呼吸、核心感知和轻量活动开始。第三，不要用别人的进度要求自己。\n\n训练的目的不是焦虑地变瘦，而是慢慢找回稳定和力量。`,
      shots: ["教练面对镜头说明注意事项", "呼吸或核心感知示范", "低强度动作侧面示范", "结尾提醒不适先暂停"],
      ending: "如果你刚开始恢复训练，最想先解决的是体力、腰背，还是核心稳定？",
      publishAdvice: "健康类内容必须保守，不承诺效果，不替代医疗建议。"
    };
  }

  if (/公园|带娃|周末/.test(text)) {
    return {
      ...base,
      subject: "周末带娃去公园",
      titles: ["周末带娃去公园，拍到了几个小瞬间", "不用安排太满，公园半天也很开心", "带娃出门，最值得记录的是这些小细节"],
      coverText: "周末公园小记录",
      body: `周末带娃去了公园，拍了几张很普通但很想留下来的照片。\n\n可以写孩子追泡泡、捡树叶、坐在草地上吃小零食这些细节。它不需要很精致，重点是有生活感。\n\n这类笔记适合用轻松的语气，最后可以补一个小清单：带水、纸巾、小零食、替换衣服。`,
      tags: ["周末带娃", "亲子日常", "公园记录", "生活碎片", "小红书日常"],
      hook: "周末不用安排很满，带娃去公园半天也能拍到很多小瞬间。",
      voiceover: "这次去公园没有特别计划，就是让孩子跑一跑、看看树叶、吃点小零食。这样的日常其实很适合记录。",
      shots: ["孩子背影或手部细节", "草地和树叶", "小零食或水杯", "回家路上的背影"],
      ending: "你们周末带娃更喜欢去公园，还是去室内游乐场？",
      publishAdvice: "普通生活记录要写具体细节，不要追求精致感。"
    };
  }

  return base;
}

function simulateAIResponse(promptPayload) {
  const { profile, platform, task, tone, idea } = promptPayload.input;
  const scenario = getScenario(profile, idea);

  return {
    titles: scenario.weeklyPlan.length ? scenario.weeklyPlan : scenario.titles,
    coverText: scenario.coverText,
    body: scenario.body,
    tags: scenario.tags,
    script: {
      hook: scenario.hook,
      voiceover: scenario.voiceover,
      shots: scenario.shots,
      ending: scenario.ending
    },
    publishAdvice: `平台：${platform}。任务：${task}。语气：${tone}。\n${scenario.publishAdvice}`
  };
}

function mapAIResponseToSections(response, task) {
  if (task === "script") {
    return [
      { title: "开场 3 秒", body: response.script.hook },
      { title: "口播脚本", body: response.script.voiceover },
      { title: "镜头提示", body: response.script.shots.map((item, index) => `${index + 1}. ${item}`).join("\n") },
      { title: "结尾互动", body: response.script.ending }
    ];
  }

  if (task === "cover") {
    return [
      { title: "封面短句", body: response.titles.map((item, index) => `${index + 1}. ${item}`).join("\n") },
      { title: "点击理由", body: response.coverText },
      { title: "标题方向", body: response.publishAdvice },
      { title: "语气建议", body: response.tags.map((item) => `#${item}`).join(" ") }
    ];
  }

  if (task === "plan") {
    return [
      { title: "一周选题", body: response.titles.map((item) => item).join("\n") },
      { title: "拍摄提示", body: response.script.shots.map((item, index) => `${index + 1}. ${item}`).join("\n") },
      { title: "发布节奏", body: response.publishAdvice },
      { title: "账号提醒", body: response.body }
    ];
  }

  return [
    { title: "标题推荐", body: response.titles.map((item, index) => `${index + 1}. ${item}`).join("\n") },
    { title: "封面短句", body: `${response.coverText}\n${response.publishAdvice}` },
    { title: "正文草稿", body: response.body },
    { title: "标签建议", body: response.tags.map((item) => `#${item}`).join(" ") }
  ];
}

function renderResults(payload) {
  resultMeta.textContent = `${payload.platform} · ${payload.tone} · ${taskNames[payload.task]}`;
  resultGrid.innerHTML = payload.sections
    .map((section, index) => {
      return `<article class="result-card">
        <div class="result-card-header">
          <h3>${section.title}</h3>
          <button class="copy-button" type="button" data-copy-index="${index}">复制</button>
        </div>
        <textarea class="result-text" data-result-index="${index}" rows="7">${section.body}</textarea>
      </article>`;
    })
    .join("");
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveHistory(item) {
  const current = readHistory();
  const next = [item, ...current].slice(0, 8);
  localStorage.setItem(storageKey, JSON.stringify(next));
  renderHistory();
}

function renderHistory() {
  const history = readHistory();
  if (!history.length) {
    historyList.innerHTML = `<div class="empty-state">生成后的内容会保存在这里，方便你继续编辑和复制。</div>`;
    return;
  }

  historyList.innerHTML = history
    .map((item, index) => {
      return `<button class="history-item" type="button" data-history-index="${index}">
        <span>${item.platform} · ${taskNames[item.task]}</span>
        <strong>${item.idea || "未命名内容"}</strong>
        <span>${item.profile || "未填写账号定位"}</span>
        <span>${item.createdAt}</span>
      </button>`;
    })
    .join("");
}

function readScores() {
  try {
    return JSON.parse(localStorage.getItem(scoreStorageKey)) || [];
  } catch {
    return [];
  }
}

function renderScoreHistory() {
  const records = readScores();
  if (!records.length) {
    scoreHistory.innerHTML = `<div class="empty-state compact">评分会保存在这里，用来判断是否进入 AI 开发。</div>`;
    return;
  }

  const passed = records.filter((item) => item.passed).length;
  scoreHistory.innerHTML = `<div class="score-pass">已测 ${records.length}/10 · 通过 ${passed} 组</div>` +
    records
      .slice(0, 5)
      .map((item) => {
        return `<div class="score-record">
          <strong>${item.caseName}</strong>
          <span>平均 ${item.average} · ${item.passed ? "通过" : "待优化"}</span>
        </div>`;
      })
      .join("");
}

function saveScore(record) {
  const current = readScores().filter((item) => item.caseId !== record.caseId);
  localStorage.setItem(scoreStorageKey, JSON.stringify([record, ...current].slice(0, 10)));
  renderScoreHistory();
}

function getScoreState() {
  const scores = Array.from(scoreSelects).map((select) => Number(select.value));
  const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const publishable = Number(document.querySelector('[data-score="publishable"]').value);
  const passed = average >= 3.8 && publishable >= 4;
  return {
    average: average.toFixed(1),
    passed,
    scores
  };
}

function updateScoreSummary() {
  const state = getScoreState();
  scoreSummary.textContent = `平均 ${state.average} · ${state.passed ? "通过" : "待优化"}`;
  scoreSummary.classList.toggle("weak", !state.passed);
}

function generateContent(options = {}) {
  const shouldSave = options.save !== false;
  const platform = getCheckedValue("platform");
  const tone = getCheckedValue("tone");
  const generationMode = getCheckedValue("generationMode");
  const profile = profileInput.value.trim();
  const idea = ideaInput.value.trim();
  const promptPayload = buildPromptPayload();
  const aiResponse = simulateAIResponse(promptPayload);
  const sections = generationMode === "模拟 AI"
    ? mapAIResponseToSections(aiResponse, activeTask)
    : generateSections(activeTask, idea, tone, profile);
  const payload = {
    task: activeTask,
    platform,
    tone,
    generationMode,
    profile,
    idea,
    aiResponse,
    sections,
    createdAt: new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  lastGenerated = payload;
  renderResults(payload);
  if (shouldSave) {
    saveHistory(payload);
    showToast("内容已生成并保存到历史");
  }
  updatePromptPreview();
  updateAIResponsePreview(aiResponse);
}

taskCards.forEach((card) => {
  card.addEventListener("click", () => {
    taskCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    activeTask = card.dataset.task;
    generateContent({ save: false });
    updatePromptPreview();
  });
});

loadTestCaseButton.addEventListener("click", () => {
  const item = testCases[Number(testCaseSelect.value)];
  profileInput.value = item.profile;
  ideaInput.value = item.idea;
  setCheckedValue("platform", item.platform);
  setCheckedValue("tone", item.tone);
  setActiveTask(item.task);
  scoreSelects.forEach((select) => {
    select.value = "4";
  });
  updateScoreSummary();
  generateContent({ save: false });
  updatePromptPreview();
  showToast(`已载入样例 ${item.id}`);
});

scoreSelects.forEach((select) => {
  select.addEventListener("change", updateScoreSummary);
});

saveScoreButton.addEventListener("click", () => {
  const item = testCases[Number(testCaseSelect.value)];
  const state = getScoreState();
  saveScore({
    caseId: item.id,
    caseName: `${item.id}. ${item.user} · ${taskNames[item.task]}`,
    average: state.average,
    passed: state.passed,
    scores: state.scores,
    createdAt: new Date().toLocaleString("zh-CN")
  });
  showToast("评分已保存");
});

composeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generateContent();
});

composeForm.addEventListener("input", updateGenerationPreviews);
composeForm.addEventListener("change", updateGenerationPreviews);

resultGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-index]");
  if (!button || !lastGenerated) return;
  const section = lastGenerated.sections[Number(button.dataset.copyIndex)];
  const textArea = resultGrid.querySelector(`[data-result-index="${button.dataset.copyIndex}"]`);
  await copyText(textArea ? textArea.value : section.body);
  showToast("已复制");
});

historyList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-history-index]");
  if (!item) return;
  const history = readHistory();
  const payload = history[Number(item.dataset.historyIndex)];
  lastGenerated = payload;
  profileInput.value = payload.profile || "";
  ideaInput.value = payload.idea;
  activeTask = payload.task;
  taskCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.task === activeTask);
  });
  renderResults(payload);
});

sampleButton.addEventListener("click", () => {
  const currentIndex = samples.indexOf(ideaInput.value.trim());
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % samples.length : 0;
  ideaInput.value = samples[nextIndex];
  generateContent();
});

copyAllButton.addEventListener("click", async () => {
  const text = getCurrentResultText();
  await copyText(text);
  showToast("整篇已复制");
});

softenButton.addEventListener("click", () => {
  rewriteCurrentResult("soften");
  showToast("已改得更自然");
});

shortenButton.addEventListener("click", () => {
  rewriteCurrentResult("shorten");
  showToast("已缩短");
});

copyPromptButton.addEventListener("click", async () => {
  await copyText(promptPreview.value);
  showToast("Prompt JSON 已复制");
});

copyAiResponseButton.addEventListener("click", async () => {
  await copyText(aiResponsePreview.value);
  showToast("AI JSON 已复制");
});

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  renderHistory();
  showToast("历史已清空");
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files && imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    previewImage.src = reader.result;
    previewImage.style.display = "block";
    updateGenerationPreviews();
  };
  reader.readAsDataURL(file);
});

renderHistory();
renderTestCaseOptions();
renderScoreHistory();
updateScoreSummary();
generateContent({ save: false });
updatePromptPreview();

function renderTestCaseOptions() {
  testCaseSelect.innerHTML = testCases
    .map((item, index) => {
      return `<option value="${index}">${item.id}. ${item.user} · ${taskNames[item.task]}</option>`;
    })
    .join("");
}

function buildPromptPayload() {
  const platform = getCheckedValue("platform");
  const tone = getCheckedValue("tone");
  const profile = profileInput.value.trim();
  const idea = ideaInput.value.trim();
  return {
    role: "你是图小二，一个面向小红书、抖音轻量创作者的 AI 内容助手。",
    goal: "把用户的照片、商品或生活想法整理成自然、可发布、可轻度修改的内容。",
    input: {
      profile,
      platform,
      task: taskNames[activeTask],
      tone,
      idea,
      material: {
        type: previewImage.style.display === "block" ? "image_uploaded" : "text_only",
        description: "如有图片，请结合图片主体、使用场景、商品细节和用户想法生成内容。"
      }
    },
    rules: [
      "不要像硬广。",
      "不要制造焦虑，不承诺涨粉、成交或效果。",
      "语言自然，适合普通创作者发布。",
      "内容要结合账号定位和用户想法。",
      "返回严格 JSON，不要输出 JSON 以外的解释。"
    ],
    outputSchema: {
      titles: ["标题 1", "标题 2", "标题 3"],
      coverText: "封面短句",
      body: "正文内容",
      tags: ["标签1", "标签2"],
      script: {
        hook: "开场钩子",
        voiceover: "口播内容",
        shots: ["镜头提示1", "镜头提示2"],
        ending: "结尾互动"
      },
      publishAdvice: "发布建议"
    }
  };
}

function updatePromptPreview() {
  promptPreview.value = JSON.stringify(buildPromptPayload(), null, 2);
}

function updateAIResponsePreview(response = null) {
  const nextResponse = response || simulateAIResponse(buildPromptPayload());
  aiResponsePreview.value = JSON.stringify(nextResponse, null, 2);
}

function updateGenerationPreviews() {
  updatePromptPreview();
  updateAIResponsePreview();
}

function getCurrentResultText() {
  return Array.from(resultGrid.querySelectorAll(".result-card"))
    .map((card) => {
      const title = card.querySelector("h3").textContent;
      const text = card.querySelector(".result-text").value;
      return `【${title}】\n${text}`;
    })
    .join("\n\n");
}

function rewriteCurrentResult(mode) {
  const textAreas = resultGrid.querySelectorAll(".result-text");
  textAreas.forEach((item) => {
    if (mode === "shorten") {
      item.value = item.value
        .split("\n")
        .map((line) => line.replace(/，.*?。/g, "。"))
        .join("\n")
        .replace(/不用等准备得特别完美。/g, "先发一版，再慢慢优化。");
      return;
    }

    item.value = item.value
      .replace(/很适合/g, "还挺适合")
      .replace(/值得分享/g, "想分享出来")
      .replace(/建议/g, "小建议")
      .replace(/内容/g, "这条内容");
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  document.body.removeChild(helper);
}
