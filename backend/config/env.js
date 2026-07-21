require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: required("JWT_SECRET", "dev-only-insecure-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  useMockSheets: process.env.USE_MOCK_SHEETS !== "false",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  google: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    privateKey: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
  },
};
