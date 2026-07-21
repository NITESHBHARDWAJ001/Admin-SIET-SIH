const express = require("express");
const {
  listRegistrations,
  getRegistration,
  updateRegistration,
  addRemark,
  deleteRegistration,
  exportRegistrations,
} = require("../controllers/registrationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/export", exportRegistrations);
router.get("/", listRegistrations);
router.get("/:id", getRegistration);
router.patch("/:id", updateRegistration);
router.post("/:id/remarks", addRemark);
router.delete("/:id", deleteRegistration);

module.exports = router;
