const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getPublicSettings,
  listPublicAnnouncements,
  createPublicRegistration,
  lookupPublicTeam,
  createOrUpdatePublicSubmission,
  listPublicResources,
  lookupTeamMembers,
  saveTeamGithubUsernames,
} = require("../controllers/publicController");

const router = express.Router();

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many lookup attempts. Please try again later." },
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
router.get("/resources", readLimiter, listPublicResources);
router.get("/teams/lookup", lookupLimiter, lookupPublicTeam);
router.get("/teams/:teamId/members", lookupLimiter, lookupTeamMembers);
router.patch("/teams/:teamId/github", writeLimiter, saveTeamGithubUsernames);
router.post("/registrations", writeLimiter, createPublicRegistration);
router.post("/submissions", writeLimiter, createOrUpdatePublicSubmission);

module.exports = router;
