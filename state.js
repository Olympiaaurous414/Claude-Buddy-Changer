const fs = require('fs');
const os = require('os');
const path = require('path');

function getStateFilePath() {
  return process.env.CLAUDE_BUDDY_CHANGER_STATE_FILE || path.join(os.homedir(), '.claude-buddy-changer.json');
}

function readState() {
  const filePath = getStateFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      return { version: 1, binaries: {} };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      binaries: parsed.binaries || {},
    };
  } catch {
    return { version: 1, binaries: {} };
  }
}

function writeState(state) {
  const filePath = getStateFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function getRecordedOriginalSalt(binaryPath) {
  const state = readState();
  return state.binaries[binaryPath]?.originalSalt || null;
}

function recordOriginalSalt(binaryPath, originalSalt) {
  const state = readState();
  if (state.binaries[binaryPath]?.originalSalt) {
    return false;
  }
  state.binaries[binaryPath] = {
    originalSalt,
    recordedAt: new Date().toISOString(),
  };
  writeState(state);
  return true;
}

module.exports = {
  getRecordedOriginalSalt,
  getStateFilePath,
  recordOriginalSalt,
};
