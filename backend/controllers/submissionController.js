const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

const EDITABLE_FIELDS = [
  "teamId",
  "teamName",
  "githubRepository",
  "ppt",
  "demoVideo",
  "description",
  "status",
];

async function listSubmissions(req, res) {
  const submissions = await sheetsService.getRows("Submission");
  const filtered = req.query.status
    ? submissions.filter((s) => s.status === req.query.status)
    : submissions;
  res.json({ data: filtered });
}

async function getSubmission(req, res) {
  const submission = await sheetsService.getRowById("Submission", req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  res.json({ data: submission });
}

async function createSubmission(req, res) {
  const { teamId, teamName, githubRepository, ppt, demoVideo, description } = req.body;
  if (!teamId || !teamName) {
    return res.status(400).json({ message: "teamId and teamName are required" });
  }

  const now = new Date().toISOString();
  const created = await sheetsService.appendRow("Submission", {
    teamId,
    teamName,
    githubRepository: githubRepository || "",
    ppt: ppt || "",
    demoVideo: demoVideo || "",
    description: description || "",
    submissionTime: now,
    status: "Pending",
    remarks: [],
    createdAt: now,
  });

  await logAction(req, "Submission Created", `${teamName} (${teamId})`);
  res.status(201).json({ data: created });
}

async function updateSubmission(req, res) {
  const patch = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      patch[field] = req.body[field];
    }
  }

  const updated = await sheetsService.updateRow("Submission", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Submission not found" });

  const action = patch.status ? `Submission ${patch.status}` : "Submission Edited";
  await logAction(req, action, `${updated.teamName} (${updated.teamId})`);
  res.json({ data: updated });
}

async function addRemark(req, res) {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: "Remark text is required" });

  const submission = await sheetsService.getRowById("Submission", req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });

  const remark = {
    id: Date.now().toString(),
    text: text.trim(),
    author: req.user.name,
    timestamp: new Date().toISOString(),
  };
  const remarks = [...(submission.remarks || []), remark];
  const updated = await sheetsService.updateRow("Submission", req.params.id, { remarks });

  await logAction(req, "Submission Remark Added", `${submission.teamName}: "${remark.text}"`);
  res.json({ data: updated });
}

async function deleteSubmission(req, res) {
  const submission = await sheetsService.getRowById("Submission", req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });

  await sheetsService.deleteRow("Submission", req.params.id);
  await logAction(req, "Submission Deleted", `${submission.teamName} (${submission.teamId})`);
  res.json({ message: "Submission deleted" });
}

module.exports = {
  listSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  addRemark,
  deleteSubmission,
};
