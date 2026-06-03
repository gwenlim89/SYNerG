const INSTRUCTION_MS = 0;
const COUNTDOWN_STEP_MS = 1000;
const MEMORIZE_MS = 5000;
const RESULT_LED_DELAY_MS = 430;
const SAME_TAG_COOLDOWN_MS = 1200;
const TUTORIAL_COOLDOWN_MS = 1200;
const MEMORY_LENGTHS = [3, 3, 4, 5, 5, 6];
const SORTING_ROUNDS = 6;
const TOTAL_ROUNDS = MEMORY_LENGTHS.length + SORTING_ROUNDS;

const COLORS = ["YELLOW", "PURPLE", "BLUE", "RED", "GREEN"];
const SHAPES = ["SQUARE", "TRIANGLE", "PENTAGON", "HEXAGON", "OVAL"];
const TAGS = {
  "53:79:79:74:95:00:01": { name: "Blue triangle 1", color: "BLUE", shape: "TRIANGLE" },
  "53:4B:8C:74:95:00:01": { name: "Blue triangle 2", color: "BLUE", shape: "TRIANGLE" },
  "53:A6:80:74:95:00:01": { name: "Blue triangle 3", color: "BLUE", shape: "TRIANGLE" },
  "53:F2:7D:74:95:00:01": { name: "Yellow square 1", color: "YELLOW", shape: "SQUARE" },
  "53:23:96:74:95:00:01": { name: "Yellow square 2", color: "YELLOW", shape: "SQUARE" },
  "53:87:6F:74:95:00:01": { name: "Yellow square 3", color: "YELLOW", shape: "SQUARE" },
  "53:DB:35:74:95:00:01": { name: "Green oval 1", color: "GREEN", shape: "OVAL" },
  "53:0C:3D:74:95:00:01": { name: "Green oval 2", color: "GREEN", shape: "OVAL" },
  "53:92:38:74:95:00:01": { name: "Green oval 3", color: "GREEN", shape: "OVAL" },
  "53:59:68:74:95:00:01": { name: "Red hexagon 1", color: "RED", shape: "HEXAGON" },
  "53:67:55:74:95:00:01": { name: "Red hexagon 2", color: "RED", shape: "HEXAGON" },
  "53:A1:5C:74:95:00:01": { name: "Red hexagon 3", color: "RED", shape: "HEXAGON" },
  "53:49:44:74:95:00:01": { name: "Purple pentagon 1", color: "PURPLE", shape: "PENTAGON" },
  "53:4E:9D:74:95:00:01": { name: "Purple pentagon 2", color: "PURPLE", shape: "PENTAGON" },
  "53:78:4B:74:95:00:01": { name: "Purple pentagon 3", color: "PURPLE", shape: "PENTAGON" }
};

const elements = {
  sky: document.querySelector("#sky"),
  gameScreen: document.querySelector("#game-screen"),
  hudProgress: document.querySelector("#hud-progress"),
  hudPercent: document.querySelector("#hud-percent"),
  languageToggle: document.querySelector("#language-toggle"),
  settingsButton: document.querySelector("#settings-button"),
  settingsPanel: document.querySelector("#settings-panel"),
  closeSettingsButton: document.querySelector("#close-settings-button"),
  portSelect: document.querySelector("#port-select"),
  refreshButton: document.querySelector("#refresh-button"),
  connectButton: document.querySelector("#connect-button"),
  connectionStatus: document.querySelector("#connection-status"),
  debugToggle: document.querySelector("#debug-toggle"),
  clearLogButton: document.querySelector("#clear-log-button"),
  logList: document.querySelector("#log-list"),
  haloLeft: document.querySelector("#halo-left"),
  haloRight: document.querySelector("#halo-right")
};

const state = {
  connected: false,
  language: "en",
  phase: "HOME",
  roundIndex: -1,
  memoryRoundIndex: -1,
  sortingRoundIndex: -1,
  currentRound: null,
  roundStartTime: null,
  scanEnabled: false,
  records: [],
  scans: [],
  recentScans: {
    LEFT: { uid: null, timestamp: 0 },
    RIGHT: { uid: null, timestamp: 0 }
  },
  tutorialFedLeft: false,
  tutorialFedRight: false,
  tutorialLastFeedLeft: 0,
  tutorialLastFeedRight: 0,
  lastRoundSeconds: null,
  sortingAttributePairs: [],
  countdownTimer: null,
  memoryTimer: null,
  transitionTimer: null
};

