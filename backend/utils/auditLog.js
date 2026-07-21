const sheetsService = require("../services/googleSheets/sheetsService");

async function logAction(req, action, details) {
  await sheetsService.appendRow("AuditLogs", {
    user: req.user ? `${req.user.name} (${req.user.email})` : "System",
    role: req.user ? req.user.role : null,
    action,
    details: details || "",
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { logAction };
