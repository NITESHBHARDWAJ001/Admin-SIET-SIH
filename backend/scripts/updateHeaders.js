// Rewrites just the header row (row 1) of every sheet from the current
// schema.js, without touching any existing data rows. Safe to re-run whenever
// schema.js changes (e.g. a new column is added).
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { getSheetsClient } = require("../services/googleSheets/googleAuth");
const { SCHEMAS } = require("../services/googleSheets/schema");
const config = require("../config/env");

async function main() {
  const sheets = getSheetsClient();
  const sheetNames = Object.keys(SCHEMAS);

  console.log("Updating headers for:", sheetNames.join(", "));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: config.google.spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: sheetNames.map((sheetName) => ({
        range: `${sheetName}!A1`,
        values: [SCHEMAS[sheetName].map((f) => f.header)],
      })),
    },
  });
  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
