const INSTRUCTION_MS = 0;
const COUNTDOWN_STEP_MS = 1000;
const MEMORIZE_MS = 5000;
const RESULT_LED_DELAY_MS = 430;
const SAME_TAG_COOLDOWN_MS = 1200;
const MEMORY_LENGTHS = [3, 3, 4, 5, 5, 6];
const SORTING_ROUNDS = 6;
const TOTAL_ROUNDS = MEMORY_LENGTHS.length + SORTING_ROUNDS;

const COLORS = ["RED", "BLUE", "YELLOW"];
const SHAPES = ["CIRCLE", "SQUARE", "STAR", "HEXAGON", "HEART", "TRIANGLE"];
const TAGS = {
  "53:9D:80:74:95:00:01": { name: "Blue circle 1",    color: "BLUE",   shape: "CIRCLE"   },
  "53:9D:9A:74:95:00:01": { name: "Blue circle 2",    color: "BLUE",   shape: "CIRCLE"   },
  "53:AE:D2:75:95:00:01": { name: "Blue circle 3",    color: "BLUE",   shape: "CIRCLE"   },
  "53:46:44:74:95:00:01": { name: "Blue square 1",    color: "BLUE",   shape: "SQUARE"   },
  "53:CD:87:74:95:00:01": { name: "Blue square 2",    color: "BLUE",   shape: "SQUARE"   },
  "53:56:68:74:95:00:01": { name: "Blue triangle 1",  color: "BLUE",   shape: "TRIANGLE" },
  "53:54:8C:74:95:00:01": { name: "Blue triangle 2",  color: "BLUE",   shape: "TRIANGLE" },
  "53:B5:52:74:95:00:01": { name: "Blue triangle 3",  color: "BLUE",   shape: "TRIANGLE" },
  "53:E4:59:74:95:00:01": { name: "Blue heart 1",     color: "BLUE",   shape: "HEART"    },
  "53:6C:A4:74:95:00:01": { name: "Blue heart 2",     color: "BLUE",   shape: "HEART"    },
  "53:64:55:74:95:00:01": { name: "Blue heart 3",     color: "BLUE",   shape: "HEART"    },
  "53:98:5C:74:95:00:01": { name: "Blue star 1",      color: "BLUE",   shape: "STAR"     },
  "53:D0:63:74:95:00:01": { name: "Blue star 2",      color: "BLUE",   shape: "STAR"     },
  "53:7F:4B:74:95:00:01": { name: "Blue hexagon 1",   color: "BLUE",   shape: "HEXAGON"  },
  "53:5A:31:74:95:00:01": { name: "Yellow circle 1",  color: "YELLOW", shape: "CIRCLE"   },
  "53:BF:76:74:95:00:01": { name: "Yellow circle 2",  color: "YELLOW", shape: "CIRCLE"   },
  "53:F7:46:74:95:00:01": { name: "Yellow square 1",  color: "YELLOW", shape: "SQUARE"   },
  "53:8D:6F:74:95:00:01": { name: "Yellow square 2",  color: "YELLOW", shape: "SQUARE"   },
  "53:80:AB:74:95:00:01": { name: "Yellow triangle 1",color: "YELLOW", shape: "TRIANGLE" },
  "53:72:79:74:95:00:01": { name: "Yellow triangle 2",color: "YELLOW", shape: "TRIANGLE" },
  "53:A8:80:74:95:00:01": { name: "Yellow heart 1",   color: "YELLOW", shape: "HEART"    },
  "53:C3:3F:74:95:00:01": { name: "Yellow heart 2",   color: "YELLOW", shape: "HEART"    },
  "53:89:38:74:95:00:01": { name: "Yellow star 1",    color: "YELLOW", shape: "STAR"     },
  "53:72:93:74:95:00:01": { name: "Yellow star 2",    color: "YELLOW", shape: "STAR"     },
  "53:DA:35:74:95:00:01": { name: "Yellow hexagon 1", color: "YELLOW", shape: "HEXAGON"  },
  "53:B4:52:74:95:00:01": { name: "Red circle 1",     color: "RED",    shape: "CIRCLE"   },
  "53:C0:A1:74:95:00:01": { name: "Red circle 2",     color: "RED",    shape: "CIRCLE"   },
  "53:9A:B2:74:95:00:01": { name: "Red square 1",     color: "RED",    shape: "SQUARE"   },
  "53:D1:87:74:95:00:01": { name: "Red square 2",     color: "RED",    shape: "SQUARE"   },
  "53:E5:59:74:95:00:01": { name: "Red triangle 1",   color: "RED",    shape: "TRIANGLE" },
  "53:F3:8E:74:95:00:01": { name: "Red triangle 2",   color: "RED",    shape: "TRIANGLE" },
  "53:C3:76:74:95:00:01": { name: "Red heart 1",      color: "RED",    shape: "HEART"    },
  "53:A3:9A:74:95:00:01": { name: "Red heart 2",      color: "RED",    shape: "HEART"    },
  "53:F4:7D:74:95:00:01": { name: "Red star 1",       color: "RED",    shape: "STAR"     },
  "53:D4:63:74:95:00:01": { name: "Red star 2",       color: "RED",    shape: "STAR"     },
  "53:08:6B:74:95:00:01": { name: "Red hexagon 1",    color: "RED",    shape: "HEXAGON"  },
  "53:86:AB:74:95:00:01": { name: "Red hexagon 2",    color: "RED",    shape: "HEXAGON"  }
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
  haloRight: document.querySelector("#halo-right"),
  regScanButton: document.querySelector("#reg-scan-button"),
  regLastUid: document.querySelector("#reg-last-uid"),
  regColorSelect: document.querySelector("#reg-color-select"),
  regShapeSelect: document.querySelector("#reg-shape-select"),
  regAssignButton: document.querySelector("#reg-assign-button"),
  regList: document.querySelector("#reg-list"),
  regCopyButton: document.querySelector("#reg-copy-button"),
  portSelectP2: document.querySelector("#port-select-p2"),
  connectButtonP2: document.querySelector("#connect-button-p2"),
  connectionStatusP2: document.querySelector("#connection-status-p2")
};

const state = {
  connected: false,
  connectedP2: false,
  language: "en",
  playerMode: "single",
  phase: "HOME",
  roundIndex: -1,
  memoryRoundIndex: -1,
  sortingRoundIndex: -1,
  currentRound: null,
  roundStartTime: null,
  participant: {
    id: "",
    name: ""
  },
  participant2: {
    name: ""
  },
  matchId: null,
  p1: null,
  p2: null,
  scanEnabled: false,
  records: [],
  scans: [],
  recentScans: {
    LEFT: { uid: null, timestamp: 0 },
    RIGHT: { uid: null, timestamp: 0 }
  },
  lastRoundSeconds: null,
  sortingAttributePairs: [],
  lastSortingRuleSnapshot: null,
  sessionSaved: false,
  sessionSaveResult: null,
  countdownTimer: null,
  memoryTimer: null,
  transitionTimer: null,
  regScanEnabled: false,
  regLastUid: null,
  registeredTags: {}
};