const TEXT = {
  en: {
    gameTitle: "Kitten<br />Nibbles",
    start: "Start",
    pressStart: "Press start to play",
    tutorial: "Tutorial",
    hungry: "The cats are hungry.",
    tutorialLine1: "Put a token into a hole to feed the cat.",
    tutorialLine2: "The cat is fed only when the light flashes blue.",
    leftHole: "Left Hole",
    rightHole: "Right Hole",
    tryLeft: "Try left",
    tryRight: "Try right",
    fed: "Fed",
    tutorialHint: "Try feeding both cats. Blue light means the cat ate it.",
    tutorialGreat: "Great. Blue light means the cat ate it.",
    tutorialOtherHole: "Good. Try the other hole too.",
    ok: "OK",
    game1: "Game 1",
    game2: "Game 2",
    game1Title: "Feed the cat<br />in the correct order.",
    game1Point1: "Watch which hole lights up.",
    game1Point2: "Feed the cat using that hole only.",
    game2Title: "Feed the 2 cats<br />the correct colour or shape.",
    rememberSequence: "Remember this sequence",
    rememberHint: "Watch the order before feeding the cat",
    feedCat: "Feed the cat!",
    inputHint: "Wait for the blue light after each token",
    roundCompleted: "Round completed",
    perfectOrder: "Perfect order!",
    goodTry: "Good try!",
    levelUp: "Level up!!",
    sortingShape: "Feed each cat the correct shape",
    sortingColor: "Feed each cat the correct colour",
    sortingHint: "Use the matching hole for each cat",
    itemsScanned: "Items scanned",
    bothFed: "Both cats are fed!",
    greatJob: "Great job",
    score: "Score",
    accuracy: "Accuracy",
    activeTime: "Active time",
    home: "Home"
  },
  zh: {
    gameTitle: "小猫<br />吃吃",
    start: "开始",
    pressStart: "按开始进入游戏",
    tutorial: "教程",
    hungry: "小猫饿了。",
    tutorialLine1: "把代币放进洞里喂小猫。",
    tutorialLine2: "只有灯闪蓝色时，小猫才吃到了。",
    leftHole: "左洞",
    rightHole: "右洞",
    tryLeft: "试试左边",
    tryRight: "试试右边",
    fed: "已喂",
    tutorialHint: "试着喂两只小猫。蓝灯亮起表示小猫吃到了。",
    tutorialGreat: "很好！蓝灯表示小猫吃到了。",
    tutorialOtherHole: "很好。再试试另一个洞。",
    ok: "好的",
    game1: "游戏一",
    game2: "游戏二",
    game1Title: "按正确顺序<br />喂小猫。",
    game1Point1: "看清楚哪个洞亮灯。",
    game1Point2: "只用亮灯的洞喂小猫。",
    game2Title: "喂两只小猫<br />正确的颜色或形状。",
    rememberSequence: "记住这个顺序",
    rememberHint: "先看顺序，再喂小猫",
    feedCat: "喂小猫！",
    inputHint: "每放一个代币后，等蓝灯亮起",
    roundCompleted: "本轮完成",
    perfectOrder: "顺序全对！",
    goodTry: "做得不错！",
    levelUp: "升级啦！！",
    sortingShape: "给每只小猫喂正确的形状",
    sortingColor: "给每只小猫喂正确的颜色",
    sortingHint: "把代币放进对应的洞",
    itemsScanned: "已扫描",
    bothFed: "两只小猫都吃到了！",
    greatJob: "太棒了",
    score: "分数",
    accuracy: "正确率",
    activeTime: "游戏时间",
    home: "首页"
  }
};

elements.settingsButton.addEventListener("click", () => {
  elements.settingsPanel.hidden = false;
});
elements.languageToggle.addEventListener("click", toggleLanguage);
elements.closeSettingsButton.addEventListener("click", () => {
  elements.settingsPanel.hidden = true;
});
elements.refreshButton.addEventListener("click", refreshPorts);
elements.connectButton.addEventListener("click", connectMcu);
elements.clearLogButton.addEventListener("click", () => {
  elements.logList.innerHTML = "";
});

window.orderStackApi.onLine((line) => {
  addLog(line);
  handleSerialLine(line);
});
window.orderStackApi.onError((message) => {
  addLog(`ERROR: ${message}`);
  setConnected(false);
});
window.orderStackApi.onClosed(() => {
  addLog("Serial port disconnected.");
  setConnected(false);
});

refreshPorts();
renderHome();

function t(key) {
  return TEXT[state.language][key] || TEXT.en[key] || key;
}

function toggleLanguage() {
  if (state.phase !== "HOME") {
    return;
  }

  state.language = state.language === "en" ? "zh" : "en";
  renderHome();
}

function updateLanguageToggle() {
  elements.languageToggle.textContent = state.language === "en" ? "EN" : "中文";
  elements.languageToggle.hidden = state.phase !== "HOME";
}

async function refreshPorts() {
  const ports = await window.orderStackApi.listPorts();
  elements.portSelect.innerHTML = "";

  for (const port of ports) {
    const option = document.createElement("option");
    option.value = port.path;
    option.textContent = port.friendlyName;
    elements.portSelect.appendChild(option);
  }
}

async function connectMcu() {
  if (!elements.portSelect.value) {
    addLog("Choose a serial port first.");
    return;
  }

  try {
    await window.orderStackApi.connect(elements.portSelect.value);
    setConnected(true);
    await setScanMode("OFF");
    await sendLedCommand("LED:OFF");
    renderHome();
  } catch (error) {
    addLog(`CONNECT ERROR: ${error.message}`);
    setConnected(false);
  }
}

function setConnected(connected) {
  state.connected = connected;
  elements.connectionStatus.textContent = connected ? "Device: Connected" : "Device: Not connected";
  elements.connectButton.textContent = connected ? "Connected" : "Connect MCU";
}

