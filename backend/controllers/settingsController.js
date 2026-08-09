const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

const DEFAULTS = {
  registrationOpen: "true",
  submissionOpen: "false",
  problemSelectionOpen: "false",
  evaluationOpen: "false",
  resultsPublished: "false",
  currentPhase: "Registration Open",
  registrationFormUrl: "",
  submissionFormUrl: "",
  importantDates: "[]",
  formResponsesSheetName: "Form Responses 1",
  lastSyncedFormRow: "0",
};

async function getSettings(req, res) {
  const rows = await sheetsService.getRows("Settings");
  const settings = { ...DEFAULTS };
  rows.forEach((row) => {
    settings[row.key] = row.value;
  });
  res.json({ data: settings });
}

async function updateSettings(req, res) {
  const patch = req.body || {};
  const rows = await sheetsService.getRows("Settings");

  for (const [key, value] of Object.entries(patch)) {
    const existing = rows.find((r) => r.key === key);
    if (existing) {
      await sheetsService.updateRow("Settings", existing.id, { value: String(value) });
    } else {
      await sheetsService.appendRow("Settings", { key, value: String(value) });
    }
  }

  await logAction(req, "Settings Updated", Object.keys(patch).join(", "));

  const updatedRows = await sheetsService.getRows("Settings");
  const settings = { ...DEFAULTS };
  updatedRows.forEach((row) => {
    settings[row.key] = row.value;
  });
  res.json({ data: settings });
}

module.exports = { getSettings, updateSettings };
