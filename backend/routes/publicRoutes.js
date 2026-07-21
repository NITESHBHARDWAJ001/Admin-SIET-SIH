const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getPublicSettings,
  listPublicAnnouncements,
  createPublicRegistration,
} = require("../controllers/publicController");

const router = express.Router();

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many registration attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/settings", readLimiter, getPublicSettings);
router.get("/announcements", readLimiter, listPublicAnnouncements);
router.post("/registrations", registrationLimiter, createPublicRegistration);

module.exports = router;
