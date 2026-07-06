const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const pageTitle = document.querySelector("#pageTitle");
const pageEyebrow = document.querySelector("#pageEyebrow");
const tabButtons = document.querySelectorAll("[data-tab]");
const pages = document.querySelectorAll(".app-page");
const uploadInput = document.querySelector("#materialInput");
const uploadStatus = document.querySelector("#uploadStatus");
const resultList = document.querySelector("#resultList");
const summaryBar = document.querySelector("#summaryBar");
const saveButton = document.querySelector("#saveButton");
const savedList = document.querySelector("#savedList");
const toast = document.querySelector("#toast");
const userName = document.querySelector("#userName");
const userMeta = document.querySelector("#userMeta");

const loginKey = "tuxiaoer-login-v1";
const savedKey = "tuxiaoer-app-saved-v1";

const pageTitles = {
  home: ["首页", "先选账号"],
  material: ["素材", "上传素材"],
  content: ["内容", "生成内容包"],
  profile: ["我的", "我的账号"]
};

let currentResult = null;

function getCheckedValue(name) {
  const item = document.querySelector(`input[name="${name}"]:checked`);
  return item ? item.value : "";
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setLogin(user) {
  writeJson(loginKey, user);
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  userName.textContent = user.name;
  userMeta.textContent = user.meta;
  setTab("home");
  renderSaved();
}

function logout() {
  localStorage.removeItem(loginKey);
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
  showToast("已退出");
}

function setTab(tab) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === tab);
  });
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  pageEyebrow.textContent = pageTitles[tab][0];
  pageTitle.textContent = pageTitles[tab][1];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function collectState() {
  return {
    creatorType: getCheckedValue("creatorType"),
    platform: getCheckedValue("platform"),
    tone: getCheckedValue("tone"),
    accountNote: document.querySelector("#accountNote").value.trim(),
    materialType: getCheckedValue("materialType"),
    materialLanguage: getCheckedValue("materialLanguage"),
    imageCount: getCheckedValue("imageCount"),
    imageRoles: getCheckedValues("imageRole"),
    videoLength: getCheckedValue("videoLength"),
    materialNote: document.querySelector("#materialNote").value.trim(),
    uploadedCount: uploadInput.files ? uploadInput.files.length : 0,
    contentPack: getCheckedValue("contentPack"),
    versionCount: getCheckedValue("versionCount"),
    captionCount: getCheckedValue("captionCount"),
    revisionCount: getCheckedValue("revisionCount")
  };
}

function subjectFromState(state) {
  if (state.materialNote) return state.materialNote;
  if (state.accountNote) return state.accountNote;
  if (state.materialType.includes("图片")) return `${state.creatorType}的这组图片素材`;
  if (state.materialType.includes("视频")) return `${state.creatorType}的这段视频素材`;
  return `${state.creatorType}今天想发布的内容`;
}

function goalText(state) {
  if (state.contentPack.includes("门店")) return "自然引导附近用户到店咨询";
  if (state.contentPack.includes("朋友圈")) return "写得像自己发的，不像硬广告";
  if (state.contentPack.includes("口播")) return "拍成一条好开口的短视频";
  if (state.contentPack.includes("选题")) return "安排一周能持续发布的内容";
  if (state.contentPack.includes("商品")) return "把产品卖点讲得自然可信";
  return "整理成一篇能直接发布的图文";
}

