const express = require("express");
const {
  listProblemStatements,
  createProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
} = require("../controllers/problemStatementController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

const canManage = requireRole("SuperAdmin", "FacultyCoordinator");

router.use(requireAuth);

router.get("/", listProblemStatements);
router.post("/", canManage, createProblemStatement);
router.patch("/:id", canManage, updateProblemStatement);
router.delete("/:id", canManage, deleteProblemStatement);

module.exports = router;
