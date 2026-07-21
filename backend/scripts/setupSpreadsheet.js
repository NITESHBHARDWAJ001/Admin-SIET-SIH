// One-time provisioning script: adds all sheets/headers from the master spec
// to an EXISTING spreadsheet (already shared with the service account as
// Editor), seeds Registration + Users with sample data, and writes the
// spreadsheet ID back into backend/.env.
//
// Usage: node scripts/setupSpreadsheet.js <spreadsheetId>
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { getSheetsClient } = require("../services/googleSheets/googleAuth");
const { SCHEMAS } = require("../services/googleSheets/schema");
const { buildRegistrations } = require("../data/seedData");

const spreadsheetId = process.argv[2];
if (!spreadsheetId) {
  console.error("Usage: node scripts/setupSpreadsheet.js <spreadsheetId>");
  process.exit(1);
}

const SHEET_ORDER = [
  "Registration",
  "Submission",
  "Evaluation",
  "PresentationSchedule",
  "Announcements",
  "Resources",
  "Settings",
  "Users",
  "AuditLogs",
];

function objectToRow(obj, fields) {
  return fields.map((f) => {
    const value = obj[f.key];
    if (f.key === "remarks") return JSON.stringify(value || []);
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (value === null || value === undefined) return "";
    return value;
  });
}

async function buildUsers() {
  return [
    {
      id: uuidv4(),
      name: "Dr. Super Admin",
      email: "superadmin@siet.ac.in",
      passwordHash: await bcrypt.hash("Admin@123", 10),
      role: "SuperAdmin",
    },
    {
      id: uuidv4(),
      name: "Faculty Coordinator",
      email: "faculty@siet.ac.in",
      passwordHash: await bcrypt.hash("Faculty@123", 10),
      role: "FacultyCoordinator",
    },
  ];
}

async function main() {
  const sheets = getSheetsClient();

  console.log("Reading existing spreadsheet...");
  const { data: existing } = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = existing.sheets.map((s) => s.properties.title);
  console.log("Existing tabs:", existingTitles.join(", "));

  const missing = SHEET_ORDER.filter((title) => !existingTitles.includes(title));
  if (missing.length > 0) {
    console.log("Adding missing tabs:", missing.join(", "));
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
  }

  // Remove the default blank "Sheet1" if it's untouched and not one we need.
  const defaultSheet = existing.sheets.find((s) => s.properties.title === "Sheet1");
  if (defaultSheet && !SHEET_ORDER.includes("Sheet1")) {
    console.log("Removing default Sheet1 tab...");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ deleteSheet: { sheetId: defaultSheet.properties.sheetId } }],
      },
    });
  }

  console.log("Writing headers...");
  const headerRequests = SHEET_ORDER.map((sheetName) => ({
    range: `${sheetName}!A1`,
    values: [SCHEMAS[sheetName].map((f) => f.header)],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data: headerRequests },
  });

  console.log("Clearing any old data rows before reseeding...");
  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: { ranges: ["Registration!A2:ZZ", "Users!A2:ZZ"] },
  });

  console.log("Seeding Registration...");
  const registrations = buildRegistrations(24);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Registration!A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: registrations.map((r) => objectToRow(r, SCHEMAS.Registration)) },
  });

  console.log("Seeding Users...");
  const users = await buildUsers();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Users!A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: users.map((u) => objectToRow(u, SCHEMAS.Users)) },
  });

  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");
  envContent = envContent.replace(
    /GOOGLE_SPREADSHEET_ID=.*/,
    `GOOGLE_SPREADSHEET_ID=${spreadsheetId}`
  );
  fs.writeFileSync(envPath, envContent);

  console.log("\nDone!");
  console.log("Spreadsheet URL: https://docs.google.com/spreadsheets/d/" + spreadsheetId);
  console.log("GOOGLE_SPREADSHEET_ID written to backend/.env");
  console.log("\nSeeded login credentials:");
  console.log("  superadmin@siet.ac.in / Admin@123");
  console.log("  faculty@siet.ac.in / Faculty@123");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
