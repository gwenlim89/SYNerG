const { app } = require("electron");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const SQLITE_BIN = "/usr/bin/sqlite3";
const PROJECT_DB_PATH = path.join(__dirname, "..", "kitten_nibbles.db");

/*
  SQLite persistence layer
  ------------------------
  This file stores each completed game session and calculates monitoring
  ratings against the participant's first completed baseline session.

  Function guide:
  - initDatabase: creates/migrates the SQLite schema.
  - copyLegacyDatabaseIfNeeded: preserves an older Electron userData database.
  - getOrCreateParticipant/saveParticipant/listParticipants: manage players.
  - createMatch: groups two-player sessions under one match id.
  - getLeaderboard: returns top scores for the home-screen leaderboard.
  - saveGameSession: writes one completed session plus Game 2 block/trial rows.
  - sessionInsertSql/baselineInsertSql/blockInsertSql/trialInsertSql: build SQL rows.
  - getBaseline: loads the participant's first-session comparison point.
  - calculateMonitoringRating/rateScore/rateExecutive/rateCostIncrease:
    classify score and executive-function changes as baseline/stable/watch/flagged.
  - normalizeExecutiveMetrics/normalizeBlocks/normalizeTrials: validate UI payloads.
  - worseRating/percentageDecline and sql helpers: keep rating and SQL output consistent.
*/

// Rating order lets the code choose the most serious status across score and
// executive-function checks.
const RATING_SEVERITY = {
  baseline: 0,
  stable: 0,
  watch: 1,
  flagged: 2
};

let dbPath;

// Create every table needed by the game and apply lightweight migrations.
async function initDatabase() {
  dbPath = process.env.KITTEN_NIBBLES_DB_PATH || PROJECT_DB_PATH;
  copyLegacyDatabaseIfNeeded(dbPath);

  await runSql(`
    PRAGMA foreign_keys = ON;

    -- Participants are intentionally simple: one unique id and one display name.
    CREATE TABLE IF NOT EXISTS participants (
      participant_id TEXT PRIMARY KEY,
      participant_name TEXT NOT NULL
    );

    -- Sessions store the overall result and monitoring rating for one full playthrough.
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL,
      session_date TEXT NOT NULL,
      completed INTEGER NOT NULL,
      total_score INTEGER NOT NULL,
      total_accuracy REAL NOT NULL,
      total_game_time_ms INTEGER NOT NULL,
      game1_accuracy REAL NOT NULL,
      game2_accuracy REAL NOT NULL,
      score_rating TEXT NOT NULL,
      executive_rating TEXT NOT NULL,
      monitoring_status TEXT NOT NULL,
      flag_reason TEXT NOT NULL,
      data_quality_flag TEXT NOT NULL,
      FOREIGN KEY (participant_id) REFERENCES participants(participant_id)
    );

    -- The first completed session becomes the participant's personal baseline.
    CREATE TABLE IF NOT EXISTS baselines (
      participant_id TEXT PRIMARY KEY,
      baseline_session_id TEXT NOT NULL,
      baseline_total_score INTEGER NOT NULL,
      baseline_total_accuracy REAL NOT NULL,
      baseline_game2_accuracy REAL NOT NULL,
      baseline_switch_rt_cost_ms REAL NOT NULL,
      baseline_switch_error_cost REAL NOT NULL,
      baseline_perseverative_errors INTEGER NOT NULL,
      baseline_adaptation_cost_ms REAL NOT NULL,
      FOREIGN KEY (participant_id) REFERENCES participants(participant_id),
      FOREIGN KEY (baseline_session_id) REFERENCES sessions(session_id)
    );

    -- Game 2 block rows summarize each 2-round colour/shape rule block.
    CREATE TABLE IF NOT EXISTS game2_blocks (
      block_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      block_number INTEGER NOT NULL,
      rule_type TEXT NOT NULL,
      switch_from_rule TEXT,
      round_1_time_ms INTEGER NOT NULL,
      round_2_time_ms INTEGER NOT NULL,
      round_1_token_total INTEGER NOT NULL,
      round_2_token_total INTEGER NOT NULL,
      block_accuracy REAL NOT NULL,
      switch_cost_ms REAL NOT NULL,
      switch_error_cost REAL NOT NULL,
      adaptation_cost_ms REAL NOT NULL,
      perseverative_error_count INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    );

    -- Game 2 trial rows keep only the placement-level data needed for executive metrics.
    CREATE TABLE IF NOT EXISTS game2_trials (
      trial_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      block_id TEXT NOT NULL,
      trial_number INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      rule_type TEXT NOT NULL,
      previous_rule_type TEXT,
      is_switch_trial INTEGER NOT NULL,
      token_color TEXT,
      token_shape TEXT,
      expected_hole TEXT,
      placed_hole TEXT NOT NULL,
      reaction_time_ms INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      is_perseverative_error INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id),
      FOREIGN KEY (block_id) REFERENCES game2_blocks(block_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_participant_date
      ON sessions(participant_id, session_date);

    CREATE INDEX IF NOT EXISTS idx_blocks_session
      ON game2_blocks(session_id);

    CREATE INDEX IF NOT EXISTS idx_trials_session
      ON game2_trials(session_id);

    -- Two-player sessions share a match id so both players can be linked later.
    CREATE TABLE IF NOT EXISTS matches (
      match_id TEXT PRIMARY KEY,
      match_date TEXT NOT NULL
    );
  `);

  try {
    await runSql(`ALTER TABLE sessions ADD COLUMN match_id TEXT REFERENCES matches(match_id);`);
  } catch (_) {}

  return dbPath;
}