function handleSerialLine(line) {
  if (line.startsWith("REMOVED|")) {
    handleRemovedLine(line);
    return;
  }

  if (!line.startsWith("SCAN|") || !state.scanEnabled) {
    return;
  }

  const fields = parseFields(line);

  if (state.phase === "TUTORIAL") {
    handleTutorialScan(fields.HOLE, fields.UID);
    return;
  }

  receiveScan(fields.HOLE, fields.UID);
}

function parseFields(line) {
  return line.split("|").slice(1).reduce((fields, part) => {
    const separator = part.indexOf(":");

    if (separator !== -1) {
      fields[part.slice(0, separator)] = part.slice(separator + 1).toUpperCase();
    }

    return fields;
  }, {});
}

function handleRemovedLine(line) {
  const fields = parseFields(line);
  const hole = fields.HOLE;

  if (hole && state.recentScans[hole]) {
    state.recentScans[hole] = { uid: null, timestamp: 0 };
  }

  if (
    state.currentRound?.mode === "MEMORY" &&
    state.phase === "MEMORY_INPUT" &&
    hole === state.currentRound.hole
  ) {
    state.currentRound.lastAcceptedUid = null;
  }
}

async function startTutorialSession() {
  if (!state.connected) {
    elements.settingsPanel.hidden = false;
    addLog("Connect the MCU before starting.");
    return;
  }

  resetSessionState();
  renderTutorial();
  await sendLedCommand("LED:OFF");
  await setScanMode("BOTH");
}

function resetSessionState() {
  clearTimers();
  state.roundIndex = -1;
  state.memoryRoundIndex = -1;
  state.sortingRoundIndex = -1;
  state.currentRound = null;
  state.roundStartTime = null;
  state.records = [];
  state.scans = [];
  state.tutorialFedLeft = false;
  state.tutorialFedRight = false;
  state.tutorialLastFeedLeft = 0;
  state.tutorialLastFeedRight = 0;
  state.lastRoundSeconds = null;
  state.sortingAttributePairs = createSortingAttributePairs();
  resetRecentScans();
}

async function finishTutorial() {
  await setScanMode("OFF");
  await sendLedCommand("LED:OFF");
  beginNextRound();
}

async function goHome() {
  clearTimers();
  await setScanMode("OFF");
  await sendLedCommand("LED:OFF");
  resetSessionState();
  renderHome();
}

async function beginNextRound() {
  clearTimers();
  await setScanMode("OFF");
  await sendLedCommand("LED:OFF");
  resetRecentScans();
  state.roundIndex += 1;

  if (state.roundIndex >= TOTAL_ROUNDS) {
    renderFinalScreen();
    return;
  }

  const mode = state.roundIndex < MEMORY_LENGTHS.length ? "MEMORY" : "SORTING";
  state.currentRound = mode === "MEMORY" ? createMemoryRound() : createSortingRound();

  if (state.roundIndex === 0 || state.roundIndex === MEMORY_LENGTHS.length) {
    renderGameInstruction(mode);
    return;
  }

  beginCountdown();
}

function createMemoryRound() {
  state.memoryRoundIndex += 1;
  const attribute = randomChoice(["color", "shape"]);
  const values = attribute === "color" ? COLORS : SHAPES;

  return {
    mode: "MEMORY",
    attribute,
    hole: randomChoice(["LEFT", "RIGHT"]),
    expected: Array.from({ length: MEMORY_LENGTHS[state.memoryRoundIndex] }, () => randomChoice(values)),
    actual: [],
    lastAcceptedUid: null
  };
}

function createSortingRound() {
  state.sortingRoundIndex += 1;
  const attribute = state.sortingAttributePairs[Math.floor(state.sortingRoundIndex / 2)];
  const values = shuffle(attribute === "color" ? COLORS : SHAPES);

  return {
    mode: "SORTING",
    attribute,
    holes: {
      LEFT: { expected: values[0], target: randomInteger(1, 4), count: 0 },
      RIGHT: { expected: values[1], target: randomInteger(1, 4), count: 0 }
    }
  };
}

function createSortingAttributePairs() {
  const first = randomChoice(["color", "shape"]);
  const second = first === "color" ? "shape" : "color";

  return [first, second, first];
}

function beginCountdown() {
  clearTimers();
  state.phase = "COUNTDOWN";
  setScene("countdown");
  setHudProgress(progressForCurrentRound());
  let count = 3;
  renderCountdown(count);

  state.countdownTimer = window.setInterval(() => {
    count -= 1;

    if (count === 0) {
      clearCountdown();
      setScene("play");
      startPlayableRound();
      return;
    }

    renderCountdown(count);
  }, COUNTDOWN_STEP_MS);
}

async function startPlayableRound() {
  if (state.currentRound.mode === "MEMORY") {
    state.phase = "MEMORIZE";
    await sendLedCommand(`LED:MEMORY:${state.currentRound.hole}`);
    let secondsRemaining = MEMORIZE_MS / 1000;
    renderMemory(secondsRemaining);

    state.memoryTimer = window.setInterval(() => {
      secondsRemaining -= 1;

      if (secondsRemaining === 0) {
        clearMemoryTimer();
        startMemoryInput();
        return;
      }

      renderMemory(secondsRemaining);
    }, 1000);
  } else {
    state.phase = "SORTING";
    await sendSortingLedCommand();
    renderSorting();
    await startActiveTimerAndScanning();
  }
}

