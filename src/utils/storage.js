const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

function ensureFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

function readJson(fileName, fallback) {
  const filePath = path.join(DATA_DIR, fileName);
  ensureFile(filePath, fallback);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content || 'null');
}

function writeJson(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  DATA_DIR,
  readJson,
  writeJson,
};