// If a previous version stored the database under Electron userData, copy it
// into the project folder so the database travels with this project.
function copyLegacyDatabaseIfNeeded(targetPath) {
  if (fs.existsSync(targetPath)) {
    return;
  }

  const legacyPath = path.join(app.getPath("userData"), "kitten_nibbles.db");

  if (!fs.existsSync(legacyPath)) {
    return;
  }

  fs.copyFileSync(legacyPath, targetPath);
}

// Look up a player by name or create a new participant row before starting.
async function getOrCreateParticipant(name) {
  const participantName = normalizeRequiredText(name, "participant_name");

  const existing = await querySql(`
    SELECT participant_id AS participantId,
           participant_name AS participantName
    FROM participants
    WHERE LOWER(participant_name) = LOWER(${sqlText(participantName)})
    LIMIT 1;
  `);

  if (existing[0]) {
    return { participantId: existing[0].participantId, participantName: existing[0].participantName, dbPath };
  }

  const participantId = makeId("p");
  await runSql(`
    INSERT INTO participants (participant_id, participant_name)
    VALUES (${sqlText(participantId)}, ${sqlText(participantName)});
  `);

  return { participantId, participantName, dbPath };
}

// Create a shared match id for two-player mode.
async function createMatch() {
  const matchId = makeId("match");
  const matchDate = new Date().toISOString();
  await runSql(`INSERT INTO matches (match_id, match_date) VALUES (${sqlText(matchId)}, ${sqlText(matchDate)});`);
  return { matchId };
}

// Insert or update a participant record.
async function saveParticipant(participant) {
  const participantId = normalizeRequiredText(participant.participantId, "participant_id");
  const participantName = normalizeRequiredText(participant.participantName || participantId, "participant_name");

  await runSql(`
    INSERT INTO participants (participant_id, participant_name)
    VALUES (${sqlText(participantId)}, ${sqlText(participantName)})
    ON CONFLICT(participant_id) DO UPDATE SET
      participant_name = excluded.participant_name;
  `);

  return { participantId, participantName, dbPath };
}

// Return all participants for staff/debug views.
async function listParticipants() {
  return querySql(`
    SELECT participant_id AS participantId,
           participant_name AS participantName
    FROM participants
    ORDER BY participant_id ASC;
  `);
}

// Build the top-score table shown on the leaderboard screen.
async function getLeaderboard(limit) {
  const rowLimit = finiteInteger(limit) || 10;

  return querySql(`
    SELECT s.participant_id AS participantId,
           p.participant_name AS participantName,
           MAX(s.total_score) AS bestScore
    FROM sessions s
    JOIN participants p ON p.participant_id = s.participant_id
    WHERE s.completed = 1
    GROUP BY s.participant_id
    ORDER BY bestScore DESC
    LIMIT ${sqlInteger(rowLimit)};
  `);
}

