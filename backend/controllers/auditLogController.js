const sheetsService = require("../services/googleSheets/sheetsService");

async function listAuditLogs(req, res) {
  const logs = await sheetsService.getRows("AuditLogs");
  logs.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 25);
  const start = (page - 1) * pageSize;

  res.json({
    data: logs.slice(start, start + pageSize),
    total: logs.length,
    page,
    pageSize,
  });
}

module.exports = { listAuditLogs };
