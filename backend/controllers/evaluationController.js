const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const { clampScores, computeTotal } = require("../utils/evaluationCriteria");

async function listEvaluations(req, res) {
  const evaluations = await sheetsService.getRows("Evaluation");
  let filtered = evaluations;
  if (req.query.teamId) filtered = filtered.filter((e) => e.teamId === req.query.teamId);
  if (req.query.judgeId) filtered = filtered.filter((e) => e.judgeId === req.query.judgeId);
  res.json({ data: filtered });
}

// One evaluation row per (teamId, judgeId) pair — creates on first save,
// updates in place on subsequent saves by the same judge for the same team.
async function saveEvaluation(req, res) {
  const { teamId, teamName, judgeId, judgeName, judgeRemarks, facultyRemarks } = req.body;
  if (!teamId || !judgeId) {
    return res.status(400).json({ message: "teamId and judgeId are required" });
  }

  const scores = clampScores(req.body);
  const total = computeTotal(scores);
  const now = new Date().toISOString();

  const existingRows = await sheetsService.getRows("Evaluation");
  const existing = existingRows.find((e) => e.teamId === teamId && e.judgeId === judgeId);

  const payload = {
    teamId,
    teamName: teamName || existing?.teamName || "",
    judgeId,
    judgeName: judgeName || existing?.judgeName || "",
    ...scores,
    total,
    judgeRemarks: judgeRemarks ?? existing?.judgeRemarks ?? "",
    facultyRemarks: facultyRemarks ?? existing?.facultyRemarks ?? "",
    updatedAt: now,
  };

  let saved;
  if (existing) {
    saved = await sheetsService.updateRow("Evaluation", existing.id, payload);
  } else {
    saved = await sheetsService.appendRow("Evaluation", { ...payload, createdAt: now });
  }

  await logAction(req, "Evaluation Saved", `${payload.teamName} scored by ${payload.judgeName} (${total}/100)`);
  res.json({ data: saved });
}

async function updateEvaluation(req, res) {
  const existing = await sheetsService.getRowById("Evaluation", req.params.id);
  if (!existing) return res.status(404).json({ message: "Evaluation not found" });

  const merged = { ...existing, ...req.body };
  const scores = clampScores(merged);
  const total = computeTotal(scores);

  const updated = await sheetsService.updateRow("Evaluation", req.params.id, {
    ...scores,
    total,
    judgeRemarks: merged.judgeRemarks || "",
    facultyRemarks: merged.facultyRemarks || "",
  });

  await logAction(req, "Evaluation Edited", `${updated.teamName} (${total}/100)`);
  res.json({ data: updated });
}

async function deleteEvaluation(req, res) {
  const existing = await sheetsService.getRowById("Evaluation", req.params.id);
  if (!existing) return res.status(404).json({ message: "Evaluation not found" });

  await sheetsService.deleteRow("Evaluation", req.params.id);
  await logAction(req, "Evaluation Deleted", `${existing.teamName} by ${existing.judgeName}`);
  res.json({ message: "Evaluation deleted" });
}

module.exports = { listEvaluations, saveEvaluation, updateEvaluation, deleteEvaluation };
