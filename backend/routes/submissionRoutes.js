const express = require("express");
const {
  listSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  addRemark,
  deleteSubmission,
} = require("../controllers/submissionController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", listSubmissions);
router.post("/", createSubmission);
router.get("/:id", getSubmission);
router.patch("/:id", updateSubmission);
router.post("/:id/remarks", addRemark);
router.delete("/:id", deleteSubmission);

module.exports = router;
