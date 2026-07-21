const sheetsService = require("../services/googleSheets/sheetsService");
const { sendExport } = require("../utils/exportUtil");
const { departmentOf, EXPORT_COLUMNS } = require("../utils/registrationHelpers");

const SUBMISSION_COLUMNS = [
  { key: "teamId", label: "Team ID" },
  { key: "teamName", label: "Team Name" },
  { key: "githubRepository", label: "GitHub Repository" },
  { key: "ppt", label: "PPT" },
  { key: "demoVideo", label: "Demo Video" },
  { key: "status", label: "Status" },
  { key: "submissionTime", label: "Submission Time" },
];

const EVALUATION_COLUMNS = [
  { key: "teamId", label: "Team ID" },
  { key: "teamName", label: "Team Name" },
  { key: "judgeName", label: "Judge" },
  { key: "total", label: "Total Score" },
  { key: "judgeRemarks", label: "Judge Remarks" },
];

const GROUP_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "count", label: "Count" },
];

function groupCount(items, keyFn) {
  const counts = {};
  items.forEach((item) => {
    const key = keyFn(item) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

const REPORT_BUILDERS = {
  registration: async () => ({
    rows: await sheetsService.getRows("Registration"),
    columns: EXPORT_COLUMNS,
  }),
  department: async () => ({
    rows: groupCount(await sheetsService.getRows("Registration"), departmentOf),
    columns: GROUP_COLUMNS,
  }),
  year: async () => ({
    rows: groupCount(await sheetsService.getRows("Registration"), (t) => t.teamLeaderYear),
    columns: GROUP_COLUMNS,
  }),
  submission: async () => ({
    rows: await sheetsService.getRows("Submission"),
    columns: SUBMISSION_COLUMNS,
  }),
  evaluation: async () => ({
    rows: await sheetsService.getRows("Evaluation"),
    columns: EVALUATION_COLUMNS,
  }),
  selected: async () => ({
    rows: (await sheetsService.getRows("Registration")).filter(
      (t) => t.rankingStatus === "Shortlisted"
    ),
    columns: EXPORT_COLUMNS,
  }),
  rejected: async () => ({
    rows: (await sheetsService.getRows("Registration")).filter(
      (t) => t.status === "Rejected" || t.rankingStatus === "Rejected"
    ),
    columns: EXPORT_COLUMNS,
  }),
};

async function generateReport(req, res) {
  const { type } = req.params;
  const builder = REPORT_BUILDERS[type];
  if (!builder) return res.status(404).json({ message: `Unknown report type: ${type}` });

  const { rows, columns } = await builder();
  const format = req.query.format === "xlsx" ? "xlsx" : "csv";
  await sendExport(res, rows, columns, format, `${type}-report`);
}

async function previewReport(req, res) {
  const { type } = req.params;
  const builder = REPORT_BUILDERS[type];
  if (!builder) return res.status(404).json({ message: `Unknown report type: ${type}` });

  const { rows } = await builder();
  res.json({ data: rows });
}

module.exports = { generateReport, previewReport, REPORT_TYPES: Object.keys(REPORT_BUILDERS) };
