const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getPublicSettings,
  listPublicAnnouncements,
  createPublicRegistration,
  authenticateTeamForSubmission,
  createOrUpdatePublicSubmission,
  listPublicResources,
  listPublicProblemStatements,
  authenticateTeamForSelection,
  selectProblemStatement,
} = require("../controllers/publicController");

const router = express.Router();

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/settings", readLimiter, getPublicSettings);
router.get("/announcements", readLimiter, listPublicAnnouncements);
router.get("/resources", readLimiter, listPublicResources);
router.get("/problem-statements", readLimiter, listPublicProblemStatements);
router.post("/problem-statements/auth", authLimiter, authenticateTeamForSelection);
router.post("/problem-statements/select", authLimiter, selectProblemStatement);
router.post("/registrations", writeLimiter, createPublicRegistration);
router.post("/submissions/auth", authLimiter, authenticateTeamForSubmission);
router.post("/submissions", writeLimiter, createOrUpdatePublicSubmission);

module.exports = router;
