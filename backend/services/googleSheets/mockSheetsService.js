const { v4: uuidv4 } = require("uuid");
const store = require("./store");

async function getRows(sheetName) {
  return store.getSheet(sheetName).slice();
}

async function getRowById(sheetName, id) {
  return store.getSheet(sheetName).find((row) => row.id === id) || null;
}

async function appendRow(sheetName, row) {
  const rows = store.getSheet(sheetName);
  const newRow = { id: uuidv4(), ...row };
  rows.push(newRow);
  store.persist();
  return newRow;
}

async function updateRow(sheetName, id, patch) {
  const rows = store.getSheet(sheetName);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
  store.persist();
  return rows[idx];
}

async function deleteRow(sheetName, id) {
  const rows = store.getSheet(sheetName);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return false;
  rows.splice(idx, 1);
  store.persist();
  return true;
}

async function getRawSheet() {
  throw new Error("Form response sync is only available against a real Google Sheet");
}

module.exports = { getRows, getRowById, appendRow, updateRow, deleteRow, getRawSheet };