function buildSections(state) {
  const subject = subjectFromState(state);
  const versionNumber = parseInt(state.versionCount, 10) || 2;
  const captionNumber = state.captionCount === "不需要" ? 0 : parseInt(state.captionCount, 10) || 3;
  const roles = state.imageRoles.length ? state.imageRoles : ["主图", "细节", "场景"];
  const titles = [
    `${state.creatorType}今天这组素材，可以这样发`,
    `不是硬推，是真实想分享的${state.contentPack.replace("包", "")}`,
    `${state.platform}新手也能照着发的一版内容`,
    `把${subject.slice(0, 18)}整理成能发布的内容`,
    `这条内容不用复杂，先讲清楚一个重点`
  ].slice(0, Math.max(2, versionNumber));

  const sections = [
    {
      title: "标题",
      body: titles.map((item, index) => `${index + 1}. ${item}`).join("\n")
    },
    {
      title: "正文",
      body: `这次内容适合按“真实场景 + 一个具体细节 + 一个轻引导”来写。\n\n账号：${state.creatorType}。平台：${state.platform}。风格：${state.tone}。素材语言：${state.materialLanguage}。\n\n可以先从${subject}切入，不要一上来就堆卖点。先说为什么想分享，再说用户最容易看懂的细节，最后给一个自然动作：收藏、评论、私信、到店或继续看下一条。\n\n这版的目标是：${goalText(state)}。`
    }
  ];

  if (captionNumber > 0) {
    sections.push({
      title: "图片配文",
      body: Array.from({ length: captionNumber }, (_, index) => {
        const role = roles[index % roles.length];
        return `${index + 1}. ${role}：这张图重点讲清楚一个细节，用一句人话说明为什么值得看。`;
      }).join("\n")
    });
  }

  if (state.contentPack.includes("口播") || state.videoLength !== "没有") {
    sections.push({
      title: "视频口播",
      body: `开头 3 秒：如果你也在纠结这类内容怎么发，可以先这样拍。\n\n口播：今天这条素材不用拍得很复杂，先给大家看真实场景，再讲一个最重要的细节，最后说清楚适合谁。\n\n镜头：1. 主体近景 2. 使用/场景画面 3. 细节特写 4. 结尾互动。\n\n长度建议：${state.videoLength === "没有" ? "30 秒" : state.videoLength}。`
    });
  }

  if (state.contentPack.includes("选题")) {
    sections.push({
      title: "一周选题",
      body: "周一：真实记录一条素材\n周二：细节拆解\n周三：使用场景\n周四：避坑或经验\n周五：轻种草\n周六：互动问答\n周日：复盘和下周预告"
    });
  }

  sections.push({
    title: "发布建议",
    body: `推荐配置：${state.versionCount}、${state.captionCount}图片配文、${state.revisionCount}修改。\n\n先发自然版，不要一次把卖点讲满。发布后看评论，把用户问得最多的问题做成下一条内容。`
  });

  return sections;
}

function renderSummary(state) {
  const items = [
    state.creatorType,
    state.platform,
    state.tone,
    state.materialType,
    `${state.materialLanguage}素材`,
    state.contentPack
  ];
  summaryBar.innerHTML = items.map((item) => `<span class="summary-chip">${item}</span>`).join("");
}

function renderResult(state) {
  const sections = buildSections(state);
  currentResult = {
    state,
    sections,
    createdAt: new Date().toLocaleString("zh-CN")
  };
  renderSummary(state);
  resultList.innerHTML = sections
    .map((section, index) => {
      return `<article class="content-card" data-card-index="${index}">
        <h3>${section.title}</h3>
        <textarea rows="6" data-result-text>${section.body}</textarea>
        <div class="quick-actions">
          <button type="button" data-polish="natural">更自然</button>
          <button type="button" data-polish="short">更短</button>
          <button type="button" data-polish="mine">更像我说话</button>
          <button type="button" data-polish="again">换一版</button>
        </div>
      </article>`;
    })
    .join("");
  showToast("内容包已生成");
}

function getCurrentSectionsFromDom() {
  return Array.from(resultList.querySelectorAll(".content-card")).map((card) => {
    return {
      title: card.querySelector("h3").textContent,
      body: card.querySelector("[data-result-text]").value
    };
  });
}

function resultText(mode = "all") {
  const sections = getCurrentSectionsFromDom();
  const filtered = sections.filter((item) => {
    if (mode === "title") return item.title.includes("标题");
    if (mode === "body") return item.title.includes("正文");
    return true;
  });
  return filtered.map((item) => `【${item.title}】\n${item.body}`).join("\n\n");
}

async function copyText(text) {
  if (!text.trim()) {
    showToast("先生成内容");
    return;
  }
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("已复制");
}

