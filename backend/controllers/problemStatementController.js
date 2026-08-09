const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

function nextProblemId(existing) {
  let max = 0;
  existing.forEach((p) => {
    const match = /^PS-(\d+)$/.exec(p.problemId || "");
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `PS-${String(max + 1).padStart(3, "0")}`;
}

async function withCounts(statements) {
  const teams = await sheetsService.getRows("Registration");
  const counts = {};
  teams.forEach((t) => {
    if (t.selectedProblemStatementId) {
      counts[t.selectedProblemStatementId] = (counts[t.selectedProblemStatementId] || 0) + 1;
    }
  });
  return statements.map((p) => {
    const taken = counts[p.problemId] || 0;
    const capacity = Number(p.capacity) || 0;
    return {
      ...p,
      taken,
      remaining: Math.max(0, capacity - taken),
      full: taken >= capacity,
    };
  });
}

async function listProblemStatements(req, res) {
  const statements = await sheetsService.getRows("ProblemStatements");
  const withCountsData = await withCounts(statements);
  res.json({ data: withCountsData });
}

async function createProblemStatement(req, res) {
  const { title, theme, description, capacity } = req.body;
  if (!title || !theme || !capacity) {
    return res.status(400).json({ message: "Title, theme and capacity are required" });
  }
  if (Number(capacity) <= 0) {
    return res.status(400).json({ message: "Capacity must be a positive number" });
  }

  const existing = await sheetsService.getRows("ProblemStatements");
  const created = await sheetsService.appendRow("ProblemStatements", {
    problemId: nextProblemId(existing),
    title,
    theme,
    description: description || "",
    capacity: Number(capacity),
    createdAt: new Date().toISOString(),
  });

  await logAction(req, "Problem Statement Created", `${created.problemId}: ${title}`);
  res.status(201).json({ data: created });
}

async function updateProblemStatement(req, res) {
  const patch = {};
  ["title", "theme", "description"].forEach((field) => {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  });
  if (req.body.capacity !== undefined) {
    if (Number(req.body.capacity) <= 0) {
      return res.status(400).json({ message: "Capacity must be a positive number" });
    }
    patch.capacity = Number(req.body.capacity);
  }

  const updated = await sheetsService.updateRow("ProblemStatements", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Problem statement not found" });

  await logAction(req, "Problem Statement Updated", `${updated.problemId}: ${updated.title}`);
  res.json({ data: updated });
}

async function deleteProblemStatement(req, res) {
  const statement = await sheetsService.getRowById("ProblemStatements", req.params.id);
  if (!statement) return res.status(404).json({ message: "Problem statement not found" });

  await sheetsService.deleteRow("ProblemStatements", req.params.id);
  await logAction(req, "Problem Statement Deleted", `${statement.problemId}: ${statement.title}`);
  res.json({ message: "Problem statement deleted" });
}

module.exports = {
  listProblemStatements,
  createProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
};
