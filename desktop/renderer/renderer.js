const TOTAL_ROUNDS = 12;
const INSTRUCTION_MS = 6000;
const COUNTDOWN_STEP_MS = 1000;
const MEMORIZE_MS = 5000;
const NEXT_ROUND_MS = 2000;
const MEMORY_LENGTHS = [3, 3, 4, 5, 5, 6];

const COLORS = ["YELLOW", "PURPLE", "BLUE", "TURQUOISE", "RED", "GREEN"];
const SHAPES = ["SQUARE", "CIRCLE", "TRIANGLE", "PENTAGON", "STAR", "SEMICIRCLE", "HEXAGON", "RECTANGLE", "OVAL"];
const TAGS = {
  "53:F2:7D:74:95:00:01": { name: "Yellow square", color: "YELLOW", shape: "SQUARE" },
  "53:15:38:79:95:00:01": { name: "Purple circle", color: "PURPLE", shape: "CIRCLE" },
  "53:1B:85:74:95:00:01": { name: "Blue triangle", color: "BLUE", shape: "TRIANGLE" },
  "53:4E:9D:74:95:00:01": { name: "Purple pentagon", color: "PURPLE", shape: "PENTAGON" },
  "53:FB:AF:74:95:00:01": { name: "Yellow star", color: "YELLOW", shape: "STAR" },
  "53:6A:A4:74:95:00:01": { name: "Turquoise semicircle", color: "TURQUOISE", shape: "SEMICIRCLE" },
  "53:D9:A8:74:95:00:01": { name: "Red hexagon", color: "RED", shape: "HEXAGON" },
  "53:A4:B2:74:95:00:01": { name: "Yellow triangle", color: "YELLOW", shape: "TRIANGLE" },
  "53:23:96:74:95:00:01": { name: "Red rectangle", color: "RED", shape: "RECTANGLE" },
  "53:BA:A1:74:95:00:01": { name: "Green triangle", color: "GREEN", shape: "TRIANGLE" },
  "53:70:93:74:95:00:01": { name: "Green oval", color: "GREEN", shape: "OVAL" }
};

const elements = {
  gameScreen: document.querySelector("#game-screen"),
  settingsButton: document.querySelector("#settings-button"),
  settingsPanel: document.querySelector("#settings-panel"),
  closeSettingsButton: document.querySelector("#close-settings-button"),
  portSelect: document.querySelector("#port-select"),
  refreshButton: document.querySelector("#refresh-button"),
  connectButton: document.querySelector("#connect-button"),
  connectionStatus: document.querySelector("#connection-status"),
  debugToggle: document.querySelector("#debug-toggle"),
  simToggle: document.querySelector("#sim-toggle"),
  clearLogButton: document.querySelector("#clear-log-button"),
  logList: document.querySelector("#log-list")
};

const state = {
  connected: false,
  phase: "HOME",
  roundIndex: -1,
  memoryRoundIndex: -1,
  sortingRoundIndex: -1,
  currentRound: null,
  roundStartTime: null,
  scanEnabled: false,
  records: [],
  scans: [],
  lastRoundSeconds: null,
  sortingAttributePairs: []
};

elements.settingsButton.addEventListener("click", () => {
  elements.settingsPanel.hidden = false;
});
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
  if (!line.startsWith("SCAN|") || !state.scanEnabled) {
    return;
  }

  const fields = parseFields(line);
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

function isSimMode() {
  return elements.simToggle.checked;
}

async function startSession() {
  if (!state.connected && !isSimMode()) {
    elements.settingsPanel.hidden = false;
    addLog("Connect the MCU before starting.");
    return;
  }

  state.roundIndex = -1;
  state.memoryRoundIndex = -1;
  state.sortingRoundIndex = -1;
  state.records = [];
  state.scans = [];
  state.lastRoundSeconds = null;
  state.sortingAttributePairs = Array.from({ length: 3 }, () => randomChoice(["color", "shape"]));
  await setScanMode("OFF");
  beginNextRound();
}

