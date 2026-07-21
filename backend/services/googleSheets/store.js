const fs = require("fs");
const path = require("path");
const { buildRegistrations, users } = require("../../data/seedData");

const DB_PATH = path.join(__dirname, "..", "..", "data", "mockDb.json");

function seed() {
  return {
    Registration: buildRegistrations(24),
    Users: users,
    AuditLogs: [],
  };
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = seed();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function save(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

let db = load();

function getSheet(sheetName) {
  if (!db[sheetName]) db[sheetName] = [];
  return db[sheetName];
}

function persist() {
  save(db);
}

function reset() {
  db = seed();
  persist();
}

module.exports = { getSheet, persist, reset };
