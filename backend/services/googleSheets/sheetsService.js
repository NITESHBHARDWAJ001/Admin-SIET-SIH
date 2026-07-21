const config = require("../../config/env");

const impl = config.useMockSheets
  ? require("./mockSheetsService")
  : require("./googleSheetsService");

module.exports = impl;