async function beginNextRound() {
  await setScanMode("OFF");
  state.roundIndex += 1;

  if (state.roundIndex >= TOTAL_ROUNDS) {
    renderFinalScreen();
    return;
  }

  const mode = state.roundIndex < MEMORY_LENGTHS.length ? "MEMORY" : "SORTING";
  state.currentRound = mode === "MEMORY" ? createMemoryRound() : createSortingRound();

  if (state.roundIndex === 0 || state.roundIndex === MEMORY_LENGTHS.length) {
    state.phase = "INSTRUCTION";
    renderGameInstruction(mode);
    window.setTimeout(beginCountdown, INSTRUCTION_MS);
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

function beginCountdown() {
  state.phase = "COUNTDOWN";
  let count = 3;
  renderCountdown(count);

  const interval = window.setInterval(() => {
    count -= 1;

    if (count === 0) {
      window.clearInterval(interval);
      startPlayableRound();
      return;
    }

    renderCountdown(count);
  }, COUNTDOWN_STEP_MS);
}

function startPlayableRound() {
  if (state.currentRound.mode === "MEMORY") {
    state.phase = "MEMORIZE";
    let secondsRemaining = MEMORIZE_MS / 1000;
    renderMemory(secondsRemaining);

    const interval = window.setInterval(() => {
      secondsRemaining -= 1;

      if (secondsRemaining === 0) {
        window.clearInterval(interval);
        startMemoryInput();
        return;
      }

      const timer = document.querySelector(".memorize-timer");
      const timerNumber = timer?.querySelector("strong");

      if (timer && timerNumber) {
        timer.setAttribute("aria-label", `${secondsRemaining} seconds remaining`);
        timerNumber.textContent = secondsRemaining;
      }
    }, 1000);
  } else {
    state.phase = "SORTING";
    renderSorting();
    startActiveTimerAndScanning();
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

  if (!state.connected || isSimMode()) {
    return;
  }

  try {
    await window.orderStackApi.write(`SCAN:${mode}\n`);
  } catch (error) {
    addLog(`SERIAL WRITE ERROR: ${error.message}`);
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

  if (round.mode === "MEMORY") {
    if (uid === round.lastAcceptedUid) {
      addLog(`IGNORED DUPLICATE MEMORY TAG: ${uid}`);
      return;
    }

    const position = round.actual.length;
    expected = round.expected[position];
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = hole === round.hole && actual === expected;
    round.lastAcceptedUid = uid;
    round.actual.push({ hole, value: actual, tag });
    renderMemory();
    roundComplete = round.actual.length >= round.expected.length;
  } else {
    const holeState = round.holes[hole];

    if (!holeState) {
      return;
    }

    expected = holeState.expected;
    actual = tag ? tag[round.attribute] : "UNKNOWN";
    correct = holeState.count < holeState.target && actual === expected;

    if (holeState.count < holeState.target) {
      holeState.count += 1;
    }

    renderSorting();
    roundComplete = Object.values(round.holes).every((item) => item.count >= item.target);
  }

  triggerScreenHalo(hole);

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

  state.lastRoundSeconds = seconds;
  state.records.push({
    round: roundNumber,
    mode: state.currentRound.mode,
    attribute: state.currentRound.attribute,
    seconds,
    correct: roundScans.filter((scan) => scan.correct).length,
    total: roundScans.length
  });

  state.phase = "NEXT";
  renderNextRound();
  window.setTimeout(beginNextRound, NEXT_ROUND_MS);
}

function renderHome() {
  state.phase = "HOME";
  elements.gameScreen.innerHTML = `
    <section class="center-screen">
      <h2>Ready to play?</h2>
      <p class="supporting-text">Follow the instructions shown on the screen.</p>
      <p class="supporting-text">This game takes about 5 minutes.</p>
      <button id="start-button" class="start-button" type="button">&#9654; Start Game</button>
    </section>
  `;
  document.querySelector("#start-button").addEventListener("click", startSession);
}

function renderGameInstruction(mode) {
  const progress = renderSessionProgress();

  if (mode === "MEMORY") {
    elements.gameScreen.innerHTML = `
      <section class="center-screen instruction-screen">
        ${progress}
        <p class="large-kicker">Game 1</p>
        <p class="game-name">Memory Game</p>
        <h2>Remember the items<br />in order</h2>
        <p class="supporting-text">Scan them using the hole shown on the screen.</p>
      </section>
    `;
  } else {
    elements.gameScreen.innerHTML = `
      <section class="center-screen instruction-screen">
        ${progress}
        <p class="large-kicker">Game 2</p>
        <p class="game-name">Sorting Game</p>
        <h2>Put each item into<br />the matching hole</h2>
        <p class="supporting-text">Try to finish carefully and quickly.</p>
      </section>
    `;
  }
}

function renderCountdown(count) {
  elements.gameScreen.innerHTML = `
    <section class="center-screen plain-screen">
      ${renderSessionProgress()}
      <p class="large-kicker">Get ready</p>
      <strong class="countdown">${count}</strong>
    </section>
  `;
}

function renderMemory(secondsRemaining = null) {
  const round = state.currentRound;
  const showingSequence = state.phase === "MEMORIZE";
  const items = showingSequence ? round.expected : round.actual.map((item) => item.value);
  const boxes = round.expected.map((_value, index) => renderAttributeBox(items[index], round.attribute)).join("");
  const memorizeTimer = showingSequence
    ? `
      <div class="memorize-timer" aria-label="${secondsRemaining} seconds remaining">
        <svg class="timer-ring" viewBox="0 0 160 160" aria-hidden="true">
          <circle class="timer-track" cx="80" cy="80" r="68"></circle>
          <circle class="timer-progress" cx="80" cy="80" r="68"></circle>
        </svg>
        <strong>${secondsRemaining}</strong>
      </div>
    `
    : "";

  elements.gameScreen.innerHTML = `
    <section class="play-screen">
      ${renderSessionProgress()}
      <div class="play-header">
        <p class="round-label">Round ${state.roundIndex + 1} of ${TOTAL_ROUNDS}</p>
        <p class="mode-label">Memory Game</p>
      </div>
      <h2>${showingSequence ? "Remember the order" : "Scan the items in order"}</h2>
      <p class="hole-instruction compact">${round.hole === "LEFT" ? "←" : "→"} Use the ${round.hole.toLowerCase()} hole ${round.hole === "LEFT" ? "←" : "→"}</p>
      ${memorizeTimer}
      <div class="memory-grid">${boxes}</div>
    </section>
  `;
}

function renderSorting() {
  const round = state.currentRound;
  elements.gameScreen.innerHTML = `
    <section class="play-screen">
      ${renderSessionProgress()}
      <div class="play-header">
        <p class="round-label">Round ${state.roundIndex + 1} of ${TOTAL_ROUNDS}</p>
        <p class="mode-label">Sorting Game</p>
      </div>
      <h2>Put items into the matching holes</h2>
      <div class="sorting-grid">
        ${renderSortingColumn("LEFT", round.holes.LEFT, round.attribute)}
        ${renderSortingColumn("RIGHT", round.holes.RIGHT, round.attribute)}
      </div>
    </section>
  `;
}

function renderSortingColumn(hole, holeState, attribute) {
  return `
    <section class="sort-column">
      <div class="sort-rule">
        <p class="hole-title">${hole} HOLE</p>
        ${renderAttributeBox(holeState.expected, attribute, "rule-box")}
      </div>
      <div class="sort-progress">
        <span>Items scanned</span>
        <strong>${holeState.count} <small>of</small> ${holeState.target}</strong>
      </div>
    </section>
  `;
}

function renderAttributeBox(value, attribute, extraClass = "") {
  if (!value) {
    return `<div class="attribute-box blank ${extraClass}"></div>`;
  }

  if (attribute === "color") {
    return `<div class="attribute-box color-box ${extraClass}" style="--token-color:${colorValue(value)}"></div>`;
  }

  return `<div class="attribute-box shape-box ${extraClass}">${shapeMarkup(value)}</div>`;
}

function renderNextRound() {
  const timing = elements.debugToggle.checked
    ? `<p class="debug-time">Round time: ${state.lastRoundSeconds.toFixed(1)} seconds</p>`
    : "";

  elements.gameScreen.innerHTML = `
    <section class="center-screen plain-screen">
      ${renderSessionProgress(true)}
      <h2>Next round!</h2>
      <p class="supporting-text">You are doing well.</p>
      ${timing}
    </section>
  `;
}

function renderSessionProgress(roundCompleted = false) {
  const completedRounds = Math.min(TOTAL_ROUNDS, Math.max(0, state.roundIndex + (roundCompleted ? 1 : 0)));
  const percent = Math.min(100, (completedRounds / TOTAL_ROUNDS) * 100);
  const roundLabel = state.roundIndex >= TOTAL_ROUNDS
    ? `${TOTAL_ROUNDS} of ${TOTAL_ROUNDS} rounds complete`
    : `Round ${state.roundIndex + 1} of ${TOTAL_ROUNDS}`;

  return `
    <div class="session-progress">
      <div class="progress-heading">
        <span>Overall progress</span>
        <strong>${roundLabel}</strong>
      </div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${TOTAL_ROUNDS}" aria-valuenow="${completedRounds}">
        <span style="width:${percent}%"></span>
      </div>
    </div>
  `;
}

function renderFinalScreen() {
  state.phase = "FINAL";
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
      ${renderSessionProgress(true)}
      <p class="large-kicker">All finished!</p>
      <h2>Great job</h2>
      <div class="score-block">
        <span>Score</span>
        <strong>${score}</strong>
        <small>out of 1000</small>
      </div>
      <div class="summary-row">
        <div><span>Accuracy</span><strong>${accuracy}%</strong></div>
        <div><span>Active time</span><strong>${formatDuration(totalSeconds)}</strong></div>
      </div>
      <button id="play-again-button" class="start-button" type="button">Play Again</button>
      <details class="results-details">
        <summary>Staff results</summary>
        <table>
          <thead><tr><th>Round</th><th>Mode</th><th>Accuracy</th><th>Time</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </details>
    </section>
  `;
  document.querySelector("#play-again-button").addEventListener("click", startSession);
}

function colorValue(color) {
  return {
    YELLOW: "#f4c63d",
    PURPLE: "#8851a5",
    BLUE: "#3577c9",
    TURQUOISE: "#2aa9a0",
    RED: "#d24d43",
    GREEN: "#4a9b67"
  }[color];
}

function shapeMarkup(shape) {
  if (shape === "STAR") {
    return `<span class="shape star">★</span>`;
  }

  return `<span class="shape ${shape.toLowerCase()}"></span>`;
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

function triggerScreenHalo(hole) {
  const el = document.querySelector(hole === "LEFT" ? "#halo-left" : "#halo-right");
  el.classList.remove("active");
  void el.offsetWidth;
  el.classList.add("active");
}

document.addEventListener("keydown", (event) => {
  if (!isSimMode() || !state.scanEnabled) return;

  const key = event.key.toUpperCase();
  if (key !== "L" && key !== "R") return;

  const hole = key === "L" ? "LEFT" : "RIGHT";
  const uids = Object.keys(TAGS);
  const uid = uids[Math.floor(Math.random() * uids.length)];
  addLog(`SIM|HOLE:${hole}|UID:${uid}`);
  receiveScan(hole, uid);
});

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  elements.logList.prepend(item);

  while (elements.logList.children.length > 100) {
    elements.logList.lastElementChild.remove();
  }
}
