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
    "problemSelectionOpen",
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

async function listPublicProblemStatements(req, res) {
  const [statements, teams] = await Promise.all([
    sheetsService.getRows("ProblemStatements"),
    sheetsService.getRows("Registration"),
  ]);

  const counts = {};
  teams.forEach((t) => {
    if (t.selectedProblemStatementId) {
      counts[t.selectedProblemStatementId] = (counts[t.selectedProblemStatementId] || 0) + 1;
    }
  });

  const board = statements.map((p) => {
    const taken = counts[p.problemId] || 0;
    const capacity = Number(p.capacity) || 0;
    return {
      problemId: p.problemId,
      title: p.title,
      theme: p.theme,
      description: p.description,
      capacity,
      taken,
      remaining: Math.max(0, capacity - taken),
      full: taken >= capacity,
    };
  });

  res.json({ data: board });
}

async function findTeamByCredentials(teamId, password) {
  const teams = await sheetsService.getRows("Registration");
  const team = teams.find((t) => t.teamId?.toLowerCase() === sanitizeString(teamId).toLowerCase());
  if (!team) return { error: { status: 404, message: "No team found with that Team ID" } };
  if (team.status !== "Approved") {
    return { error: { status: 403, message: "Only approved teams can select a problem statement" } };
  }
  if (!team.teamPassword) {
    return { error: { status: 403, message: "No password has been issued for this team yet" } };
  }
  if (team.teamPassword !== password) {
    return { error: { status: 401, message: "Incorrect password" } };
  }
  return { team };
}

async function authenticateTeamForSelection(req, res) {
  const problemSelectionOpen = await getSettingValue("problemSelectionOpen", "false");
  if (problemSelectionOpen !== "true") {
    return res.status(403).json({ message: "Problem statement selection is currently closed" });
  }

  const { teamId, password } = req.body || {};
  if (!teamId || !password) {
    return res.status(400).json({ message: "Team ID and password are required" });
  }

  const { team, error } = await findTeamByCredentials(teamId, password);
  if (error) return res.status(error.status).json({ message: error.message });

  if (team.selectedProblemStatementId) {
    return res.json({
      data: {
        teamId: team.teamId,
        teamName: team.teamName,
        locked: true,
        selection: {
          problemId: team.selectedProblemStatementId,
          title: team.selectedProblemStatementTitle,
          lockedAt: team.selectionLockedAt,
        },
      },
    });
  }

  const statements = await sheetsService.getRows("ProblemStatements");
  const allTeams = await sheetsService.getRows("Registration");
  const counts = {};
  allTeams.forEach((t) => {
    if (t.selectedProblemStatementId) {
      counts[t.selectedProblemStatementId] = (counts[t.selectedProblemStatementId] || 0) + 1;
    }
  });

  const available = statements
    .map((p) => {
      const taken = counts[p.problemId] || 0;
      const capacity = Number(p.capacity) || 0;
      return {
        problemId: p.problemId,
        title: p.title,
        theme: p.theme,
        description: p.description,
        capacity,
        remaining: Math.max(0, capacity - taken),
      };
    })
    .filter((p) => p.remaining > 0);

  res.json({
    data: { teamId: team.teamId, teamName: team.teamName, locked: false, available },
  });
}

async function selectProblemStatement(req, res) {
  const problemSelectionOpen = await getSettingValue("problemSelectionOpen", "false");
  if (problemSelectionOpen !== "true") {
    return res.status(403).json({ message: "Problem statement selection is currently closed" });
  }

  const { teamId, password, problemId } = req.body || {};
  if (!teamId || !password || !problemId) {
    return res.status(400).json({ message: "Team ID, password and problemId are required" });
  }

  const { team, error } = await findTeamByCredentials(teamId, password);
  if (error) return res.status(error.status).json({ message: error.message });

  if (team.selectedProblemStatementId) {
    return res.status(409).json({
      message: `Your team has already selected ${team.selectedProblemStatementTitle}. Selection is one-time only.`,
    });
  }

  const statements = await sheetsService.getRows("ProblemStatements");
  const statement = statements.find((p) => p.problemId === problemId);
  if (!statement) return res.status(404).json({ message: "Problem statement not found" });

  const allTeams = await sheetsService.getRows("Registration");
  const taken = allTeams.filter((t) => t.selectedProblemStatementId === problemId).length;
  const capacity = Number(statement.capacity) || 0;
  if (taken >= capacity) {
    return res.status(409).json({ message: "This problem statement just filled up. Please pick another." });
  }

  const lockedAt = new Date().toISOString();
  const updated = await sheetsService.updateRow("Registration", team.id, {
    selectedProblemStatementId: statement.problemId,
    selectedProblemStatementTitle: statement.title,
    selectionLockedAt: lockedAt,
  });

  await logAction(
    { user: null, ip: req.ip },
    "Problem Statement Selected",
    `${team.teamName} (${team.teamId}) -> ${statement.problemId}: ${statement.title}`
  );

  res.json({
    data: {
      teamId: updated.teamId,
      selection: { problemId: statement.problemId, title: statement.title, lockedAt },
    },
  });
}

module.exports = {
  getPublicSettings,
  listPublicAnnouncements,
  createPublicRegistration,
  lookupPublicTeam,
  createOrUpdatePublicSubmission,
  listPublicResources,
  listPublicProblemStatements,
  authenticateTeamForSelection,
  selectProblemStatement,
};