// Save one completed player's session and its derived executive-function data.
async function saveGameSession(payload) {
  const participant = await saveParticipant(payload.participant || {});
  const sessionId = makeId("session");
  const sessionDate = new Date().toISOString();
  const executiveMetrics = normalizeExecutiveMetrics(payload.executiveMetrics || {});
  const baseline = await getBaseline(participant.participantId);
  const rating = calculateMonitoringRating(payload, executiveMetrics, baseline);
  const blockRows = normalizeBlocks(payload.game2Blocks || [], sessionId);
  const blockIdByNumber = new Map(blockRows.map((block) => [block.blockNumber, block.blockId]));
  const trialRows = normalizeTrials(payload.game2Trials || [], sessionId, blockIdByNumber);

  const sql = [
    "BEGIN TRANSACTION;",
    sessionInsertSql({
      sessionId,
      participantId: participant.participantId,
      sessionDate,
      matchId: payload.matchId || null,
      payload,
      rating
    }),
    ...blockRows.map(blockInsertSql),
    ...trialRows.map(trialInsertSql)
  ];

  if (!baseline) {
    sql.push(baselineInsertSql({
      participantId: participant.participantId,
      sessionId,
      payload,
      executiveMetrics
    }));
  }

  sql.push("COMMIT;");

  await runSql(sql.join("\n"));

  return {
    dbPath,
    sessionId,
    sessionDate,
    scoreRating: rating.scoreRating,
    executiveRating: rating.executiveRating,
    monitoringStatus: rating.monitoringStatus,
    flagReason: rating.flagReason,
    baselineCreated: !baseline
  };
}

// Generate the SQL row for the session-level score and monitoring result.
function sessionInsertSql({ sessionId, participantId, sessionDate, matchId, payload, rating }) {
  return `
    INSERT INTO sessions (
      session_id,
      participant_id,
      session_date,
      completed,
      total_score,
      total_accuracy,
      total_game_time_ms,
      game1_accuracy,
      game2_accuracy,
      score_rating,
      executive_rating,
      monitoring_status,
      flag_reason,
      data_quality_flag,
      match_id
    ) VALUES (
      ${sqlText(sessionId)},
      ${sqlText(participantId)},
      ${sqlText(sessionDate)},
      1,
      ${sqlInteger(payload.totalScore)},
      ${sqlNumber(payload.totalAccuracy)},
      ${sqlInteger(payload.totalGameTimeMs)},
      ${sqlNumber(payload.game1Accuracy)},
      ${sqlNumber(payload.game2Accuracy)},
      ${sqlText(rating.scoreRating)},
      ${sqlText(rating.executiveRating)},
      ${sqlText(rating.monitoringStatus)},
      ${sqlText(rating.flagReason)},
      ${sqlText(payload.dataQualityFlag || "valid")},
      ${sqlNullableText(matchId)}
    );
  `;
}

// Save the first completed session as the participant's baseline comparison.
function baselineInsertSql({ participantId, sessionId, payload, executiveMetrics }) {
  return `
    INSERT INTO baselines (
      participant_id,
      baseline_session_id,
      baseline_total_score,
      baseline_total_accuracy,
      baseline_game2_accuracy,
      baseline_switch_rt_cost_ms,
      baseline_switch_error_cost,
      baseline_perseverative_errors,
      baseline_adaptation_cost_ms
    ) VALUES (
      ${sqlText(participantId)},
      ${sqlText(sessionId)},
      ${sqlInteger(payload.totalScore)},
      ${sqlNumber(payload.totalAccuracy)},
      ${sqlNumber(payload.game2Accuracy)},
      ${sqlNumber(executiveMetrics.switchRtCostMs)},
      ${sqlNumber(executiveMetrics.switchErrorCost)},
      ${sqlInteger(executiveMetrics.perseverativeErrors)},
      ${sqlNumber(executiveMetrics.adaptationCostMs)}
    );
  `;
}

