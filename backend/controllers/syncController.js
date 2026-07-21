const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const { REGISTRATION_FORM_HEADER_MAP } = require("../utils/formFieldMap");
const { nextTeamId } = require("../utils/registrationHelpers");

async function getSetting(key, fallback) {
  const rows = await sheetsService.getRows("Settings");
  const row = rows.find((r) => r.key === key);
  return row ? row.value : fallback;
}

async function setSetting(key, value) {
  const rows = await sheetsService.getRows("Settings");
  const existing = rows.find((r) => r.key === key);
  if (existing) {
    await sheetsService.updateRow("Settings", existing.id, { value: String(value) });
  } else {
    await sheetsService.appendRow("Settings", { key, value: String(value) });
  }
}

async function syncRegistrationForm(req, res) {
  const sheetName = await getSetting("formResponsesSheetName", "Form Responses 1");
  const lastSyncedRow = Number(await getSetting("lastSyncedFormRow", "0")) || 0;

  let raw;
  try {
    raw = await sheetsService.getRawSheet(sheetName);
  } catch (err) {
    return res.status(400).json({
      message: `Could not read sheet "${sheetName}". Make sure the form is linked to this spreadsheet and the tab name matches (configurable in Settings).`,
    });
  }

  const { header, rows } = raw;
  const headerIndex = {};
  header.forEach((h, i) => {
    headerIndex[h.trim()] = i;
  });

  const newRows = rows.slice(lastSyncedRow);
  if (newRows.length === 0) {
    return res.json({ imported: 0, message: "No new responses to import" });
  }

  const existingTeams = await sheetsService.getRows("Registration");
  const imported = [];

  for (const row of newRows) {
    const record = { status: "Pending", remarks: [] };

    for (const [headerName, key] of Object.entries(REGISTRATION_FORM_HEADER_MAP)) {
      const idx = headerIndex[headerName];
      const rawValue = idx !== undefined ? row[idx] : undefined;
      record[key] = key === "declaration" ? Boolean(rawValue && rawValue.trim()) : rawValue || "";
    }

    const timestampIdx = headerIndex["Timestamp"];
    record.timestamp = timestampIdx !== undefined && row[timestampIdx]
      ? new Date(row[timestampIdx]).toISOString()
      : new Date().toISOString();

    if (!record.teamName || !record.teamLeaderEmailAddress) continue;

    record.teamId = nextTeamId([...existingTeams, ...imported]);

    const created = await sheetsService.appendRow("Registration", record);
    imported.push(created);
  }

  await setSetting("lastSyncedFormRow", rows.length);
  await logAction(req, "Registration Form Synced", `${imported.length} new registration(s) imported`);

  res.json({ imported: imported.length, teams: imported.map((t) => t.teamId) });
}

module.exports = { syncRegistrationForm };
