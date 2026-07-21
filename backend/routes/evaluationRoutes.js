const express = require("express");
const {
  listEvaluations,
  saveEvaluation,
  updateEvaluation,
  deleteEvaluation,
} = require("../controllers/evaluationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", listEvaluations);
router.post("/", saveEvaluation);
router.patch("/:id", updateEvaluation);
router.delete("/:id", deleteEvaluation);

module.exports = router;