// Generate one Game 2 block summary row.
function blockInsertSql(block) {
  return `
    INSERT INTO game2_blocks (
      block_id,
      session_id,
      block_number,
      rule_type,
      switch_from_rule,
      round_1_time_ms,
      round_2_time_ms,
      round_1_token_total,
      round_2_token_total,
      block_accuracy,
      switch_cost_ms,
      switch_error_cost,
      adaptation_cost_ms,
      perseverative_error_count
    ) VALUES (
      ${sqlText(block.blockId)},
      ${sqlText(block.sessionId)},
      ${sqlInteger(block.blockNumber)},
      ${sqlText(block.ruleType)},
      ${sqlNullableText(block.switchFromRule)},
      ${sqlInteger(block.round1TimeMs)},
      ${sqlInteger(block.round2TimeMs)},
      ${sqlInteger(block.round1TokenTotal)},
      ${sqlInteger(block.round2TokenTotal)},
      ${sqlNumber(block.blockAccuracy)},
      ${sqlNumber(block.switchCostMs)},
      ${sqlNumber(block.switchErrorCost)},
      ${sqlNumber(block.adaptationCostMs)},
      ${sqlInteger(block.perseverativeErrorCount)}
    );
  `;
}

// Generate one Game 2 placement/trial row.
function trialInsertSql(trial) {
  return `
    INSERT INTO game2_trials (
      trial_id,
      session_id,
      block_id,
      trial_number,
      block_number,
      rule_type,
      previous_rule_type,
      is_switch_trial,
      token_color,
      token_shape,
      expected_hole,
      placed_hole,
      reaction_time_ms,
      is_correct,
      is_perseverative_error
    ) VALUES (
      ${sqlText(trial.trialId)},
      ${sqlText(trial.sessionId)},
      ${sqlText(trial.blockId)},
      ${sqlInteger(trial.trialNumber)},
      ${sqlInteger(trial.blockNumber)},
      ${sqlText(trial.ruleType)},
      ${sqlNullableText(trial.previousRuleType)},
      ${sqlInteger(trial.isSwitchTrial ? 1 : 0)},
      ${sqlNullableText(trial.tokenColor)},
      ${sqlNullableText(trial.tokenShape)},
      ${sqlNullableText(trial.expectedHole)},
      ${sqlText(trial.placedHole)},
      ${sqlInteger(trial.reactionTimeMs)},
      ${sqlInteger(trial.isCorrect ? 1 : 0)},
      ${sqlInteger(trial.isPerseverativeError ? 1 : 0)}
    );
  `;
}

// Load a participant's baseline, if one already exists.
async function getBaseline(participantId) {
  const rows = await querySql(`
    SELECT *
    FROM baselines
    WHERE participant_id = ${sqlText(participantId)}
    LIMIT 1;
  `);

  return rows[0] || null;
}

// Combine overall score decline and executive-function decline into one monitoring status.
function calculateMonitoringRating(payload, executiveMetrics, baseline) {
  if (!baseline) {
    return {
      scoreRating: "baseline",
      executiveRating: "baseline",
      monitoringStatus: "baseline",
      flagReason: "First completed session saved as baseline."
    };
  }

  const scoreResult = rateScore(payload, baseline);
  const executiveResult = rateExecutive(payload, executiveMetrics, baseline);
  const monitoringStatus = worseRating(scoreResult.rating, executiveResult.rating);
  const reasons = [...scoreResult.reasons, ...executiveResult.reasons];

  return {
    scoreRating: scoreResult.rating,
    executiveRating: executiveResult.rating,
    monitoringStatus,
    flagReason: reasons.length ? reasons.join(" ") : "Within baseline range."
  };
}

// Rate the total score against baseline using percentage decline thresholds.
function rateScore(payload, baseline) {
  const reasons = [];
  let rating = "stable";
  const decline = percentageDecline(Number(baseline.baseline_total_score), Number(payload.totalScore));

  if (decline >= 50) {
    rating = "flagged";
    reasons.push(`Urgent score review: total score dropped ${decline.toFixed(1)}% from baseline.`);
  } else if (decline >= 30) {
    rating = "flagged";
    reasons.push(`Score dropped ${decline.toFixed(1)}% from baseline.`);
  } else if (decline >= 15) {
    rating = "watch";
    reasons.push(`Score dropped ${decline.toFixed(1)}% from baseline.`);
  }

  return { rating, reasons };
}