function startMemoryInput() {
  state.phase = "MEMORY_INPUT";
  renderMemory();
  startActiveTimerAndScanning();
}

async function startActiveTimerAndScanning() {
  state.roundStartTime = performance.now();
  const scanMode = state.currentRound.mode === "MEMORY"
    ? state.currentRound.hole
    : "BOTH";
  await setScanMode(scanMode);
}

async function setScanMode(mode) {
  state.scanEnabled = mode !== "OFF";

  if (!state.connected) {
    return;
  }

  try {
    await window.orderStackApi.write(`SCAN:${mode}\n`);
  } catch (error) {
    addLog(`SERIAL WRITE ERROR: ${error.message}`);
  }
}

async function sendLedCommand(command) {
  if (!state.connected) {
    return;
  }

  try {
    await window.orderStackApi.write(`${command}\n`);
  } catch (error) {
    addLog(`LED WRITE ERROR: ${error.message}`);
  }
}

async function sendSortingLedCommand() {
  const round = state.currentRound;
  const leftLedColor = round.attribute === "color" ? round.holes.LEFT.expected : "WHITE";
  const rightLedColor = round.attribute === "color" ? round.holes.RIGHT.expected : "WHITE";

  await sendLedCommand(`LED:SORT:LEFT:${leftLedColor}:RIGHT:${rightLedColor}`);
}

function resetRecentScans() {
  state.recentScans.LEFT = { uid: null, timestamp: 0 };
  state.recentScans.RIGHT = { uid: null, timestamp: 0 };
}

function isSameTagCoolingDown(hole, uid, timestamp) {
  const recent = state.recentScans[hole];

  return Boolean(
    recent &&
    recent.uid === uid &&
    timestamp - recent.timestamp < SAME_TAG_COOLDOWN_MS
  );
}

function rememberRecentScan(hole, uid, timestamp) {
  if (!state.recentScans[hole]) {
    return;
  }

  state.recentScans[hole] = { uid, timestamp };
}

function handleTutorialScan(hole, uid) {
  const tag = TAGS[uid] || null;
  const timestamp = performance.now();

  if (!tag || !["LEFT", "RIGHT"].includes(hole)) {
    addLog(`IGNORED TUTORIAL TAG: ${hole || "UNKNOWN"} ${uid || "NO UID"}`);
    return;
  }

  const lastFeed = hole === "LEFT" ? state.tutorialLastFeedLeft : state.tutorialLastFeedRight;

  if (timestamp - lastFeed < TUTORIAL_COOLDOWN_MS || isSameTagCoolingDown(hole, uid, timestamp)) {
    addLog(`IGNORED TUTORIAL COOLDOWN: ${hole} ${uid}`);
    return;
  }

  rememberRecentScan(hole, uid, timestamp);
  triggerScreenHalo(hole);
  sendLedCommand(`LED:SCAN:${hole}`);

  if (hole === "LEFT") {
    state.tutorialFedLeft = true;
    state.tutorialLastFeedLeft = timestamp;
    document.querySelector("#tutorial-left-status").textContent = t("fed");
    animateCat("tutorial-left-cat", tag.shape);
    flashTutorialLight("tutorial-left-card");
  } else {
    state.tutorialFedRight = true;
    state.tutorialLastFeedRight = timestamp;
    document.querySelector("#tutorial-right-status").textContent = t("fed");
    animateCat("tutorial-right-cat", tag.shape);
    flashTutorialLight("tutorial-right-card");
  }

  const hint = document.querySelector("#tutorial-hint");

  if (state.tutorialFedLeft && state.tutorialFedRight) {
    hint.textContent = t("tutorialGreat");
    const okButton = document.querySelector("#tutorial-ok-button");
    okButton.disabled = false;
    okButton.classList.remove("is-hidden");
    setHudProgress(18);
  } else {
    hint.textContent = t("tutorialOtherHole");
    setHudProgress(12);
  }
}

function receiveScan(hole, uid) {
  const tag = TAGS[uid] || null;
  const round = state.currentRound;
  const timestamp = performance.now();
  let correct = false;
  let expected;
  let actual = "UNKNOWN";
  let roundComplete = false;

  if (!round || !["LEFT", "RIGHT"].includes(hole)) {
    return;
  }

  if (isSameTagCoolingDown(hole, uid, timestamp)) {
    addLog(`IGNORED COOLDOWN TAG: ${hole} ${uid}`);
    return;
  }

  if (round.mode === "MEMORY") {
    if (hole !== round.hole) {
      addLog(`IGNORED WRONG HOLE DURING MEMORY: ${hole}`);
      return;
    }

    if (uid === round.lastAcceptedUid) {
      addLog(`IGNORED DUPLICATE MEMORY TAG: ${uid}`);
      return;
    }

    const position = round.actual.length;

    if (position >= round.expected.length) {
      return;
    }

    expected = round.expected[position];
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = actual === expected;
    round.lastAcceptedUid = uid;
    round.actual.push({ hole, value: actual, tag, correct });
    renderMemory();
    animateCat("memory-cat", tag?.shape || "SQUARE");
    roundComplete = round.actual.length >= round.expected.length;
  } else {
    const holeState = round.holes[hole];

    if (!holeState || holeState.count >= holeState.target) {
      return;
    }

    expected = holeState.expected;
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = actual === expected;
    holeState.count += 1;
    renderSorting();
    animateCat(hole === "LEFT" ? "left-cat" : "right-cat", tag?.shape || "SQUARE");
    roundComplete = Object.values(round.holes).every((item) => item.count >= item.target);
  }

  rememberRecentScan(hole, uid, timestamp);
  triggerScreenHalo(hole);
  sendLedCommand(`LED:SCAN:${hole}`);

  state.scans.push({
    round: state.roundIndex + 1,
    mode: round.mode,
    timestamp,
    hole,
    uid,
    expected,
    actual,
    correct
  });

  if (roundComplete) {
    completeRound(timestamp);
  }
}

