const express = require("express");
const { syncRegistrationForm } = require("../controllers/syncController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/registration-form", requireAuth, syncRegistrationForm);

module.exports = router;
