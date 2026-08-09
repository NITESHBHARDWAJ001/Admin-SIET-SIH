const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const { nextTeamId } = require("../utils/registrationHelpers");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const MEMBER_NUMBERS = [2, 3, 4, 5, 6];

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
    "githubLinkOpen",
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

async function lookupPublicTeam(req, res) {
  const query = sanitizeString(req.query.query).toLowerCase();
  if (!query) return res.status(400).json({ message: "Enter a Team ID or leader email to search" });

  const teams = await sheetsService.getRows("Registration");
  const team = teams.find(
    (t) =>
      t.teamId?.toLowerCase() === query || t.teamLeaderEmailAddress?.toLowerCase() === query
  );

  if (!team) {
    return res.status(404).json({ message: "No team found with that Team ID or email" });
  }
  if (team.status !== "Approved") {
    return res.status(403).json({
      message: `Team ${team.teamId} is ${team.status.toLowerCase()} and not yet approved to submit`,
    });
  }

  res.json({ data: { teamId: team.teamId, teamName: team.teamName } });
}

async function createOrUpdatePublicSubmission(req, res) {
  const submissionOpen = await getSettingValue("submissionOpen", "false");
  if (submissionOpen !== "true") {
    return res.status(403).json({ message: "Submissions are currently closed" });
  }

  const body = req.body || {};
  const teamId = sanitizeString(body.teamId);
  if (!teamId) return res.status(400).json({ message: "teamId is required" });

  const teams = await sheetsService.getRows("Registration");
  const team = teams.find((t) => t.teamId === teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });
  if (team.status !== "Approved") {
    return res.status(403).json({ message: "Only approved teams can submit" });
  }

  const hasAnyLink = body.githubRepository || body.ppt || body.demoVideo;
  if (!hasAnyLink) {
    return res.status(400).json({ message: "Provide at least one of: repository, PPT, or demo video link" });
  }

  const submissions = await sheetsService.getRows("Submission");
  const existing = submissions.find((s) => s.teamId === teamId);

  const payload = {
    teamId,
    teamName: team.teamName,
    githubRepository: sanitizeString(body.githubRepository),
    ppt: sanitizeString(body.ppt),
    demoVideo: sanitizeString(body.demoVideo),
    description: sanitizeString(body.description).slice(0, 1000),
    submissionTime: new Date().toISOString(),
    status: "Pending",
  };

  let saved;
  if (existing) {
    saved = await sheetsService.updateRow("Submission", existing.id, payload);
  } else {
    saved = await sheetsService.appendRow("Submission", { ...payload, remarks: [], createdAt: new Date().toISOString() });
  }

  await logAction(
    { user: null, ip: req.ip },
    existing ? "Public Submission Updated" : "Public Submission Created",
    `${team.teamName} (${teamId})`
  );

  res.status(existing ? 200 : 201).json({ data: { teamId: saved.teamId, status: saved.status } });
}

async function listPublicResources(req, res) {
  const resources = await sheetsService.getRows("Resources");
  const visible = resources
    .filter((r) => r.visible)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .map((r) => ({ id: r.id, name: r.name, category: r.category, url: r.url }));
  res.json({ data: visible });
}

async function lookupTeamMembers(req, res) {
  const githubLinkOpen = await getSettingValue("githubLinkOpen", "true");
  if (githubLinkOpen !== "true") {
    return res.status(403).json({ message: "GitHub account linking is currently closed" });
  }

  const teamId = sanitizeString(req.params.teamId);
  if (!teamId) return res.status(400).json({ message: "Team ID is required" });

  const teams = await sheetsService.getRows("Registration");
  const team = teams.find((t) => t.teamId.toLowerCase() === teamId.toLowerCase());

  if (!team) return res.status(404).json({ message: "No team found with that Team ID" });
  if (team.status !== "Approved") {
    return res.status(403).json({
      message: `Team ${team.teamId} is ${team.status.toLowerCase()} and not yet approved for repository setup`,
    });
  }

  const members = [
    {
      role: "Leader",
      fullName: team.teamLeaderFullName,
      rollNumber: team.teamLeaderRollNumber,
      githubUsername: team.teamLeaderGithubUsername || "",
      fieldKey: "teamLeaderGithubUsername",
    },
  ];

  MEMBER_NUMBERS.forEach((n) => {
    if (team[`member${n}FullName`]) {
      members.push({
        role: `Member ${n}`,
        fullName: team[`member${n}FullName`],
        rollNumber: team[`member${n}RollNumber`],
        githubUsername: team[`member${n}GithubUsername`] || "",
        fieldKey: `member${n}GithubUsername`,
      });
    }
  });

  res.json({ data: { teamId: team.teamId, teamName: team.teamName, members } });
}

async function saveTeamGithubUsernames(req, res) {
  const githubLinkOpen = await getSettingValue("githubLinkOpen", "true");
  if (githubLinkOpen !== "true") {
    return res.status(403).json({ message: "GitHub account linking is currently closed" });
  }

  const teamId = sanitizeString(req.params.teamId);
  const body = req.body || {};

  const teams = await sheetsService.getRows("Registration");
  const team = teams.find((t) => t.teamId.toLowerCase() === teamId.toLowerCase());

  if (!team) return res.status(404).json({ message: "Team not found" });
  if (team.status !== "Approved") {
    return res.status(403).json({ message: "Only approved teams can set up a repository" });
  }

  const validKeys = ["teamLeaderGithubUsername", ...MEMBER_NUMBERS.map((n) => `member${n}GithubUsername`)];
  const patch = {};

  for (const key of validKeys) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const value = sanitizeString(body[key]);
    if (value && !GITHUB_USERNAME_RE.test(value)) {
      return res.status(400).json({ message: `"${value}" is not a valid GitHub username` });
    }
    patch[key] = value;
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ message: "No GitHub usernames provided" });
  }

  const updated = await sheetsService.updateRow("Registration", team.id, patch);
  await logAction(
    { user: null, ip: req.ip },
    "GitHub Usernames Linked",
    `${team.teamName} (${team.teamId})`
  );

  res.json({ data: { teamId: updated.teamId, teamName: updated.teamName } });
}

module.exports = {
  getPublicSettings,
  listPublicAnnouncements,
  createPublicRegistration,
  lookupPublicTeam,
  createOrUpdatePublicSubmission,
  listPublicResources,
  lookupTeamMembers,
  saveTeamGithubUsernames,
};