// Rate Game 2 executive-function metrics against baseline.
function rateExecutive(payload, metrics, baseline) {
  const reasons = [];
  let rating = "stable";

  const switchCostRating = rateCostIncrease(
    Number(baseline.baseline_switch_rt_cost_ms),
    Number(metrics.switchRtCostMs),
    "Rule-switching reaction time"
  );
  rating = worseRating(rating, switchCostRating.rating);
  reasons.push(...switchCostRating.reasons);

  const adaptationRating = rateCostIncrease(
    Number(baseline.baseline_adaptation_cost_ms),
    Number(metrics.adaptationCostMs),
    "Post-switch adaptation time"
  );
  rating = worseRating(rating, adaptationRating.rating);
  reasons.push(...adaptationRating.reasons);

  const baselineSwitchError = Number(baseline.baseline_switch_error_cost);
  const switchErrorIncrease = Number(metrics.switchErrorCost) - baselineSwitchError;

  if (switchErrorIncrease >= 20) {
    rating = "flagged";
    reasons.push(`Switch-trial error cost increased ${switchErrorIncrease.toFixed(1)} percentage points.`);
  } else if (switchErrorIncrease >= 10) {
    rating = worseRating(rating, "watch");
    reasons.push(`Switch-trial error cost increased ${switchErrorIncrease.toFixed(1)} percentage points.`);
  }

  const perseverativeErrors = Number(metrics.perseverativeErrors);
  const perseverativeIncrease = perseverativeErrors - Number(baseline.baseline_perseverative_errors);

  if (perseverativeIncrease >= 2) {
    rating = "flagged";
    reasons.push(`Perseverative errors increased by ${perseverativeIncrease} to ${perseverativeErrors}.`);
  } else if (perseverativeIncrease >= 1) {
    rating = worseRating(rating, "watch");
    reasons.push(`Perseverative errors increased by ${perseverativeIncrease} to ${perseverativeErrors}.`);
  }

  const game2AccuracyDrop = Number(baseline.baseline_game2_accuracy) - Number(payload.game2Accuracy);

  if (game2AccuracyDrop >= 20) {
    rating = "flagged";
    reasons.push(`Game 2 accuracy dropped ${game2AccuracyDrop.toFixed(1)} percentage points from baseline.`);
  } else if (game2AccuracyDrop >= 10) {
    rating = worseRating(rating, "watch");
    reasons.push(`Game 2 accuracy dropped ${game2AccuracyDrop.toFixed(1)} percentage points from baseline.`);
  }

  return { rating, reasons };
}

// Rate reaction-time/adaptation increases with percentage or absolute thresholds.
function rateCostIncrease(baselineValue, currentValue, label) {
  const reasons = [];

  if (!Number.isFinite(currentValue)) {
    return { rating: "stable", reasons };
  }

  const increase = currentValue - baselineValue;

  if (baselineValue >= 1000) {
    const percentIncrease = ((increase / baselineValue) * 100);

    if (percentIncrease >= 40) {
      return {
        rating: "flagged",
        reasons: [`${label} increased ${percentIncrease.toFixed(1)}% from baseline.`]
      };
    }

    if (percentIncrease >= 20) {
      return {
        rating: "watch",
        reasons: [`${label} increased ${percentIncrease.toFixed(1)}% from baseline.`]
      };
    }
  } else {
    if (increase >= 3000) {
      return {
        rating: "flagged",
        reasons: [`${label} increased ${(increase / 1000).toFixed(1)} seconds from baseline.`]
      };
    }

    if (increase >= 1500) {
      return {
        rating: "watch",
        reasons: [`${label} increased ${(increase / 1000).toFixed(1)} seconds from baseline.`]
      };
    }
  }

  return { rating: "stable", reasons };
}

// Coerce executive metrics from the UI into safe numeric values.
function normalizeExecutiveMetrics(metrics) {
  return {
    switchRtCostMs: finiteNumber(metrics.switchRtCostMs),
    switchErrorCost: finiteNumber(metrics.switchErrorCost),
    perseverativeErrors: finiteInteger(metrics.perseverativeErrors),
    adaptationCostMs: finiteNumber(metrics.adaptationCostMs)
  };
}