async function completeRound(timestamp) {
  if (!state.scanEnabled) {
    return;
  }

  await setScanMode("OFF");
  const seconds = (timestamp - state.roundStartTime) / 1000;
  const roundNumber = state.roundIndex + 1;
  const roundScans = state.scans.filter((scan) => scan.round === roundNumber);
  const perfectRound = roundScans.length > 0 && roundScans.every((scan) => scan.correct);

  state.lastRoundSeconds = seconds;
  state.records.push({
    round: roundNumber,
    mode: state.currentRound.mode,
    attribute: state.currentRound.attribute,
    seconds,
    correct: roundScans.filter((scan) => scan.correct).length,
    total: roundScans.length
  });

  await delay(RESULT_LED_DELAY_MS);
  await sendLedCommand(perfectRound ? "LED:SUCCESS" : "LED:ERROR");

  if (state.currentRound.mode === "MEMORY") {
    state.phase = "MEMORY_COMPLETE";
    renderMemoryComplete(perfectRound);
    state.transitionTimer = window.setTimeout(renderLevelUp, 1600);
    return;
  }

  state.phase = "SORTING_COMPLETE";
  renderSortingComplete();
}

function renderHome() {
  state.phase = "HOME";
  clearTimers();
  setScene("home");
  setHudProgress(0);
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="home-screen">
      <div class="shape-forest" aria-hidden="true">
        ${shapeTree("TRIANGLE", "tree-one")}
        ${shapeTree("SQUARE", "tree-two")}
        ${shapeTree("OVAL", "tree-three")}
        ${shapeTree("HEXAGON", "tree-four")}
        ${shapeTree("PENTAGON", "tree-five")}
      </div>
      <div class="home-hero">
        <h1 class="title">${t("gameTitle")}</h1>
        <div class="hero-cat-wrap">
          ${cat("hero-cat", "hero-cat")}
          <button id="start-cat-button" class="cat-start-button" type="button">${t("start")}</button>
        </div>
        <p class="press-start">${t("pressStart")}</p>
      </div>
    </section>
  `;
  document.querySelector("#start-cat-button").addEventListener("click", startTutorialSession);
}

function renderTutorial() {
  state.phase = "TUTORIAL";
  setScene("play");
  setHudProgress(8);
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="tutorial-screen">
      <div class="tutorial-copy panel">
        <p class="instruction-kicker">${t("tutorial")}</p>
        <h2>${t("hungry")}</h2>
        <p>${t("tutorialLine1")}</p>
        <p>${t("tutorialLine2")}</p>
      </div>
      <div class="tutorial-cats">
        <section id="tutorial-left-card" class="tutorial-cat-card panel">
          <p class="hole-title">${t("leftHole")}</p>
          <div class="tutorial-light" aria-hidden="true"></div>
          <div class="tutorial-cat-wrap">
            ${cat("tutorial-cat pink-cat", "tutorial-left-cat")}
          </div>
          <strong id="tutorial-left-status" class="tutorial-status">${t("tryLeft")}</strong>
        </section>
        <section id="tutorial-right-card" class="tutorial-cat-card panel">
          <p class="hole-title">${t("rightHole")}</p>
          <div class="tutorial-light" aria-hidden="true"></div>
          <div class="tutorial-cat-wrap">
            ${cat("tutorial-cat blue-cat", "tutorial-right-cat")}
          </div>
          <strong id="tutorial-right-status" class="tutorial-status">${t("tryRight")}</strong>
        </section>
      </div>
      <p id="tutorial-hint" class="key-hint">${t("tutorialHint")}</p>
      <button id="tutorial-ok-button" class="ok-button tutorial-ok is-hidden" type="button" disabled>${t("ok")}</button>
    </section>
  `;
  document.querySelector("#tutorial-ok-button").addEventListener("click", finishTutorial);
}

