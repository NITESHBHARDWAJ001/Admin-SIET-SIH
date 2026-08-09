const { v4: uuidv4 } = require("uuid");
const { getSheetsClient } = require("./googleAuth");
const { SCHEMAS } = require("./schema");
const config = require("../../config/env");

const sheetIdCache = new Map();

function fieldsFor(sheetName) {
  const fields = SCHEMAS[sheetName];
  if (!fields) throw new Error(`Unknown sheet: ${sheetName}`);
  return fields;
}

function colLetter(index) {
  let letter = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function cellToValue(raw, key) {
  if (key === "remarks" || key === "collaborators") {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (key === "declaration" || key === "pinned" || key === "visible") {
    return raw === "TRUE" || raw === true || raw === "true";
  }
  return raw === undefined ? "" : raw;
}

function valueToCell(value, key) {
  if (key === "remarks" || key === "collaborators") return JSON.stringify(value || []);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value === null || value === undefined) return "";
  return value;
}

function rowToObject(row, fields) {
  const obj = {};
  fields.forEach((f, i) => {
    obj[f.key] = cellToValue(row[i], f.key);
  });
  return obj;
}

function objectToRow(obj, fields) {
  return fields.map((f) => valueToCell(obj[f.key], f.key));
}

async function getSheetIdByName(sheetName) {
  if (sheetIdCache.has(sheetName)) return sheetIdCache.get(sheetName);
  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId: config.google.spreadsheetId,
  });
  data.sheets.forEach((s) => sheetIdCache.set(s.properties.title, s.properties.sheetId));
  return sheetIdCache.get(sheetName);
}

async function getRows(sheetName) {
  const fields = fieldsFor(sheetName);
  const sheets = getSheetsClient();
  const lastCol = colLetter(fields.length - 1);
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${sheetName}!A2:${lastCol}`,
  });
  const rows = data.values || [];
  return rows
    .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
    .map((row) => rowToObject(row, fields));
}

async function getRowById(sheetName, id) {
  const rows = await getRows(sheetName);
  return rows.find((row) => row.id === id) || null;
}

async function findRowNumberById(sheetName, id) {
  const fields = fieldsFor(sheetName);
  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${sheetName}!A2:A`,
  });
  const rows = data.values || [];
  const idx = rows.findIndex((row) => row[0] === id);
  if (idx === -1) return null;
  return idx + 2; // account for header row + 1-indexing
}

async function appendRow(sheetName, row) {
  const fields = fieldsFor(sheetName);
  const newRow = { id: uuidv4(), ...row };
  const sheets = getSheetsClient();
  const lastCol = colLetter(fields.length - 1);
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.google.spreadsheetId,
    range: `${sheetName}!A1:${lastCol}1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [objectToRow(newRow, fields)] },
  });
  return newRow;
}

async function updateRow(sheetName, id, patch) {
  const fields = fieldsFor(sheetName);
  const existing = await getRowById(sheetName, id);
  if (!existing) return null;

  const rowNumber = await findRowNumberById(sheetName, id);
  if (!rowNumber) return null;

  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  const sheets = getSheetsClient();
  const lastCol = colLetter(fields.length - 1);
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.google.spreadsheetId,
    range: `${sheetName}!A${rowNumber}:${lastCol}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [objectToRow(updated, fields)] },
  });
  return updated;
}

async function deleteRow(sheetName, id) {
  const rowNumber = await findRowNumberById(sheetName, id);
  if (!rowNumber) return false;

  const sheetId = await getSheetIdByName(sheetName);
  const sheets = getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: config.google.spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
  return true;
}

// Reads an arbitrary sheet by name (e.g. a Google Form's linked response
// tab) without requiring it to be declared in schema.js — returns the raw
// header row and data rows as-is, positional, no key mapping.
async function getRawSheet(sheetName) {
  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${sheetName}!A1:ZZ`,
  });
  const [header, ...rows] = data.values || [[]];
  return { header: header || [], rows };
}

module.exports = { getRows, getRowById, appendRow, updateRow, deleteRow, getRawSheet };
