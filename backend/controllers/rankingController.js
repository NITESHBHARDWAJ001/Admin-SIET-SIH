const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const { departmentOf } = require("../utils/registrationHelpers");

function average(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function getRanking(req, res) {
  const [teams, evaluations] = await Promise.all([
    sheetsService.getRows("Registration"),
    sheetsService.getRows("Evaluation"),
  ]);

  const byTeam = new Map();
  evaluations.forEach((e) => {
    if (!byTeam.has(e.teamId)) byTeam.set(e.teamId, []);
    byTeam.get(e.teamId).push(e);
  });

  const rows = teams
    .filter((t) => byTeam.has(t.teamId))
    .map((t) => {
      const evals = byTeam.get(t.teamId);
      const judges = [...new Set(evals.map((e) => e.judgeName).filter(Boolean))];
      return {
        teamId: t.teamId,
        registrationId: t.id,
        teamName: t.teamName,
        department: departmentOf(t),
        judges: judges.join(", "),
        score: Math.round(average(evals.map((e) => Number(e.total) || 0)) * 100) / 100,
        innovation: average(evals.map((e) => Number(e.innovationCreativity) || 0)),
        problemUnderstanding: average(evals.map((e) => Number(e.problemUnderstanding) || 0)),
        technicalFeasibility: average(evals.map((e) => Number(e.technicalFeasibility) || 0)),
        evaluationCount: evals.length,
        rankingStatus: t.rankingStatus || null,
      };
    });

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.innovation !== a.innovation) return b.innovation - a.innovation;
    if (b.problemUnderstanding !== a.problemUnderstanding) {
      return b.problemUnderstanding - a.problemUnderstanding;
    }
    return b.technicalFeasibility - a.technicalFeasibility;
  });

  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  res.json({ data: rows });
}

async function setRankingStatus(req, res) {
  const { rankingStatus } = req.body;
  if (!["Shortlisted", "Waitlisted", "Rejected", ""].includes(rankingStatus)) {
    return res.status(400).json({ message: "Invalid ranking status" });
  }

  const updated = await sheetsService.updateRow("Registration", req.params.id, { rankingStatus });
  if (!updated) return res.status(404).json({ message: "Team not found" });

  await logAction(req, "Ranking Status Updated", `${updated.teamName} -> ${rankingStatus || "Cleared"}`);
  res.json({ data: updated });
}

module.exports = { getRanking, setRankingStatus };