function renderGameInstruction(mode) {
  state.phase = "INSTRUCTION";
  setScene("dark");
  setHudProgress(progressForCurrentRound());
  updateLanguageToggle();

  if (mode === "MEMORY") {
    elements.gameScreen.innerHTML = `
      <section class="instruction-screen">
        <div class="shape-forest" aria-hidden="true">
          ${shapeTree("TRIANGLE", "tree-one")}
          ${shapeTree("SQUARE", "tree-two")}
          ${shapeTree("OVAL", "tree-three")}
          ${shapeTree("HEXAGON", "tree-four")}
          ${shapeTree("PENTAGON", "tree-five")}
        </div>
        <div class="instruction-cat-wrap">
          ${cat("hero-cat instruction-cat")}
        </div>
        <div class="instruction-copy game-one-copy">
          <p class="instruction-kicker">${t("game1")}</p>
          <h2>${t("game1Title")}</h2>
          <ul class="instruction-points">
            <li>${t("game1Point1")}</li>
            <li>${t("game1Point2")}</li>
          </ul>
          <button id="instruction-ok-button" class="ok-button" type="button">${t("ok")}</button>
        </div>
      </section>
    `;
  } else {
    elements.gameScreen.innerHTML = `
      <section class="instruction-screen">
        <div class="shape-forest" aria-hidden="true">
          ${shapeTree("TRIANGLE", "tree-one")}
          ${shapeTree("SQUARE", "tree-two")}
          ${shapeTree("OVAL", "tree-three")}
          ${shapeTree("HEXAGON", "tree-four")}
          ${shapeTree("PENTAGON", "tree-five")}
        </div>
        <div class="instruction-cat-wrap two-cat-instruction">
          ${cat("instruction-cat pink-cat")}
          ${cat("instruction-cat blue-cat second-cat")}
        </div>
        <div class="instruction-copy">
          <p class="instruction-kicker">${t("game2")}</p>
          <h2>${t("game2Title")}</h2>
          <button id="instruction-ok-button" class="ok-button" type="button">${t("ok")}</button>
        </div>
      </section>
    `;
  }

  document.querySelector("#instruction-ok-button").addEventListener("click", beginCountdown);

  if (INSTRUCTION_MS > 0) {
    state.transitionTimer = window.setTimeout(beginCountdown, INSTRUCTION_MS);
  }
}

function renderCountdown(count) {
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="countdown-screen">
      <strong>${count}</strong>
    </section>
  `;
}

function renderMemory(secondsRemaining = null) {
  const round = state.currentRound;
  const showingSequence = state.phase === "MEMORIZE";
  const heading = showingSequence ? t("rememberSequence") : t("feedCat");
  const hint = showingSequence ? t("rememberHint") : t("inputHint");
  const scannedValues = round.actual.map((item) => item.value);
  const boxes = round.expected.map((expected, index) => {
    const value = showingSequence ? expected : scannedValues[index];
    return renderTokenBox(value, round.attribute, Boolean(!showingSequence && value));
  }).join("");
  const focus = showingSequence
    ? `
      <div class="memory-timer" style="--timer-progress:${(secondsRemaining / (MEMORIZE_MS / 1000)) * 100}%">
        <span>${secondsRemaining}</span>
      </div>
    `
    : cat("memory-cat", "memory-cat");

  setHudProgress(progressForCurrentRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="memory-screen">
      <h2 class="screen-heading">${heading}</h2>
      <p class="key-hint">${hint}</p>
      <div class="memory-board">
        <div class="memory-focus-slot ${showingSequence ? "" : "cat-slot"}">
          ${focus}
        </div>
        <div class="memory-grid">
          ${boxes}
        </div>
      </div>
    </section>
  `;
}

