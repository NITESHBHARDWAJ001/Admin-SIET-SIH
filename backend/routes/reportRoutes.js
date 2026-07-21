const express = require("express");
const { generateReport, previewReport } = require("../controllers/reportController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/:type/preview", previewReport);
router.get("/:type", generateReport);

module.exports = router;