const TEXT = {
  en: {
    gameTitle: "Kitten<br />Nibbles",
    start: "Start",
    pressStart: "Press start to play",
    onePlayer: "1 Player",
    twoPlayers: "2 Players",
    playerMode: "Player mode",
    leftPlayer: "Left Player",
    rightPlayer: "Right Player",
    winner: "Winner",
    runnerUp: "Runner Up",
    youWin: "You win!!",
    betterLuck: "Better luck next time!",
    keepFeeding: "Keep feeding!",
    winnerRule: "Score uses accuracy first. Speed breaks a tie.",
    participantName: "Name",
    participantHint: "Enter participant name before starting.",
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
    home: "Home",
    databaseSaved: "Session saved",
    databaseSaving: "Saving session...",
    databaseError: "Database save failed",
    monitoringStatus: "Monitoring status",
    flagReason: "Flag reason"
  },
  zh: {
    gameTitle: "小猫<br />吃吃",
    start: "开始",
    pressStart: "按开始进入游戏",
    onePlayer: "单人",
    twoPlayers: "双人",
    playerMode: "玩家模式",
    leftPlayer: "左边玩家",
    rightPlayer: "右边玩家",
    winner: "胜利",
    runnerUp: "再接再厉",
    youWin: "你赢了！！",
    betterLuck: "下次加油！",
    keepFeeding: "继续喂！",
    winnerRule: "先看正确率；平手时看速度。",
    participantName: "姓名",
    participantHint: "请先输入参与者姓名。",
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
    home: "首页",
    databaseSaved: "记录已保存",
    databaseSaving: "正在保存记录...",
    databaseError: "数据库保存失败",
    monitoringStatus: "监测状态",
    flagReason: "标记原因"
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
elements.connectButtonP2.addEventListener("click", connectMcuP2);
elements.clearLogButton.addEventListener("click", () => {
  elements.logList.innerHTML = "";
});
elements.regScanButton.addEventListener("click", toggleRegScan);
elements.regAssignButton.addEventListener("click", registerToken);
elements.regCopyButton.addEventListener("click", copyTagsCode);

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
window.orderStackApi.onLineP2((line) => {
  addLog(`P2: ${line}`);
  handleSerialLineP2(line);
});
window.orderStackApi.onErrorP2((message) => {
  addLog(`P2 ERROR: ${message}`);
  setConnectedP2(false);
});
window.orderStackApi.onClosedP2(() => {
  addLog("P2 serial port disconnected.");
  setConnectedP2(false);
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

  cacheParticipantForm();
  state.language = state.language === "en" ? "zh" : "en";
  renderHome();
}

function updateLanguageToggle() {
  elements.languageToggle.textContent = state.language === "en" ? "EN" : "中文";
  elements.languageToggle.hidden = state.phase !== "HOME";
}

async function refreshPorts() {
  const ports = await window.orderStackApi.listPorts();
  const noneOption = () => { const o = document.createElement("option"); o.value = ""; o.textContent = "— none —"; return o; };

  elements.portSelect.innerHTML = "";
  elements.portSelectP2.innerHTML = "";
  elements.portSelectP2.appendChild(noneOption());

  for (const port of ports) {
    for (const select of [elements.portSelect, elements.portSelectP2]) {
      const option = document.createElement("option");
      option.value = port.path;
      option.textContent = port.friendlyName;
      select.appendChild(option);
    }
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
  elements.connectButton.textContent = connected ? "P1: Connected" : "Connect P1";
}

async function connectMcuP2() {
  if (!elements.portSelectP2.value) {
    addLog("Choose a P2 serial port first.");
    return;
  }

  try {
    await window.orderStackApi.connectP2(elements.portSelectP2.value);
    setConnectedP2(true);
    await sendLedCommandToPlayer("LED:OFF", 2);
  } catch (error) {
    addLog(`P2 CONNECT ERROR: ${error.message}`);
    setConnectedP2(false);
  }
}

function setConnectedP2(connected) {
  state.connectedP2 = connected;
  elements.connectionStatusP2.textContent = connected ? "P2: Connected" : "P2: Not connected";
  elements.connectButtonP2.textContent = connected ? "P2: Connected" : "Connect P2";
}

function handleSerialLine(line) {
  if (line.startsWith("REMOVED|")) {
    handleRemovedLine(line);
    return;
  }

  if (!line.startsWith("SCAN|")) {
    return;
  }

  const fields = parseFields(line);

  if (state.playerMode === "two") {
    if (!state.p1?.scanEnabled) {
      return;
    }

    receiveScanForPlayer(state.p1, fields.HOLE, fields.UID, 1);
    return;
  }

  if (state.regScanEnabled && !state.scanEnabled) {
    handleRegScan(fields.UID);
    return;
  }

  if (!state.scanEnabled) {
    return;
  }

  receiveScan(fields.HOLE, fields.UID);
}

function handleSerialLineP2(line) {
  if (line.startsWith("REMOVED|")) {
    const fields = parseFields(line);
    const hole = fields.HOLE;

    if (hole && state.p2?.recentScans?.[hole]) {
      state.p2.recentScans[hole] = { uid: null, timestamp: 0 };
    }

    if (state.p2?.currentRound?.mode === "MEMORY" && hole === state.p2.currentRound.hole) {
      state.p2.currentRound.lastAcceptedUid = null;
    }

    return;
  }

  if (!line.startsWith("SCAN|")) {
    return;
  }

  if (!state.p2?.scanEnabled) {
    return;
  }

  const fields = parseFields(line);
  receiveScanForPlayer(state.p2, fields.HOLE, fields.UID, 2);
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

  if (state.playerMode === "two") {
    if (hole && state.p1?.recentScans?.[hole]) {
      state.p1.recentScans[hole] = { uid: null, timestamp: 0 };
    }

    if (state.p1?.currentRound?.mode === "MEMORY" && hole === state.p1.currentRound.hole) {
      state.p1.currentRound.lastAcceptedUid = null;
    }

    return;
  }

  if (hole && state.recentScans[hole]) {
    state.recentScans[hole] = { uid: null, timestamp: 0 };
  }

  if (state.currentRound?.mode === "MEMORY" && state.phase === "MEMORY_INPUT") {
    if (hole === state.currentRound.hole) {
      state.currentRound.lastAcceptedUid = null;
    }
  }
}

async function startSession() {
  if (!state.connected) {
    elements.settingsPanel.hidden = false;
    addLog("Connect the MCU before starting.");
    return;
  }

  if (state.playerMode === "two" && !state.connectedP2) {
    elements.settingsPanel.hidden = false;
    addLog("Connect both P1 and P2 before starting a two-player game.");
    return;
  }

  const participant = readParticipantForm();

  if (!participant) {
    return;
  }

  try {
    const saved = await window.orderStackApi.getOrCreateParticipant(participant.participantName);
    state.participant.id = saved.participantId;
    state.participant.name = saved.participantName;
  } catch (error) {
    addLog(`DATABASE ERROR: ${error.message}`);
    return;
  }

  if (state.playerMode === "two") {
    try {
      const saved2 = await window.orderStackApi.getOrCreateParticipant(participant.participantName2);
      state.participant2.name = saved2.participantName;

      const match = await window.orderStackApi.createMatch();
      state.matchId = match.matchId;

      resetSessionState();

      state.p1 = makePlayerSession(state.participant.id, state.participant.name);
      state.p2 = makePlayerSession(saved2.participantId, saved2.participantName);
    } catch (error) {
      addLog(`DATABASE ERROR: ${error.message}`);
      return;
    }
  } else {
    resetSessionState();
  }

  await sendLedCommandAll("LED:OFF");
  beginNextRound();
}

function makePlayerSession(participantId, participantName) {
  return {
    participantId,
    participantName,
    scans: [],
    records: [],
    sortingAttributePairs: createSortingAttributePairs(),
    lastSortingRuleSnapshot: null,
    sessionSaved: false,
    sessionSaveResult: null,
    currentRound: null,
    roundDone: false,
    scanEnabled: false,
    recentScans: { LEFT: { uid: null, timestamp: 0 }, RIGHT: { uid: null, timestamp: 0 } }
  };
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
  state.lastRoundSeconds = null;
  state.sortingAttributePairs = createSortingAttributePairs();
  state.lastSortingRuleSnapshot = null;
  state.sessionSaved = false;
  state.sessionSaveResult = null;
  state.matchId = null;
  state.p1 = null;
  state.p2 = null;
  resetRecentScans();
}

async function goHome() {
  clearTimers();
  await setScanModeAll("OFF");
  await sendLedCommandAll("LED:OFF");
  resetSessionState();
  renderHome();
}

async function beginNextRound() {
  if (state.playerMode === "two") {
    await _beginTwoPlayerNextRound();
    return;
  }

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

async function _beginTwoPlayerNextRound() {
  clearTimers();
  await Promise.all([
    setScanModeForPlayer("OFF", 1),
    setScanModeForPlayer("OFF", 2),
    sendLedCommandToPlayer("LED:OFF", 1),
    sendLedCommandToPlayer("LED:OFF", 2)
  ]);

  if (state.p1) {
    state.p1.recentScans = { LEFT: { uid: null, timestamp: 0 }, RIGHT: { uid: null, timestamp: 0 } };
    state.p1.roundDone = false;
    state.p1.scanEnabled = false;
  }

  if (state.p2) {
    state.p2.recentScans = { LEFT: { uid: null, timestamp: 0 }, RIGHT: { uid: null, timestamp: 0 } };
    state.p2.roundDone = false;
    state.p2.scanEnabled = false;
  }

  state.roundIndex += 1;

  if (state.roundIndex >= TOTAL_ROUNDS) {
    renderTwoPlayerFinalScreen();
    return;
  }

  const mode = state.roundIndex < MEMORY_LENGTHS.length ? "MEMORY" : "SORTING";
  createTwoPlayerRound(mode);

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
  const blockNumber = Math.floor(state.sortingRoundIndex / 2) + 1;
  const roundInBlock = (state.sortingRoundIndex % 2) + 1;
  const isSwitchRound = roundInBlock === 1 && Boolean(state.lastSortingRuleSnapshot);

  return {
    mode: "SORTING",
    attribute,
    sortingRoundNumber: state.sortingRoundIndex + 1,
    blockNumber,
    roundInBlock,
    isSwitchRound,
    previousRule: isSwitchRound ? state.lastSortingRuleSnapshot : null,
    lastTrialTimestamp: null,
    trials: [],
    holes: {
      LEFT: createSortingHole(values[0]),
      RIGHT: createSortingHole(values[1])
    }
  };}

function createSortingHole(expected) {
  return {
    expected,
    target: randomInteger(1, 4),
    count: 0,
    startedAt: null,
    finishedAt: null,
    elapsedMs: 0
  };
}

function createTwoPlayerRound(mode) {
  state.currentRound = { mode, roundStartTime: null };

  if (mode === "MEMORY") {
    state.memoryRoundIndex += 1;
    const seqLen = MEMORY_LENGTHS[state.memoryRoundIndex];
    state.p1.currentRound = _makeTwoPlayerMemoryRound(seqLen);
    state.p2.currentRound = _makeTwoPlayerMemoryRound(seqLen);
  } else {
    state.sortingRoundIndex += 1;
    state.p1.currentRound = _makeTwoPlayerSortingRound(state.p1.sortingAttributePairs, state.p1.lastSortingRuleSnapshot);
    state.p2.currentRound = _makeTwoPlayerSortingRound(state.p2.sortingAttributePairs, state.p2.lastSortingRuleSnapshot);
  }

  state.p1.roundDone = false;
  state.p2.roundDone = false;
}

function _makeTwoPlayerMemoryRound(seqLen) {
  const attribute = randomChoice(["color", "shape"]);
  const values = attribute === "color" ? COLORS : SHAPES;

  return {
    mode: "MEMORY",
    attribute,
    hole: randomChoice(["LEFT", "RIGHT"]),
    expected: Array.from({ length: seqLen }, () => randomChoice(values)),
    actual: [],
    lastAcceptedUid: null,
    startedAt: null,
    finishedAt: null,
    elapsedMs: 0
  };
}

function _makeTwoPlayerSortingRound(attributePairs, lastSnapshot) {
  const attribute = attributePairs[Math.floor(state.sortingRoundIndex / 2)];
  const values = shuffle(attribute === "color" ? COLORS : SHAPES);
  const blockNumber = Math.floor(state.sortingRoundIndex / 2) + 1;
  const roundInBlock = (state.sortingRoundIndex % 2) + 1;
  const isSwitchRound = roundInBlock === 1 && Boolean(lastSnapshot);

  return {
    mode: "SORTING",
    attribute,
    sortingRoundNumber: state.sortingRoundIndex + 1,
    blockNumber,
    roundInBlock,
    isSwitchRound,
    previousRule: isSwitchRound ? lastSnapshot : null,
    lastTrialTimestamp: null,
    trials: [],
    holes: {
      LEFT: createSortingHole(values[0]),
      RIGHT: createSortingHole(values[1])
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
  if (state.playerMode === "two") {
    await _startTwoPlayerPlayableRound();
    return;
  }

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

async function _startTwoPlayerPlayableRound() {
  const mode = state.currentRound.mode;

  if (mode === "MEMORY") {
    state.phase = "MEMORIZE";
    await Promise.all([
      sendLedCommandToPlayer(`LED:MEMORY:${state.p1.currentRound.hole}`, 1),
      sendLedCommandToPlayer(`LED:MEMORY:${state.p2.currentRound.hole}`, 2)
    ]);
    let secondsRemaining = MEMORIZE_MS / 1000;
    renderTwoPlayerMemorize(secondsRemaining);

    state.memoryTimer = window.setInterval(() => {
      secondsRemaining -= 1;

      if (secondsRemaining === 0) {
        clearMemoryTimer();
        _startTwoPlayerMemoryInput();
        return;
      }

      renderTwoPlayerMemorize(secondsRemaining);
    }, 1000);
  } else {
    state.phase = "SORTING";
    const p1Round = state.p1.currentRound;
    const p2Round = state.p2.currentRound;
    const p1Left = p1Round.attribute === "color" ? p1Round.holes.LEFT.expected : "WHITE";
    const p1Right = p1Round.attribute === "color" ? p1Round.holes.RIGHT.expected : "WHITE";
    const p2Left = p2Round.attribute === "color" ? p2Round.holes.LEFT.expected : "WHITE";
    const p2Right = p2Round.attribute === "color" ? p2Round.holes.RIGHT.expected : "WHITE";

    await Promise.all([
      sendLedCommandToPlayer(`LED:SORT:LEFT:${p1Left}:RIGHT:${p1Right}`, 1),
      sendLedCommandToPlayer(`LED:SORT:LEFT:${p2Left}:RIGHT:${p2Right}`, 2)
    ]);

    const now = performance.now();
    state.currentRound.roundStartTime = now;
    state.p1.currentRound.lastTrialTimestamp = now;
    state.p2.currentRound.lastTrialTimestamp = now;
    state.p1.scanEnabled = true;
    state.p2.scanEnabled = true;

    await Promise.all([
      setScanModeForPlayer("BOTH", 1),
      setScanModeForPlayer("BOTH", 2)
    ]);

    renderTwoPlayerSorting();
  }
}

async function _startTwoPlayerMemoryInput() {
  state.phase = "MEMORY_INPUT";
  state.p1.scanEnabled = true;
  state.p2.scanEnabled = true;
  state.currentRound.roundStartTime = performance.now();

  await Promise.all([
    setScanModeForPlayer(state.p1.currentRound.hole, 1),
    setScanModeForPlayer(state.p2.currentRound.hole, 2)
  ]);

  renderTwoPlayerMemoryInput();
}

function startMemoryInput() {
  state.phase = "MEMORY_INPUT";
  renderMemory();
  startActiveTimerAndScanning();
}

async function startActiveTimerAndScanning() {
  state.roundStartTime = performance.now();

  if (state.currentRound.mode === "SORTING") {
    state.currentRound.lastTrialTimestamp = state.roundStartTime;
  }

  await setScanMode(state.currentRound.mode === "MEMORY" ? state.currentRound.hole : "BOTH");
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

async function sendLedCommandToPlayer(command, playerIndex) {
  if (playerIndex === 2) {
    if (!state.connectedP2) {
      return;
    }

    try {
      await window.orderStackApi.writeP2(`${command}\n`);
    } catch (error) {
      addLog(`P2 LED WRITE ERROR: ${error.message}`);
    }
  } else {
    await sendLedCommand(command);
  }
}

async function setScanModeForPlayer(mode, playerIndex) {
  if (playerIndex === 2) {
    if (state.p2) {
      state.p2.scanEnabled = mode !== "OFF";
    }

    if (!state.connectedP2) {
      return;
    }

    try {
      await window.orderStackApi.writeP2(`SCAN:${mode}\n`);
    } catch (error) {
      addLog(`P2 SCAN WRITE ERROR: ${error.message}`);
    }
  } else {
    if (state.p1) {
      state.p1.scanEnabled = mode !== "OFF";
    }

    await setScanMode(mode);
  }
}

async function setScanModeAll(mode) {
  if (state.playerMode === "two") {
    await Promise.all([setScanModeForPlayer(mode, 1), setScanModeForPlayer(mode, 2)]);
  } else {
    await setScanMode(mode);
  }
}

async function sendLedCommandAll(command) {
  if (state.playerMode === "two") {
    await Promise.all([sendLedCommandToPlayer(command, 1), sendLedCommandToPlayer(command, 2)]);
  } else {
    await sendLedCommand(command);
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
    animateCat("memory-cat", tag);
    roundComplete = round.actual.length >= round.expected.length;
  } else {
    const holeState = round.holes[hole];

    if (!holeState || holeState.count >= holeState.target) {
      return;
    }

    expected = holeState.expected;
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = actual === expected;
    const expectedHole = expectedHoleForCurrentRule(round, tag);
    const previousExpectedHole = round.isSwitchRound
      ? expectedHoleForSnapshot(round.previousRule, tag)
      : null;
    const reactionTimeMs = timestamp - (round.lastTrialTimestamp || state.roundStartTime || timestamp);
    const isPerseverativeError = Boolean(!correct && previousExpectedHole && previousExpectedHole === hole);

    if (!holeState.startedAt) {
      holeState.startedAt = timestamp;
    }

    round.lastTrialTimestamp = timestamp;
    holeState.count += 1;
    holeState.elapsedMs = timestamp - holeState.startedAt;

    if (holeState.count >= holeState.target && !holeState.finishedAt) {
      holeState.finishedAt = timestamp;
      holeState.elapsedMs = holeState.finishedAt - holeState.startedAt;
    }

    round.trials.push({
      blockNumber: round.blockNumber,
      ruleType: round.attribute,
      previousRuleType: round.previousRule?.attribute || null,
      isSwitchTrial: round.isSwitchRound,
      tokenColor: tag?.color || null,
      tokenShape: tag?.shape || null,
      expectedHole,
      placedHole: hole,
      reactionTimeMs,
      isCorrect: correct,
      isPerseverativeError
    });
    renderSorting();
    animateCat(hole === "LEFT" ? "left-cat" : "right-cat", tag);
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
    correct,
    reactionTimeMs: round.mode === "SORTING" ? round.trials.at(-1)?.reactionTimeMs || 0 : null,
    expectedHole: round.mode === "SORTING" ? round.trials.at(-1)?.expectedHole || null : null,
    placedHole: round.mode === "SORTING" ? hole : null,
    blockNumber: round.mode === "SORTING" ? round.blockNumber : null,
    ruleType: round.mode === "SORTING" ? round.attribute : null,
    previousRuleType: round.mode === "SORTING" ? round.previousRule?.attribute || null : null,
    isSwitchTrial: round.mode === "SORTING" ? round.isSwitchRound : false,
    isPerseverativeError: round.mode === "SORTING" ? round.trials.at(-1)?.isPerseverativeError || false : false,
    tokenColor: tag?.color || null,
    tokenShape: tag?.shape || null
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
    total: roundScans.length,
    sortingRoundNumber: state.currentRound.sortingRoundNumber || null,
    blockNumber: state.currentRound.blockNumber || null,
    roundInBlock: state.currentRound.roundInBlock || null,
    switchFromRule: state.currentRound.previousRule?.attribute || null,
    isSwitchRound: Boolean(state.currentRound.isSwitchRound)
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
  state.lastSortingRuleSnapshot = snapshotSortingRule(state.currentRound);
  renderSortingComplete();
}

function receiveScanForPlayer(playerState, hole, uid, playerIndex) {
  if (!playerState || playerState.roundDone) {
    return;
  }

  const tag = TAGS[uid] || null;
  const timestamp = performance.now();
  const round = playerState.currentRound;

  if (!round || !["LEFT", "RIGHT"].includes(hole)) {
    return;
  }

  const recent = playerState.recentScans[hole];

  if (recent && recent.uid === uid && timestamp - recent.timestamp < SAME_TAG_COOLDOWN_MS) {
    addLog(`P${playerIndex} IGNORED COOLDOWN: ${hole} ${uid}`);
    return;
  }

  let expected;
  let actual = "UNKNOWN";
  let correct = false;
  let roundDoneNow = false;

  if (round.mode === "MEMORY") {
    if (hole !== round.hole) {
      addLog(`P${playerIndex} IGNORED WRONG HOLE: ${hole}`);
      return;
    }

    if (uid === round.lastAcceptedUid) {
      addLog(`P${playerIndex} IGNORED DUPLICATE: ${uid}`);
      return;
    }

    const position = round.actual.length;

    if (position >= round.expected.length) {
      return;
    }

    expected = round.expected[position];
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = actual === expected;

    if (!round.startedAt) {
      round.startedAt = timestamp;
    }

    round.lastAcceptedUid = uid;
    round.actual.push({ hole, value: actual, tag, correct, timestamp });
    round.elapsedMs = timestamp - round.startedAt;

    if (round.actual.length >= round.expected.length && !round.finishedAt) {
      round.finishedAt = timestamp;
      round.elapsedMs = round.finishedAt - round.startedAt;
    }

    playerState.recentScans[hole] = { uid, timestamp };
    sendLedCommandToPlayer(`LED:SCAN:${hole}`, playerIndex);
    triggerScreenHalo(playerIndex === 1 ? "LEFT" : "RIGHT");
    renderTwoPlayerMemoryInput();
    animateCat(`p${playerIndex}-memory-cat`, tag);

    playerState.scans.push({
      round: state.roundIndex + 1,
      mode: "MEMORY",
      timestamp,
      hole,
      uid,
      expected,
      actual,
      correct,
      tokenColor: tag?.color || null,
      tokenShape: tag?.shape || null
    });

    roundDoneNow = round.actual.length >= round.expected.length;
  } else {
    const holeState = round.holes[hole];

    if (!holeState || holeState.count >= holeState.target) {
      return;
    }

    expected = holeState.expected;
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = actual === expected;
    const expectedHole = _expectedHoleForRound(round, tag);
    const previousExpectedHole = round.isSwitchRound
      ? expectedHoleForSnapshot(round.previousRule, tag)
      : null;
    const reactionTimeMs = timestamp - (round.lastTrialTimestamp || state.currentRound.roundStartTime || timestamp);
    const isPerseverativeError = Boolean(!correct && previousExpectedHole && previousExpectedHole === hole);

    if (!holeState.startedAt) {
      holeState.startedAt = timestamp;
    }

    round.lastTrialTimestamp = timestamp;
    holeState.count += 1;
    holeState.elapsedMs = timestamp - holeState.startedAt;

    if (holeState.count >= holeState.target && !holeState.finishedAt) {
      holeState.finishedAt = timestamp;
      holeState.elapsedMs = holeState.finishedAt - holeState.startedAt;
    }

    round.trials.push({
      blockNumber: round.blockNumber,
      ruleType: round.attribute,
      previousRuleType: round.previousRule?.attribute || null,
      isSwitchTrial: round.isSwitchRound,
      tokenColor: tag?.color || null,
      tokenShape: tag?.shape || null,
      expectedHole,
      placedHole: hole,
      reactionTimeMs,
      isCorrect: correct,
      isPerseverativeError
    });

    playerState.recentScans[hole] = { uid, timestamp };
    sendLedCommandToPlayer(`LED:SCAN:${hole}`, playerIndex);
    triggerScreenHalo(playerIndex === 1 ? "LEFT" : "RIGHT");
    renderTwoPlayerSorting();
    animateCat(`p${playerIndex}-${hole.toLowerCase()}-cat`, tag);

    playerState.scans.push({
      round: state.roundIndex + 1,
      mode: "SORTING",
      timestamp,
      hole,
      uid,
      expected,
      actual,
      correct,
      reactionTimeMs: round.trials.at(-1)?.reactionTimeMs || 0,
      expectedHole: expectedHole || null,
      placedHole: hole,
      blockNumber: round.blockNumber,
      ruleType: round.attribute,
      previousRuleType: round.previousRule?.attribute || null,
      isSwitchTrial: round.isSwitchRound,
      isPerseverativeError,
      tokenColor: tag?.color || null,
      tokenShape: tag?.shape || null
    });

    roundDoneNow = Object.values(round.holes).every((h) => h.count >= h.target);
  }

  if (roundDoneNow) {
    playerState.roundDone = true;
    playerState.scanEnabled = false;
    setScanModeForPlayer("OFF", playerIndex);
    _checkTwoPlayerRoundComplete();
  }
}

function _expectedHoleForRound(round, tag) {
  if (!tag) {
    return null;
  }

  const value = tag[round.attribute];

  if (round.holes.LEFT.expected === value) {
    return "LEFT";
  }

  if (round.holes.RIGHT.expected === value) {
    return "RIGHT";
  }

  return null;
}

function _checkTwoPlayerRoundComplete() {
  if (!state.p1.roundDone || !state.p2.roundDone) {
    return;
  }

  _completeTwoPlayerRound();
}

async function _completeTwoPlayerRound() {
  const mode = state.currentRound.mode;
  const roundNumber = state.roundIndex + 1;

  const buildRecord = (playerState) => {
    const round = playerState.currentRound;
    const roundScans = playerState.scans.filter((s) => s.round === roundNumber);
    let seconds;

    if (round.mode === "MEMORY") {
      seconds = (round.elapsedMs || 0) / 1000;
    } else {
      const endMs = Math.max(
        ...Object.values(round.holes).map((h) => h.finishedAt || h.startedAt || 0)
      );
      const startMs = Math.min(
        ...Object.values(round.holes).map((h) => h.startedAt || endMs)
      );
      seconds = (endMs - startMs) / 1000 || 0;
    }

    return {
      round: roundNumber,
      mode: round.mode,
      attribute: round.attribute,
      seconds: Math.max(seconds, 0),
      correct: roundScans.filter((s) => s.correct).length,
      total: roundScans.length,
      sortingRoundNumber: round.sortingRoundNumber || null,
      blockNumber: round.blockNumber || null,
      roundInBlock: round.roundInBlock || null,
      switchFromRule: round.previousRule?.attribute || null,
      isSwitchRound: Boolean(round.isSwitchRound)
    };
  };

  state.p1.records.push(buildRecord(state.p1));
  state.p2.records.push(buildRecord(state.p2));
  state.p1.lastRoundSeconds = state.p1.records.at(-1).seconds;
  state.p2.lastRoundSeconds = state.p2.records.at(-1).seconds;

  if (mode === "SORTING") {
    state.p1.lastSortingRuleSnapshot = snapshotSortingRule(state.p1.currentRound);
    state.p2.lastSortingRuleSnapshot = snapshotSortingRule(state.p2.currentRound);
  }

  await delay(RESULT_LED_DELAY_MS);

  const p1Scans = state.p1.scans.filter((s) => s.round === roundNumber);
  const p2Scans = state.p2.scans.filter((s) => s.round === roundNumber);
  const p1Perfect = p1Scans.length > 0 && p1Scans.every((s) => s.correct);
  const p2Perfect = p2Scans.length > 0 && p2Scans.every((s) => s.correct);

  await Promise.all([
    sendLedCommandToPlayer(p1Perfect ? "LED:SUCCESS" : "LED:ERROR", 1),
    sendLedCommandToPlayer(p2Perfect ? "LED:SUCCESS" : "LED:ERROR", 2)
  ]);

  if (mode === "MEMORY") {
    state.phase = "MEMORY_COMPLETE";
    renderTwoPlayerMemoryRoundResult();
  } else {
    state.phase = "SORTING_COMPLETE";
    renderTwoPlayerSortingRoundResult();
  }
}

async function toggleRegScan() {
  if (!state.connected) {
    addLog("Connect MCU before scanning.");
    return;
  }

  state.regScanEnabled = !state.regScanEnabled;
  elements.regScanButton.textContent = state.regScanEnabled ? "Stop Scanning" : "Start Scanning";

  if (!state.scanEnabled) {
    try {
      await window.orderStackApi.write(state.regScanEnabled ? "SCAN:BOTH\n" : "SCAN:OFF\n");
    } catch (e) {
      addLog(`REG SCAN ERROR: ${e.message}`);
    }
  }
}

function handleRegScan(uid) {
  if (!uid) {
    return;
  }

  state.regLastUid = uid;
  elements.regLastUid.textContent = uid;
  elements.regAssignButton.disabled = false;
  addLog(`REG SCAN: ${uid}`);
}

function registerToken() {
  const uid = state.regLastUid;
  const color = elements.regColorSelect.value;
  const shape = elements.regShapeSelect.value;

  if (!uid || !color || !shape) {
    addLog("Select a color and shape before registering.");
    return;
  }

  const count = Object.values(state.registeredTags)
    .filter((t) => t.color === color && t.shape === shape).length + 1;
  const name = `${color.charAt(0)}${color.slice(1).toLowerCase()} ${shape.charAt(0)}${shape.slice(1).toLowerCase()} ${count}`;

  state.registeredTags[uid] = { name, color, shape };
  renderRegList();

  elements.regLastUid.textContent = "—";
  elements.regAssignButton.disabled = true;
  state.regLastUid = null;
  addLog(`REGISTERED: ${name} → ${uid}`);
}

function renderRegList() {
  elements.regList.innerHTML = Object.entries(state.registeredTags).map(([uid, tag]) =>
    `<li class="reg-item"><code>${uid}</code> — ${tag.name}</li>`
  ).join("");
}

function copyTagsCode() {
  const entries = Object.entries(state.registeredTags);

  if (entries.length === 0) {
    addLog("No tokens registered yet.");
    return;
  }

  const lines = entries.map(([uid, tag]) =>
    `  "${uid}": { name: "${tag.name}", color: "${tag.color}", shape: "${tag.shape}" }`
  );
  const code = `const TAGS = {\n${lines.join(",\n")}\n};`;

  navigator.clipboard.writeText(code).then(() => {
    addLog("TAGS code copied to clipboard — paste it into renderer.js.");
  });
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
        ${shapeTree("CIRCLE", "tree-three")}
        ${shapeTree("HEXAGON", "tree-four")}
        ${shapeTree("HEART", "tree-five")}
      </div>
      <div class="home-hero">
        <h1 class="title">${t("gameTitle")}</h1>
        <div class="player-mode-toggle" aria-label="${t("playerMode")}">
          <button id="single-player-button" class="${state.playerMode === "single" ? "selected" : ""}" type="button">${t("onePlayer")}</button>
          <button id="two-player-button" class="${state.playerMode === "two" ? "selected" : ""}" type="button">${t("twoPlayers")}</button>
        </div>
        ${state.playerMode === "two" ? `
          <form id="participant-form" class="participant-form panel two-player-form">
            <p>${t("participantHint")}</p>
            <label>
              <span>${t("leftPlayer")}</span>
              <input id="participant-name-input" type="text" autocomplete="off" value="${escapeHtml(state.participant.name)}" />
            </label>
            <label>
              <span>${t("rightPlayer")}</span>
              <input id="participant-name-input-p2" type="text" autocomplete="off" value="${escapeHtml(state.participant2.name)}" />
            </label>
          </form>
        ` : `
          <form id="participant-form" class="participant-form panel">
            <p>${t("participantHint")}</p>
            <label>
              <span>${t("participantName")}</span>
              <input id="participant-name-input" type="text" autocomplete="off" value="${escapeHtml(state.participant.name)}" />
            </label>
          </form>
        `}
        <div class="hero-cat-wrap${state.playerMode === "two" ? " two-cats" : ""}">
          ${state.playerMode === "two" ? `
            ${cat("hero-cat hero-cat-left", "hero-cat-left")}
            ${cat("hero-cat hero-cat-right pink-cat", "hero-cat-right")}
          ` : `
            ${cat("hero-cat", "hero-cat")}
          `}
          <button id="start-cat-button" class="cat-start-button" type="button">${t("start")}</button>
        </div>
        ${state.playerMode === "two" ? `<p class="press-start">${t("pressStart")}</p>` : ""}
      </div>
    </section>
  `;
  document.querySelector("#participant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    startSession();
  });
  document.querySelector("#single-player-button").addEventListener("click", () => {
    cacheParticipantForm();
    state.playerMode = "single";
    renderHome();
  });
  document.querySelector("#two-player-button").addEventListener("click", () => {
    cacheParticipantForm();
    state.playerMode = "two";
    renderHome();
  });
  document.querySelector("#start-cat-button").addEventListener("click", startSession);
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
          ${shapeTree("CIRCLE", "tree-three")}
          ${shapeTree("HEXAGON", "tree-four")}
          ${shapeTree("HEART", "tree-five")}
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
          ${shapeTree("CIRCLE", "tree-three")}
          ${shapeTree("HEXAGON", "tree-four")}
          ${shapeTree("HEART", "tree-five")}
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

  if (!showingSequence && state.playerMode === "two" && round.players) {
    renderTwoPlayerMemoryInput();
    return;
  }

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

function renderTwoPlayerMemorize(secondsRemaining) {
  setHudProgress(progressForCurrentRound());
  updateLanguageToggle();

  const renderSeq = (playerState, label) => {
    const round = playerState.currentRound;
    const boxes = round.expected.map((expected) => renderTokenBox(expected, round.attribute, true)).join("");

    return `
      <article class="memory-player-card panel">
        <div class="player-title-row">
          <h3>${label}</h3>
          <span class="winner-badge">${round.expected.length}</span>
        </div>
        <div class="memory-grid memory-input-row">${boxes}</div>
      </article>
    `;
  };

  elements.gameScreen.innerHTML = `
    <section class="two-player-memory-screen">
      <div class="result-heading">
        <h2 class="screen-heading">${t("rememberSequence")}</h2>
        <div class="memory-timer" style="--timer-progress:${(secondsRemaining / (MEMORIZE_MS / 1000)) * 100}%">
          <span>${secondsRemaining}</span>
        </div>
      </div>
      <div class="duel-grid memory-duel-grid">
        ${renderSeq(state.p1, t("leftPlayer"))}
        ${renderSeq(state.p2, t("rightPlayer"))}
      </div>
    </section>
  `;
}

function renderTwoPlayerMemoryInput() {
  setHudProgress(progressForCurrentRound());
  updateLanguageToggle();

  const renderPanel = (playerState, label, catClass, catId) => {
    const round = playerState.currentRound;
    const boxes = round.expected.map((_, index) => {
      const item = round.actual[index];
      return renderTokenBox(item?.value, round.attribute, Boolean(item));
    }).join("");
    const done = round.actual.length >= round.expected.length;

    return `
      <article class="memory-player-card panel${done ? " done-panel" : ""}">
        <div class="player-title-row">
          <h3>${label}</h3>
          <span class="winner-badge">${round.actual.length} / ${round.expected.length}</span>
        </div>
        <div class="memory-grid memory-input-row">${boxes}</div>
        <div class="memory-input-cat-row">
          ${cat(`${catClass} result-cat`, catId)}
          <strong class="result-message">${done ? "✓" : t("keepFeeding")}</strong>
        </div>
      </article>
    `;
  };

  elements.gameScreen.innerHTML = `
    <section class="two-player-memory-screen">
      <div class="result-heading">
        <h2 class="screen-heading">${t("feedCat")}</h2>
        <p class="key-hint">${t("inputHint")}</p>
      </div>
      <div class="duel-grid memory-duel-grid">
        ${renderPanel(state.p1, t("leftPlayer"), "pink-cat", "p1-memory-cat")}
        ${renderPanel(state.p2, t("rightPlayer"), "blue-cat", "p2-memory-cat")}
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

function renderTwoPlayerMemoryRoundResult() {
  const p1Sum = _summarizeTwoPlayerMemory(state.p1);
  const p2Sum = _summarizeTwoPlayerMemory(state.p2);
  const winner = comparePlayers(p1Sum, p2Sum);

  setHudProgress(progressForCompletedRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="two-player-result-screen">
      <div class="result-heading">
        <h2 class="screen-heading">${t("roundCompleted")}</h2>
        <p class="key-hint">${t("winnerRule")}</p>
      </div>
      <div class="duel-grid">
        ${_renderMemoryResultPanel(state.p1, t("leftPlayer"), "pink-cat", p1Sum, winner === "LEFT")}
        ${_renderMemoryResultPanel(state.p2, t("rightPlayer"), "blue-cat", p2Sum, winner === "RIGHT")}
      </div>
      <button id="two-player-result-ok" class="ok-button result-ok-button" type="button">${t("ok")}</button>
    </section>
  `;
  document.querySelector("#two-player-result-ok").addEventListener("click", beginNextRound);
}

function _summarizeTwoPlayerMemory(playerState) {
  const round = playerState.currentRound;
  const total = round.expected.length;
  const correct = round.actual.filter((item, index) => item.value === round.expected[index]).length;
  const complete = round.actual.length >= total;

  return {
    actual: round.actual,
    correct,
    total,
    complete,
    elapsedMs: round.elapsedMs || 0,
    score: scoreRound(correct, total, round.elapsedMs || 0, complete)
  };
}

function _renderMemoryResultPanel(playerState, label, catClass, summary, isWinner) {
  const round = playerState.currentRound;
  const status = isWinner ? t("winner") : t("runnerUp");
  const message = isWinner ? t("youWin") : t("betterLuck");
  const boxes = round.expected.map((expected, index) => {
    const item = summary.actual[index];
    const value = item?.value;
    const correct = Boolean(item) && value === expected;

    return value
      ? renderResultBox(value, round.attribute, correct)
      : renderTokenBox("", round.attribute);
  }).join("");

  return `
    <article class="player-panel ${isWinner ? "winner" : ""}">
      <div class="player-title-row">
        <h3>${label}</h3>
        <span class="winner-badge">${status}</span>
      </div>
      <div class="memory-grid memory-input-row">${boxes}</div>
      <div class="score-card">
        <span>${t("score")}</span>
        <strong>${summary.score}</strong>
      </div>
      <div class="player-message-row">
        ${isWinner ? sparkles() : ""}
        ${cat(`${catClass} result-cat ${isWinner ? "happy-cat" : ""}`)}
        <strong class="result-message">${message}</strong>
      </div>
    </article>
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
  const label = state.playerMode === "two"
    ? (hole === "LEFT" ? t("leftPlayer") : t("rightPlayer"))
    : (hole === "LEFT" ? t("leftHole") : t("rightHole"));

  return `
    <section class="sort-card panel">
      <p class="hole-title">${label}</p>
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

function renderTwoPlayerSorting() {
  const p1Round = state.p1.currentRound;
  const p2Round = state.p2.currentRound;
  const instruction1 = p1Round.attribute === "shape" ? t("sortingShape") : t("sortingColor");
  const instruction2 = p2Round.attribute === "shape" ? t("sortingShape") : t("sortingColor");

  setHudProgress(progressForCurrentRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="two-player-sorting-screen">
      <div class="two-player-sorting-grid">
        <div class="sorting-player-half">
          <p class="sorting-player-label">${t("leftPlayer")}</p>
          <p class="key-hint sorting-rule-hint">${instruction1}</p>
          <div class="sorting-columns">
            ${_renderTwoPlayerSortColumn("LEFT", p1Round.holes.LEFT, p1Round.attribute, "p1-left-cat")}
            ${_renderTwoPlayerSortColumn("RIGHT", p1Round.holes.RIGHT, p1Round.attribute, "p1-right-cat")}
          </div>
        </div>
        <div class="sorting-player-half">
          <p class="sorting-player-label">${t("rightPlayer")}</p>
          <p class="key-hint sorting-rule-hint">${instruction2}</p>
          <div class="sorting-columns">
            ${_renderTwoPlayerSortColumn("LEFT", p2Round.holes.LEFT, p2Round.attribute, "p2-left-cat")}
            ${_renderTwoPlayerSortColumn("RIGHT", p2Round.holes.RIGHT, p2Round.attribute, "p2-right-cat")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function _renderTwoPlayerSortColumn(hole, holeState, attribute, catId) {
  const catClass = hole === "LEFT" ? "pink-cat" : "blue-cat";

  return `
    <section class="sort-card panel">
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

function renderTwoPlayerSortingRoundResult() {
  const p1Sum = _summarizeTwoPlayerSorting(state.p1);
  const p2Sum = _summarizeTwoPlayerSorting(state.p2);
  const winner = comparePlayers(p1Sum, p2Sum);

  setHudProgress(progressForCompletedRound());
  updateLanguageToggle();
  elements.gameScreen.innerHTML = `
    <section class="two-player-result-screen">
      <div class="result-heading">
        <h2 class="screen-heading">${t("roundCompleted")}</h2>
        <p class="key-hint">${t("winnerRule")}</p>
      </div>
      <div class="duel-grid sorting-outcome-grid">
        ${renderSortingResultPanel("LEFT", t("leftPlayer"), "pink-cat", p1Sum, winner === "LEFT")}
        ${renderSortingResultPanel("RIGHT", t("rightPlayer"), "blue-cat", p2Sum, winner === "RIGHT")}
      </div>
      <button id="two-player-sorting-ok" class="ok-button result-ok-button" type="button">${t("ok")}</button>
    </section>
  `;
  document.querySelector("#two-player-sorting-ok").addEventListener("click", beginNextRound);
}

function _summarizeTwoPlayerSorting(playerState) {
  const round = playerState.currentRound;
  const roundNumber = state.roundIndex + 1;
  const roundScans = playerState.scans.filter((s) => s.round === roundNumber);
  const totalTarget = Object.values(round.holes).reduce((sum, h) => sum + h.target, 0);
  const correct = roundScans.filter((s) => s.correct).length;
  const complete = Object.values(round.holes).every((h) => h.count >= h.target);
  const maxElapsedMs = Math.max(...Object.values(round.holes).map((h) => h.elapsedMs || 0));

  return {
    actual: roundScans,
    correct,
    total: totalTarget,
    complete,
    elapsedMs: maxElapsedMs,
    score: scoreRound(correct, totalTarget, maxElapsedMs, complete)
  };
}

function renderSortingResultPanel(hole, label, catClass, summary, isWinner) {
  const status = isWinner ? t("winner") : t("runnerUp");
  const message = isWinner ? t("youWin") : t("betterLuck");

  return `
    <article class="player-panel sorting-winner-panel ${isWinner ? "winner" : ""}">
      <div class="player-title-row">
        <h3>${label}</h3>
        <span class="winner-badge">${status}</span>
      </div>
      <div class="score-card">
        <span>${t("score")}</span>
        <strong>${summary.score}</strong>
      </div>
      <div class="player-message-row sorting-final-row">
        ${isWinner ? sparkles() : ""}
        ${cat(`${catClass} result-cat ${isWinner ? "happy-cat" : ""}`)}
        <strong class="result-message">${message}</strong>
      </div>
    </article>
  `;
}

function renderTwoPlayerFinalScreen() {
  state.phase = "FINAL";
  Promise.all([
    sendLedCommandToPlayer("LED:RAINBOW", 1),
    sendLedCommandToPlayer("LED:RAINBOW", 2)
  ]);
  setScene("play");
  setHudProgress(100);
  updateLanguageToggle();

  const buildScore = (playerState) => {
    const scans = playerState.scans;
    const total = scans.length;
    const correct = scans.filter((s) => s.correct).length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const totalSeconds = playerState.records.reduce((sum, r) => sum + r.seconds, 0);
    const score = Math.round((accuracy / 100) * 800 + Math.min(200, 15000 / Math.max(totalSeconds, 1)));
    return { score, accuracy, totalSeconds };
  };

  const p1Stats = buildScore(state.p1);
  const p2Stats = buildScore(state.p2);
  const overallWinner = p1Stats.score >= p2Stats.score ? "p1" : "p2";

  const p1Payload = buildTwoPlayerSessionPayload(state.p1, p1Stats);
  const p2Payload = buildTwoPlayerSessionPayload(state.p2, p2Stats);

  const renderPlayerCard = (playerState, stats, label, catClass, isWinner) => `
    <article class="player-panel final-player-panel ${isWinner ? "winner" : ""}">
      <div class="player-title-row">
        <h3>${escapeHtml(playerState.participantName)}</h3>
        <span class="winner-badge">${isWinner ? t("winner") : t("runnerUp")}</span>
      </div>
      <p class="final-player-label">${label}</p>
      <div class="score-card">
        <span>${t("score")}</span>
        <strong>${stats.score}</strong>
      </div>
      <div class="summary-row">
        <div><span>${t("accuracy")}</span><strong>${stats.accuracy}%</strong></div>
        <div><span>${t("activeTime")}</span><strong>${formatDuration(stats.totalSeconds)}</strong></div>
      </div>
      <div class="player-message-row">
        ${isWinner ? sparkles() : ""}
        ${cat(`${catClass} result-cat ${isWinner ? "happy-cat" : ""}`)}
        <strong class="result-message">${isWinner ? t("youWin") : t("betterLuck")}</strong>
      </div>
    </article>
  `;

  elements.gameScreen.innerHTML = `
    <section class="final-screen two-player-final-screen">
      <h2 class="screen-heading">${t("greatJob")}</h2>
      <div class="duel-grid two-player-final-grid">
        ${renderPlayerCard(state.p1, p1Stats, t("leftPlayer"), "pink-cat", overallWinner === "p1")}
        ${renderPlayerCard(state.p2, p2Stats, t("rightPlayer"), "blue-cat", overallWinner === "p2")}
      </div>
      <div id="database-status" class="database-status">${t("databaseSaving")}</div>
      <button id="home-button" class="ok-button home-button" type="button">${t("home")}</button>
    </section>
  `;
  document.querySelector("#home-button").addEventListener("click", goHome);
  saveTwoPlayerSession(p1Payload, p2Payload);
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
  const sessionPayload = buildSessionPayload(score, accuracy, totalSeconds);
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
        <div id="database-status" class="database-status">${t("databaseSaving")}</div>
        <button id="home-button" class="ok-button home-button" type="button">${t("home")}</button>
        <details class="results-details">
          <summary>Staff results</summary>
          <div class="staff-metrics">
            <p><strong>Participant:</strong> ${escapeHtml(sessionPayload.participant.participantId)}</p>
            <p><strong>Game 1 accuracy:</strong> ${sessionPayload.game1Accuracy.toFixed(1)}%</p>
            <p><strong>Game 2 accuracy:</strong> ${sessionPayload.game2Accuracy.toFixed(1)}%</p>
            <p><strong>Switch RT cost:</strong> ${(sessionPayload.executiveMetrics.switchRtCostMs / 1000).toFixed(2)}s</p>
            <p><strong>Switch error cost:</strong> ${sessionPayload.executiveMetrics.switchErrorCost.toFixed(1)} points</p>
            <p><strong>Perseverative errors:</strong> ${sessionPayload.executiveMetrics.perseverativeErrors}</p>
          </div>
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
  saveCompletedSession(sessionPayload);
}


function scoreRound(correct, total, elapsedMs, complete) {
  if (!total) {
    return 0;
  }

  const seconds = Math.max(elapsedMs / 1000, 1);
  const accuracyComponent = (correct / total) * 800;
  const speedComponent = complete ? Math.min(200, 12000 / seconds) : 0;

  return Math.round(accuracyComponent + speedComponent);
}

function comparePlayers(left, right) {
  if (left.correct !== right.correct) {
    return left.correct > right.correct ? "LEFT" : "RIGHT";
  }

  if (left.score !== right.score) {
    return left.score > right.score ? "LEFT" : "RIGHT";
  }

  if (left.elapsedMs && right.elapsedMs && left.elapsedMs !== right.elapsedMs) {
    return left.elapsedMs < right.elapsedMs ? "LEFT" : "RIGHT";
  }

  return "LEFT";
}

function sparkles() {
  return `
    <span class="sparkle-field" aria-hidden="true">
      <span class="sparkle sparkle-one"></span>
      <span class="sparkle sparkle-two"></span>
      <span class="sparkle sparkle-three"></span>
      <span class="sparkle sparkle-four"></span>
    </span>
  `;
}

function renderTokenBox(value, attribute, scanned = false) {
  if (!value) {
    return `<div class="token-box blank"></div>`;
  }

  const classes = ["token-box", tokenFillClass(attribute), scanned ? "scanned" : ""]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}"${tokenFillStyle(value, attribute)}>
      ${tokenContent(value, attribute)}
    </div>
  `;
}

function renderResultBox(value, attribute, correct) {
  const classes = ["token-box", "result-box", tokenFillClass(attribute), correct ? "correct" : "wrong"]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}"${tokenFillStyle(value, attribute)}>
      ${tokenContent(value, attribute)}
    </div>
  `;
}

function renderRuleTile(value, attribute) {
  const classes = ["rule-tile", tokenFillClass(attribute)]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}"${tokenFillStyle(value, attribute)}>
      ${tokenContent(value, attribute)}
    </div>
  `;
}

function readParticipantForm() {
  cacheParticipantForm();
  const nameInput = document.querySelector("#participant-name-input");
  const participantName = state.participant.name;

  if (!participantName) {
    addLog("Participant name is required before starting.");
    nameInput?.focus();
    return null;
  }

  if (state.playerMode === "two") {
    const p2Input = document.querySelector("#participant-name-input-p2");
    const participantName2 = state.participant2.name;

    if (!participantName2) {
      addLog("Player 2 name is required before starting.");
      p2Input?.focus();
      return null;
    }

    return { participantName, participantName2 };
  }

  return { participantName };
}

function cacheParticipantForm() {
  const nameInput = document.querySelector("#participant-name-input");

  if (nameInput) {
    state.participant.name = nameInput.value.trim();
  }

  const p2Input = document.querySelector("#participant-name-input-p2");

  if (p2Input) {
    state.participant2.name = p2Input.value.trim();
  }
}

function expectedHoleForCurrentRule(round, tag) {
  if (!tag) {
    return null;
  }

  const value = tag[round.attribute];

  if (round.holes.LEFT.expected === value) {
    return "LEFT";
  }

  if (round.holes.RIGHT.expected === value) {
    return "RIGHT";
  }

  return null;
}

function expectedHoleForSnapshot(snapshot, tag) {
  if (!snapshot || !tag) {
    return null;
  }

  const value = tag[snapshot.attribute];

  if (snapshot.holes.LEFT === value) {
    return "LEFT";
  }

  if (snapshot.holes.RIGHT === value) {
    return "RIGHT";
  }

  return null;
}

function snapshotSortingRule(round) {
  return {
    attribute: round.attribute,
    holes: {
      LEFT: round.holes.LEFT.expected,
      RIGHT: round.holes.RIGHT.expected
    }
  };
}

function buildSessionPayload(score, accuracy, totalSeconds) {
  const game1Scans = state.scans.filter((scan) => scan.mode === "MEMORY");
  const game2Scans = state.scans.filter((scan) => scan.mode === "SORTING");
  const game2Trials = buildGame2Trials(game2Scans);
  const game2Blocks = buildGame2Blocks(game2Trials);

  return {
    participant: {
      participantId: state.participant.id,
      participantName: state.participant.name || state.participant.id
    },
    totalScore: score,
    totalAccuracy: accuracy,
    totalGameTimeMs: Math.round(totalSeconds * 1000),
    game1Accuracy: accuracyForScans(game1Scans),
    game2Accuracy: accuracyForScans(game2Scans),
    executiveMetrics: buildExecutiveMetrics(game2Trials, game2Blocks),
    game2Blocks,
    game2Trials,
    dataQualityFlag: "valid"
  };
}

function buildGame2Trials(game2Scans) {
  return game2Scans.map((scan, index) => ({
    trialNumber: index + 1,
    blockNumber: scan.blockNumber || 0,
    ruleType: scan.ruleType || scan.attribute || "",
    previousRuleType: scan.previousRuleType || null,
    isSwitchTrial: Boolean(scan.isSwitchTrial),
    tokenColor: scan.tokenColor || null,
    tokenShape: scan.tokenShape || null,
    expectedHole: scan.expectedHole || null,
    placedHole: scan.placedHole || scan.hole,
    reactionTimeMs: Math.max(0, Math.round(scan.reactionTimeMs || 0)),
    isCorrect: Boolean(scan.correct),
    isPerseverativeError: Boolean(scan.isPerseverativeError)
  }));
}

function buildGame2Blocks(game2Trials, sortingRecords = null) {
  sortingRecords = sortingRecords || state.records.filter((record) => record.mode === "SORTING");
  const blocks = [];

  for (let blockNumber = 1; blockNumber <= 3; blockNumber++) {
    const round1 = sortingRecords.find((record) => record.blockNumber === blockNumber && record.roundInBlock === 1);
    const round2 = sortingRecords.find((record) => record.blockNumber === blockNumber && record.roundInBlock === 2);

    if (!round1 || !round2) {
      continue;
    }

    const previousBlockRound2 = sortingRecords.find((record) => (
      record.blockNumber === blockNumber - 1 &&
      record.roundInBlock === 2
    ));
    const blockTrials = game2Trials.filter((trial) => trial.blockNumber === blockNumber);
    const round1ErrorRate = errorRateFromCounts(round1.correct, round1.total);
    const previousErrorRate = previousBlockRound2
      ? errorRateFromCounts(previousBlockRound2.correct, previousBlockRound2.total)
      : round1ErrorRate;
    const round1Rate = timePerTokenMs(round1);
    const round2Rate = timePerTokenMs(round2);
    const previousRate = previousBlockRound2 ? timePerTokenMs(previousBlockRound2) : round1Rate;
    const totalCorrect = round1.correct + round2.correct;
    const totalScans = round1.total + round2.total;

    blocks.push({
      blockNumber,
      ruleType: round1.attribute,
      switchFromRule: round1.switchFromRule || null,
      round1TimeMs: Math.round(round1.seconds * 1000),
      round2TimeMs: Math.round(round2.seconds * 1000),
      round1TokenTotal: round1.total,
      round2TokenTotal: round2.total,
      blockAccuracy: totalScans ? (totalCorrect / totalScans) * 100 : 0,
      switchCostMs: round1.switchFromRule ? round1Rate - previousRate : 0,
      switchErrorCost: round1.switchFromRule ? (round1ErrorRate - previousErrorRate) * 100 : 0,
      adaptationCostMs: round1Rate - round2Rate,
      perseverativeErrorCount: blockTrials.filter((trial) => trial.isPerseverativeError).length
    });
  }

  return blocks;
}

function buildExecutiveMetrics(game2Trials, game2Blocks) {
  const switchTrials = game2Trials.filter((trial) => trial.isSwitchTrial);
  const repeatTrials = game2Trials.filter((trial) => !trial.isSwitchTrial);
  const switchRt = averageReactionTime(switchTrials);
  const repeatRt = averageReactionTime(repeatTrials);
  const switchErrorCost = (errorRate(switchTrials) - errorRate(repeatTrials)) * 100;
  const switchedBlocks = game2Blocks.filter((block) => block.switchFromRule);

  return {
    switchRtCostMs: switchRt - repeatRt,
    switchErrorCost,
    perseverativeErrors: game2Trials.filter((trial) => trial.isPerseverativeError).length,
    adaptationCostMs: average(switchedBlocks.map((block) => block.adaptationCostMs))
  };
}

async function saveCompletedSession(sessionPayload) {
  if (state.sessionSaved) {
    return;
  }

  state.sessionSaved = true;

  try {
    const result = await window.orderStackApi.saveGameSession(sessionPayload);
    state.sessionSaveResult = result;
    updateDatabaseStatus(result);
    addLog(`DATABASE SAVED: ${result.sessionId}`);
  } catch (error) {
    state.sessionSaved = false;
    updateDatabaseStatus(null, error);
    addLog(`DATABASE ERROR: ${error.message}`);
  }
}

function buildTwoPlayerSessionPayload(playerState, stats) {
  const game1Scans = playerState.scans.filter((s) => s.mode === "MEMORY");
  const game2Scans = playerState.scans.filter((s) => s.mode === "SORTING");
  const game2Trials = buildGame2Trials(game2Scans);
  const sortingRecords = playerState.records.filter((r) => r.mode === "SORTING");
  const game2Blocks = buildGame2Blocks(game2Trials, sortingRecords);

  return {
    participant: {
      participantId: playerState.participantId,
      participantName: playerState.participantName
    },
    matchId: state.matchId,
    totalScore: stats.score,
    totalAccuracy: stats.accuracy,
    totalGameTimeMs: Math.round(stats.totalSeconds * 1000),
    game1Accuracy: accuracyForScans(game1Scans),
    game2Accuracy: accuracyForScans(game2Scans),
    executiveMetrics: buildExecutiveMetrics(game2Trials, game2Blocks),
    game2Blocks,
    game2Trials,
    dataQualityFlag: "valid"
  };
}

async function saveTwoPlayerSession(p1Payload, p2Payload) {
  if (state.sessionSaved) {
    return;
  }

  state.sessionSaved = true;

  const saveOne = async (payload, label) => {
    try {
      const result = await window.orderStackApi.saveGameSession(payload);
      addLog(`DATABASE SAVED ${label}: ${result.sessionId}`);
      return result;
    } catch (error) {
      addLog(`DATABASE ERROR ${label}: ${error.message}`);
      return null;
    }
  };

  const r1 = await saveOne(p1Payload, "P1");
  const r2 = await saveOne(p2Payload, "P2");
  const status = document.querySelector("#database-status");

  if (!status) {
    return;
  }

  if (!r1 || !r2) {
    status.classList.add("database-error");
    status.textContent = `${t("databaseError")}`;
    return;
  }

  status.classList.remove("database-error");
  status.innerHTML = `<strong>${t("databaseSaved")}</strong>`;
}

function updateDatabaseStatus(result, error = null) {
  const status = document.querySelector("#database-status");

  if (!status) {
    return;
  }

  if (error) {
    status.classList.add("database-error");
    status.textContent = `${t("databaseError")}: ${error.message}`;
    return;
  }

  status.classList.remove("database-error");
  status.innerHTML = `
    <strong>${t("databaseSaved")}</strong>
    <span>${t("monitoringStatus")}: ${escapeHtml(result.monitoringStatus)}</span>
    <span>${t("flagReason")}: ${escapeHtml(result.flagReason)}</span>
  `;
}

function timePerTokenMs(record) {
  return record.total > 0 ? (record.seconds * 1000) / record.total : 0;
}

function accuracyForScans(scans) {
  if (!scans.length) {
    return 0;
  }

  return (scans.filter((scan) => scan.correct).length / scans.length) * 100;
}

function errorRate(trials) {
  if (!trials.length) {
    return 0;
  }

  return trials.filter((trial) => !trial.isCorrect).length / trials.length;
}

function errorRateFromCounts(correct, total) {
  return total > 0 ? (total - correct) / total : 0;
}

function averageReactionTime(trials) {
  const correctTrials = trials.filter((trial) => trial.isCorrect);
  const values = (correctTrials.length ? correctTrials : trials)
    .map((trial) => trial.reactionTimeMs)
    .filter((value) => Number.isFinite(value));

  return average(values);
}

function average(values) {
  const filtered = values.filter((value) => Number.isFinite(value));

  if (!filtered.length) {
    return 0;
  }

  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function tokenContent(value, attribute) {
  if (attribute === "color") {
    return "";
  }

  return shapeMarkup(value, "token-shape");
}

function tokenFillClass(attribute) {
  return attribute === "color" ? "color-token" : "";
}

function tokenFillStyle(value, attribute) {
  return attribute === "color" ? ` style="--tile-color:${colorValue(value)}"` : "";
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
    GREEN: "#00dc45",
    BLACK: "#111827",
    WHITE: "#fffdf4"
  }[color] || "#ffffff";
}

function shapeMarkup(shape, extraClass = "") {
  if (!shape) {
    return "";
  }

  return `<span class="shape ${shape.toLowerCase()} ${extraClass}"></span>`;
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
        <circle class="snack-piece snack-circle" cx="111" cy="-16" r="18"></circle>
        <path class="snack-piece snack-hexagon" d="M98 -34 L124 -34 L138 -16 L124 2 L98 2 L84 -16 Z"></path>
        <polygon class="snack-piece snack-star" points="111,-36 116,-23 131,-22 120,-13 123,0 111,-7 99,0 102,-13 91,-22 106,-23"></polygon>
        <path class="snack-piece snack-heart" d="M111,2 C90,-4 84,-34 97,-38 C107,-40 111,-28 111,-28 C111,-28 115,-40 125,-38 C138,-34 132,-4 111,2 Z"></path>
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

function animateCat(id, token = null) {
  const catElement = document.querySelector(`#${id}`);

  if (!catElement) {
    return;
  }

  const shape = typeof token === "string" ? token : token?.shape || "SQUARE";
  const color = typeof token === "object" && token ? token.color : "WHITE";
  const snackShapeClasses = SHAPES.map((item) => `snack-${item.toLowerCase()}`);

  catElement.style.setProperty("--snack-color", colorValue(color));
  catElement.classList.remove("snack-triangle", "snack-square", "snack-circle", "snack-hexagon", "snack-star", "snack-heart");
  catElement.classList.remove(...snackShapeClasses);
  catElement.classList.remove("eating");
  void catElement.getBoundingClientRect();
  catElement.classList.add(`snack-${shape.toLowerCase()}`);
  catElement.classList.add("eating");

  window.setTimeout(() => {
    catElement.classList.remove("eating");
  }, 880);
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