function renderMemoryComplete(perfect) {
  const round = state.currentRound;
  const boxes = round.actual.map((item, index) => {
    const expected = round.expected[index];
    const correct = item.value === expected;
    return renderResultBox(item.value, round.attribute, correct);
  }).join("");

  setHudProgress(progressForCompletedRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="memory-screen round-complete-screen">
      <h2 class="screen-heading">${t("roundCompleted")}</h2>
      <p class="key-hint">${perfect ? t("perfectOrder") : t("goodTry")}</p>
      <div class="memory-board">
        <div class="memory-focus-slot cat-slot">
          ${cat(`memory-cat ${perfect ? "happy-cat" : ""}`, "memory-cat")}
        </div>
        <div class="memory-grid result-grid">
          ${boxes}
        </div>
      </div>
    </section>
  `;
}

function renderLevelUp() {
  state.phase = "LEVEL_UP";
  setHudProgress(progressForCompletedRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="level-up-screen">
      <h2 class="screen-heading">${t("levelUp")}</h2>
      <div class="level-cat-wrap">
        ${cat("level-cat happy-cat jump-cat")}
      </div>
      ${renderTiming()}
      <button id="level-ok-button" class="ok-button level-ok-button" type="button">${t("ok")}</button>
    </section>
  `;
  document.querySelector("#level-ok-button").addEventListener("click", beginNextRound);
}

function renderSorting() {
  const round = state.currentRound;
  const instruction = round.attribute === "shape"
    ? t("sortingShape")
    : t("sortingColor");

  setHudProgress(progressForCurrentRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="sorting-screen">
      <h2 class="screen-heading sorting-heading">${instruction}</h2>
      <p class="key-hint">${t("sortingHint")}</p>
      <div class="sorting-columns">
        ${renderSortingColumn("LEFT", round.holes.LEFT, round.attribute)}
        ${renderSortingColumn("RIGHT", round.holes.RIGHT, round.attribute)}
      </div>
    </section>
  `;
}

function renderSortingColumn(hole, holeState, attribute) {
  const catClass = hole === "LEFT" ? "pink-cat" : "blue-cat";
  const catId = hole === "LEFT" ? "left-cat" : "right-cat";

  return `
    <section class="sort-card panel">
      <p class="hole-title">${hole === "LEFT" ? t("leftHole") : t("rightHole")}</p>
      <div class="rule-row">
        ${renderRuleTile(holeState.expected, attribute)}
        <div class="count-panel">
          <span>${t("itemsScanned")}</span>
          <strong><span>${holeState.count}</span> / ${holeState.target}</strong>
        </div>
      </div>
      <div class="sort-monster-row">
        ${cat(`sort-cat ${catClass}`, catId)}
      </div>
    </section>
  `;
}

function renderSortingComplete() {
  setHudProgress(progressForCompletedRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="sorting-complete-screen">
      <h2 class="screen-heading sorting-heading">${t("roundCompleted")}</h2>
      <p class="key-hint">${t("bothFed")}</p>
      <div class="sorting-complete-cats">
        ${cat("complete-cat pink-cat happy-cat jump-cat")}
        ${cat("complete-cat blue-cat happy-cat jump-cat")}
      </div>
      ${renderTiming()}
      <button id="sorting-complete-ok" class="ok-button level-ok-button" type="button">${t("ok")}</button>
    </section>
  `;
  document.querySelector("#sorting-complete-ok").addEventListener("click", beginNextRound);
}

function renderFinalScreen() {
  state.phase = "FINAL";
  sendLedCommand("LED:RAINBOW");
  setScene("play");
  setHudProgress(100);
  updateLanguageToggle();
  const total = state.scans.length;
  const correct = state.scans.filter((scan) => scan.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const totalSeconds = state.records.reduce((sum, record) => sum + record.seconds, 0);
  const score = Math.round((accuracy / 100) * 800 + Math.min(200, 15000 / Math.max(totalSeconds, 1)));
  const rows = state.records.map((record) => `
    <tr>
      <td>${record.round}</td>
      <td>${record.mode === "MEMORY" ? "Memory" : "Sorting"}</td>
      <td>${record.correct} / ${record.total}</td>
      <td>${record.seconds.toFixed(1)}s</td>
    </tr>
  `).join("");

  elements.gameScreen.innerHTML = `
    <section class="final-screen">
      <div class="final-card panel">
        <h2>${t("greatJob")}</h2>
        <div class="score">
          <span>${t("score")}</span>
          <strong>${score}</strong>
        </div>
        <div class="summary-row">
          <div><span>${t("accuracy")}</span><strong>${accuracy}%</strong></div>
          <div><span>${t("activeTime")}</span><strong>${formatDuration(totalSeconds)}</strong></div>
        </div>
        <button id="home-button" class="ok-button home-button" type="button">${t("home")}</button>
        <details class="results-details">
          <summary>Staff results</summary>
          <table>
            <thead><tr><th>Round</th><th>Mode</th><th>Accuracy</th><th>Time</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </details>
      </div>
      ${cat("home-left")}
      ${cat("home-right small-cat")}
    </section>
  `;
  document.querySelector("#home-button").addEventListener("click", goHome);
}

function renderTokenBox(value, attribute, scanned = false) {
  if (!value) {
    return `<div class="token-box blank"></div>`;
  }

  return `
    <div class="token-box ${scanned ? "scanned" : ""}">
      ${tokenContent(value, attribute)}
    </div>
  `;
}

function renderResultBox(value, attribute, correct) {
  return `
    <div class="token-box result-box ${correct ? "correct" : "wrong"}">
      ${tokenContent(value, attribute)}
    </div>
  `;
}

function renderRuleTile(value, attribute) {
  return `
    <div class="rule-tile">
      ${tokenContent(value, attribute)}
    </div>
  `;
}

function tokenContent(value, attribute) {
  if (attribute === "color") {
    return `<span class="color-swatch" style="--tile-color:${colorValue(value)}"></span>`;
  }

  return shapeMarkup(value);
}

function renderTiming() {
  if (!elements.debugToggle.checked || !state.lastRoundSeconds) {
    return "";
  }

  return `<p class="debug-time">Round time: ${state.lastRoundSeconds.toFixed(1)} seconds</p>`;
}

function progressForCurrentRound() {
  const completed = Math.max(0, state.roundIndex);
  return Math.min(100, (completed / TOTAL_ROUNDS) * 100);
}

function progressForCompletedRound() {
  const completed = Math.min(TOTAL_ROUNDS, Math.max(0, state.roundIndex + 1));
  return Math.min(100, (completed / TOTAL_ROUNDS) * 100);
}

function setHudProgress(percent) {
  elements.hudProgress.style.setProperty("--progress", `${percent}%`);
  elements.hudPercent.textContent = `${Math.round(percent)}%`;
}

function setScene(scene) {
  elements.sky.classList.toggle("dark-scene", scene === "dark");
  elements.sky.classList.toggle("lighten-scene", scene === "lighten");
  elements.sky.classList.toggle("countdown-scene", scene === "countdown");
}

function clearTimers() {
  clearCountdown();
  clearMemoryTimer();
  clearTransitionTimer();
}

function clearCountdown() {
  if (!state.countdownTimer) {
    return;
  }

  window.clearInterval(state.countdownTimer);
  state.countdownTimer = null;
}

function clearMemoryTimer() {
  if (!state.memoryTimer) {
    return;
  }

  window.clearInterval(state.memoryTimer);
  state.memoryTimer = null;
}

function clearTransitionTimer() {
  if (!state.transitionTimer) {
    return;
  }

  window.clearTimeout(state.transitionTimer);
  state.transitionTimer = null;
}

function colorValue(color) {
  return {
    YELLOW: "#ffe600",
    PURPLE: "#be00ff",
    BLUE: "#005fff",
    TURQUOISE: "#00c8c8",
    RED: "#ff2d20",
    GREEN: "#00dc45"
  }[color] || "#ffffff";
}

function shapeMarkup(shape) {
  if (!shape) {
    return "";
  }

  return `<span class="shape ${shape.toLowerCase()}"></span>`;
}

function shapeTree(shape, extraClass = "") {
  return `
    <div class="shape-tree ${extraClass}">
      <span class="tree-canopy">
        <span class="shape-fruit ${shape.toLowerCase()} fruit-one"></span>
        <span class="shape-fruit ${shape.toLowerCase()} fruit-two"></span>
        <span class="shape-fruit ${shape.toLowerCase()} fruit-three"></span>
      </span>
      <span class="tree-trunk"></span>
    </div>
  `;
}

function cat(extraClass = "", id = "") {
  return `
    <svg ${id ? `id="${id}"` : ""} class="pixel-cat ${extraClass}" viewBox="0 0 220 260" role="img" aria-label="Pixel cat">
      <g class="snack-token">
        <path class="snack-piece snack-triangle" d="M111 -36 L132 -2 L90 -2 Z"></path>
        <rect class="snack-piece snack-square" x="93" y="-34" width="36" height="36"></rect>
        <ellipse class="snack-piece snack-oval" cx="111" cy="-16" rx="23" ry="16"></ellipse>
        <path class="snack-piece snack-hexagon" d="M98 -34 L124 -34 L138 -16 L124 2 L98 2 L84 -16 Z"></path>
        <path class="snack-piece snack-pentagon" d="M111 -38 L136 -20 L126 5 L96 5 L86 -20 Z"></path>
      </g>
      <g class="cat-shadow">
        <ellipse cx="108" cy="238" rx="78" ry="13"></ellipse>
      </g>
      <g class="cat-body">
        <path class="cat-tail" d="M164 154 C210 150 205 98 171 105 C154 109 159 132 176 126 C190 121 191 144 164 145"></path>
        <path class="cat-leg left-leg" d="M61 164 L44 221 L81 221 L87 167 Z"></path>
        <path class="cat-leg right-leg" d="M132 166 L141 221 L178 221 L158 164 Z"></path>
        <path class="cat-torso" d="M67 132 C47 159 48 211 74 227 L151 227 C178 209 178 160 154 132 Z"></path>
        <path class="cat-head" d="M43 91 L55 37 L91 65 C103 61 117 61 129 65 L166 37 L177 91 C187 129 159 162 110 162 C61 162 33 129 43 91 Z"></path>
        <path class="ear-inner left-ear" d="M62 66 L70 48 L83 70 Z"></path>
        <path class="ear-inner right-ear" d="M139 70 L152 48 L158 66 Z"></path>
        <rect class="eye left-eye" x="72" y="101" width="29" height="20" rx="3"></rect>
        <rect class="eye right-eye" x="121" y="101" width="29" height="20" rx="3"></rect>
        <rect class="pupil left-pupil" x="91" y="101" width="8" height="20"></rect>
        <rect class="pupil right-pupil" x="123" y="101" width="8" height="20"></rect>
        <rect class="nose" x="106" y="130" width="10" height="8"></rect>
        <rect class="mouth-fill" x="88" y="136" width="44" height="12"></rect>
        <path class="mouth" d="M91 138 L129 138"></path>
        <path class="happy-mouth" d="M88 136 C99 154 121 154 132 136"></path>
        <path class="whisker left-whisker top" d="M72 132 L37 122"></path>
        <path class="whisker left-whisker bottom" d="M72 143 L35 149"></path>
        <path class="whisker right-whisker top" d="M148 132 L184 122"></path>
        <path class="whisker right-whisker bottom" d="M148 143 L186 149"></path>
      </g>
    </svg>
  `;
}

function animateCat(id, shape = "SQUARE") {
  const catElement = document.querySelector(`#${id}`);

  if (!catElement) {
    return;
  }

  catElement.classList.remove("snack-triangle", "snack-square", "snack-oval", "snack-hexagon", "snack-pentagon");
  catElement.classList.remove("eating");
  void catElement.getBoundingClientRect();
  catElement.classList.add(`snack-${shape.toLowerCase()}`);
  catElement.classList.add("eating");

  window.setTimeout(() => {
    catElement.classList.remove("eating");
  }, 880);
}

function flashTutorialLight(cardId) {
  const card = document.querySelector(`#${cardId}`);

  if (!card) {
    return;
  }

  card.classList.remove("blue-flash");
  void card.getBoundingClientRect();
  card.classList.add("blue-flash");

  window.setTimeout(() => {
    card.classList.remove("blue-flash");
  }, 900);
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInteger(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function triggerScreenHalo(hole) {
  const el = hole === "LEFT" ? elements.haloLeft : elements.haloRight;
  el.classList.remove("active");
  void el.offsetWidth;
  el.classList.add("active");
}

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  elements.logList.prepend(item);

  while (elements.logList.children.length > 100) {
    elements.logList.lastElementChild.remove();
  }
}
