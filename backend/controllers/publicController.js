const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const { nextTeamId } = require("../utils/registrationHelpers");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

const REQUIRED_LEADER_FIELDS = [
  "teamName",
  "teamLeaderFullName",
  "teamLeaderRollNumber",
  "teamLeaderBranchSection",
  "teamLeaderYear",
  "teamLeaderGender",
  "teamLeaderPhoneNumber",
  "teamLeaderEmailAddress",
];

const MEMBER_FIELDS = ["FullName", "RollNumber", "BranchSection", "Year", "Gender", "EmailAddress"];

function sanitizeString(value) {
  return typeof value === "string" ? value.trim().slice(0, 200) : "";
}

async function getSettingValue(key, fallback) {
  const rows = await sheetsService.getRows("Settings");
  const row = rows.find((r) => r.key === key);
  return row ? row.value : fallback;
}

async function getPublicSettings(req, res) {
  const rows = await sheetsService.getRows("Settings");
  const keys = [
    "registrationOpen",
    "submissionOpen",
    "evaluationOpen",
    "resultsPublished",
    "currentPhase",
    "registrationFormUrl",
    "submissionFormUrl",
    "importantDates",
  ];
  const settings = {};
  keys.forEach((key) => {
    const row = rows.find((r) => r.key === key);
    settings[key] = row ? row.value : "";
  });
  res.json({ data: settings });
}

async function listPublicAnnouncements(req, res) {
  const announcements = await sheetsService.getRows("Announcements");
  const today = new Date().toISOString().slice(0, 10);

  const visible = announcements.filter((a) => {
    if (a.visibility === "Hidden") return false;
    if (a.expiryDate && a.expiryDate < today) return false;
    return true;
  });

  visible.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.publishDate || "").localeCompare(a.publishDate || "");
  });

  res.json({
    data: visible.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      priority: a.priority,
      publishDate: a.publishDate,
      pinned: a.pinned,
    })),
  });
}

async function createPublicRegistration(req, res) {
  const registrationOpen = await getSettingValue("registrationOpen", "true");
  if (registrationOpen !== "true") {
    return res.status(403).json({ message: "Registration is currently closed" });
  }

  const body = req.body || {};

  for (const field of REQUIRED_LEADER_FIELDS) {
    if (!sanitizeString(body[field])) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  if (body.declaration !== true) {
    return res.status(400).json({ message: "You must accept the declaration" });
  }
  if (!EMAIL_RE.test(body.teamLeaderEmailAddress)) {
    return res.status(400).json({ message: "Team leader email address is invalid" });
  }
  if (!PHONE_RE.test(body.teamLeaderPhoneNumber)) {
    return res.status(400).json({ message: "Team leader phone number must be 10 digits" });
  }

  const existingTeams = await sheetsService.getRows("Registration");
  const duplicate = existingTeams.find(
    (t) =>
      t.teamLeaderEmailAddress?.toLowerCase() === body.teamLeaderEmailAddress.toLowerCase() ||
      t.teamLeaderRollNumber?.toLowerCase() === body.teamLeaderRollNumber.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({
      message: "A team is already registered with this email or roll number",
    });
  }

  const record = {
    teamId: nextTeamId(existingTeams),
    teamName: sanitizeString(body.teamName),
    status: "Pending",
    remarks: [],
    declaration: true,
    timestamp: new Date().toISOString(),
  };

  REQUIRED_LEADER_FIELDS.forEach((field) => {
    if (field !== "teamName") record[field] = sanitizeString(body[field]);
  });

  for (let n = 2; n <= 6; n++) {
    MEMBER_FIELDS.forEach((suffix) => {
      const key = `member${n}${suffix}`;
      record[key] = sanitizeString(body[key]);
    });
  }

  const created = await sheetsService.appendRow("Registration", record);
  await logAction(
    { user: null, ip: req.ip },
    "Public Registration Submitted",
    `${created.teamName} (${created.teamId})`
  );

  res.status(201).json({ data: { teamId: created.teamId, teamName: created.teamName } });
}

module.exports = { getPublicSettings, listPublicAnnouncements, createPublicRegistration };