// Convert Game 2 block payloads into database-ready rows.
function normalizeBlocks(blocks, sessionId) {
  return blocks.map((block) => ({
    blockId: makeId(`block${block.blockNumber || ""}`),
    sessionId,
    blockNumber: finiteInteger(block.blockNumber),
    ruleType: normalizeRequiredText(block.ruleType, "rule_type"),
    switchFromRule: block.switchFromRule || null,
    round1TimeMs: finiteInteger(block.round1TimeMs),
    round2TimeMs: finiteInteger(block.round2TimeMs),
    round1TokenTotal: finiteInteger(block.round1TokenTotal),
    round2TokenTotal: finiteInteger(block.round2TokenTotal),
    blockAccuracy: finiteNumber(block.blockAccuracy),
    switchCostMs: finiteNumber(block.switchCostMs),
    switchErrorCost: finiteNumber(block.switchErrorCost),
    adaptationCostMs: finiteNumber(block.adaptationCostMs),
    perseverativeErrorCount: finiteInteger(block.perseverativeErrorCount)
  }));
}

// Convert Game 2 placement payloads into database-ready trial rows.
function normalizeTrials(trials, sessionId, blockIdByNumber) {
  return trials
    .filter((trial) => blockIdByNumber.has(finiteInteger(trial.blockNumber)))
    .map((trial) => ({
      trialId: makeId(`trial${trial.trialNumber || ""}`),
      sessionId,
      blockId: blockIdByNumber.get(finiteInteger(trial.blockNumber)),
      trialNumber: finiteInteger(trial.trialNumber),
      blockNumber: finiteInteger(trial.blockNumber),
      ruleType: normalizeRequiredText(trial.ruleType, "rule_type"),
      previousRuleType: trial.previousRuleType || null,
      isSwitchTrial: Boolean(trial.isSwitchTrial),
      tokenColor: trial.tokenColor || null,
      tokenShape: trial.tokenShape || null,
      expectedHole: trial.expectedHole || null,
      placedHole: normalizeRequiredText(trial.placedHole, "placed_hole"),
      reactionTimeMs: finiteInteger(trial.reactionTimeMs),
      isCorrect: Boolean(trial.isCorrect),
      isPerseverativeError: Boolean(trial.isPerseverativeError)
    }));
}

// Pick the more serious of two monitoring labels.
function worseRating(left, right) {
  return RATING_SEVERITY[right] > RATING_SEVERITY[left] ? right : left;
}

// Calculate how far a current value fell below baseline.
function percentageDecline(baselineValue, currentValue) {
  if (!Number.isFinite(baselineValue) || baselineValue <= 0) {
    return 0;
  }

  return Math.max(0, ((baselineValue - currentValue) / baselineValue) * 100);
}

// Require a non-empty string for fields that must exist in the database.
function normalizeRequiredText(value, fieldName) {
  const text = String(value || "").trim();

  if (!text) {
    throw new Error(`${fieldName} is required.`);
  }

  return text;
}

// Numeric coercion helpers keep SQL values finite and predictable.
function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function finiteInteger(value) {
  return Math.round(finiteNumber(value));
}

// SQL escaping helpers protect text values from breaking generated statements.
function sqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNullableText(value) {
  return value === null || value === undefined || value === ""
    ? "NULL"
    : sqlText(value);
}

function sqlNumber(value) {
  return finiteNumber(value).toString();
}

function sqlInteger(value) {
  return finiteInteger(value).toString();
}

// Generate readable ids without needing an external UUID dependency.
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Execute a statement that does not need returned rows.
function runSql(sql) {
  return execSql([dbPath, sql]);
}

// Execute a SELECT and parse sqlite3's JSON output.
async function querySql(sql) {
  const stdout = await execSql(["-json", dbPath, sql]);
  const trimmed = stdout.trim();
  return trimmed ? JSON.parse(trimmed) : [];
}

// Thin wrapper around the system sqlite3 binary used by Electron's main process.
function execSql(args) {
  return new Promise((resolve, reject) => {
    execFile(SQLITE_BIN, args, { maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve(stdout || "");
    });
  });
}

module.exports = {
  initDatabase,
  listParticipants,
  getLeaderboard,
  saveGameSession,
  saveParticipant,
  getOrCreateParticipant,
  createMatch,
  get dbPath() {
    return dbPath;
  }
};
