const { google } = require("googleapis");
const config = require("../../config/env");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

let authClient = null;

function getAuth() {
  if (!authClient) {
    authClient = new google.auth.JWT({
      email: config.google.serviceAccountEmail,
      key: config.google.privateKey,
      scopes: SCOPES,
    });
  }
  return authClient;
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

module.exports = { getAuth, getSheetsClient, getDriveClient };
