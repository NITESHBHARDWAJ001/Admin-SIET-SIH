const express = require("express");
const {
  listRegistrations,
  getRegistration,
  updateRegistration,
  addRemark,
  deleteRegistration,
  exportRegistrations,
  generatePassword,
  bulkGeneratePasswords,
} = require("../controllers/registrationController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

const canManage = requireRole("SuperAdmin", "FacultyCoordinator");

router.use(requireAuth);

router.get("/export", exportRegistrations);
router.get("/", listRegistrations);
router.post("/generate-passwords", canManage, bulkGeneratePasswords);
router.get("/:id", getRegistration);
router.patch("/:id", updateRegistration);
router.post("/:id/remarks", addRemark);
router.post("/:id/generate-password", canManage, generatePassword);
router.delete("/:id", deleteRegistration);

module.exports = router;
