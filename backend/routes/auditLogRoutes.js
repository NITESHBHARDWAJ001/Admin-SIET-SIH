const express = require("express");
const { listAuditLogs } = require("../controllers/auditLogController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listAuditLogs);

module.exports = router;