function polishText(text, mode) {
  if (mode === "short") {
    return text
      .split("\n")
      .filter(Boolean)
      .slice(0, 5)
      .map((line) => line.replace(/，.*?。/g, "。"))
      .join("\n");
  }
  if (mode === "mine") {
    return text
      .replace(/适合/g, "我觉得适合")
      .replace(/推荐配置/g, "我会先这样选")
      .replace(/用户/g, "大家")
      .replace(/发布后/g, "发出去以后");
  }
  if (mode === "again") {
    return `${text}\n\n换一版角度：先从一个真实使用场景说起，再补一个细节，最后轻轻引导互动。`;
  }
  return text
    .replace(/不要/g, "尽量别")
    .replace(/目标是/g, "可以先做到")
    .replace(/卖点/g, "重点")
    .replace(/自然动作/g, "顺手动作");
}

function readSaved() {
  return readJson(savedKey, []);
}

function writeSaved(items) {
  writeJson(savedKey, items.slice(0, 8));
  renderSaved();
}

function renderSaved() {
  const items = readSaved();
  if (!items.length) {
    savedList.innerHTML = `<div class="empty-state">保存后的内容会出现在这里。</div>`;
    return;
  }
  savedList.innerHTML = items
    .map((item, index) => {
      return `<button class="saved-item" type="button" data-saved-index="${index}">
        <strong>${item.state.contentPack}</strong>
        <span>${item.state.creatorType} · ${item.state.platform} · ${item.createdAt}</span>
      </button>`;
    })
    .join("");
}

document.querySelector("#wechatLoginButton").addEventListener("click", () => {
  setLogin({ name: "微信用户", meta: "微信已登录 · 免费体验版" });
});

document.querySelector("#sendCodeButton").addEventListener("click", () => {
  showToast("验证码已发送");
  document.querySelector("#codeInput").value = "123456";
});

document.querySelector("#phoneLoginButton").addEventListener("click", () => {
  const phone = document.querySelector("#phoneInput").value.trim();
  setLogin({ name: phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : "手机用户", meta: "手机号已登录 · 免费体验版" });
});

document.querySelector("#logoutButton").addEventListener("click", logout);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

document.querySelectorAll("[data-go-page]").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.goPage));
});

uploadInput.addEventListener("change", () => {
  const count = uploadInput.files ? uploadInput.files.length : 0;
  uploadStatus.textContent = count ? `已选择 ${count} 个素材` : "图片、视频都可以；没有素材也能继续。";
});

document.querySelector("#generateButton").addEventListener("click", () => {
  renderResult(collectState());
});

resultList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-polish]");
  if (!button) return;
  const area = button.closest(".content-card").querySelector("[data-result-text]");
  area.value = polishText(area.value, button.dataset.polish);
  showToast("已润色");
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(resultText(button.dataset.copy)));
});

saveButton.addEventListener("click", () => {
  if (!currentResult) {
    showToast("先生成内容");
    return;
  }
  currentResult.sections = getCurrentSectionsFromDom();
  writeSaved([currentResult, ...readSaved()]);
  showToast("已保存");
});

document.querySelector("#clearSavedButton").addEventListener("click", () => {
  localStorage.removeItem(savedKey);
  renderSaved();
  showToast("已清空");
});

savedList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-saved-index]");
  if (!item) return;
  const saved = readSaved()[Number(item.dataset.savedIndex)];
  currentResult = saved;
  renderSummary(saved.state);
  resultList.innerHTML = saved.sections
    .map((section, index) => {
      return `<article class="content-card" data-card-index="${index}">
        <h3>${section.title}</h3>
        <textarea rows="6" data-result-text>${section.body}</textarea>
        <div class="quick-actions">
          <button type="button" data-polish="natural">更自然</button>
          <button type="button" data-polish="short">更短</button>
          <button type="button" data-polish="mine">更像我说话</button>
          <button type="button" data-polish="again">换一版</button>
        </div>
      </article>`;
    })
    .join("");
  setTab("content");
});

const existingLogin = readJson(loginKey, null);
if (existingLogin) {
  setLogin(existingLogin);
} else {
  loginView.classList.remove("hidden");
  appView.classList.add("hidden");
}
renderSaved();
