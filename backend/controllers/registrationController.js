const ExcelJS = require("exceljs");
const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");
const { toCsv } = require("../utils/csv");
const {
  departmentOf,
  toListItem,
  EXPORT_COLUMNS,
} = require("../utils/registrationHelpers");

const EDITABLE_FIELDS = [
  "teamName",
  "teamLeaderFullName",
  "teamLeaderRollNumber",
  "teamLeaderBranchSection",
  "teamLeaderYear",
  "teamLeaderGender",
  "teamLeaderPhoneNumber",
  "teamLeaderEmailAddress",
  "status",
  "judgeAssigned",
  "presentationSlot",
  "rankingStatus",
];
for (let n = 2; n <= 6; n++) {
  EDITABLE_FIELDS.push(
    `member${n}FullName`,
    `member${n}RollNumber`,
    `member${n}BranchSection`,
    `member${n}Year`,
    `member${n}Gender`,
    `member${n}EmailAddress`
  );
}

function applyFilters(teams, query) {
  let result = teams;

  if (query.search) {
    const q = String(query.search).toLowerCase();
    result = result.filter((t) => {
      const haystack = [
        t.teamName,
        t.teamId,
        t.teamLeaderFullName,
        t.teamLeaderRollNumber,
        t.teamLeaderEmailAddress,
        t.teamLeaderPhoneNumber,
        t.teamLeaderBranchSection,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (query.department) {
    result = result.filter((t) => departmentOf(t) === query.department);
  }
  if (query.year) {
    result = result.filter((t) => t.teamLeaderYear === query.year);
  }
  if (query.gender) {
    result = result.filter((t) => t.teamLeaderGender === query.gender);
  }
  if (query.status) {
    result = result.filter((t) => t.status === query.status);
  }
  if (query.judgeAssigned) {
    result = result.filter((t) => t.judgeAssigned === query.judgeAssigned);
  }

  return result;
}

function applySort(teams, sortBy, sortDir) {
  if (!sortBy) return teams;
  const dir = sortDir === "desc" ? -1 : 1;
  return [...teams].sort((a, b) => {
    const av = a[sortBy] ?? "";
    const bv = b[sortBy] ?? "";
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

async function listRegistrations(req, res) {
  const teams = await sheetsService.getRows("Registration");
  const filtered = applySort(
    applyFilters(teams, req.query),
    req.query.sortBy,
    req.query.sortDir
  );

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Number(req.query.pageSize) || 10);
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  res.json({
    data: pageItems.map(toListItem),
    total: filtered.length,
    page,
    pageSize,
  });
}

async function getRegistration(req, res) {
  const team = await sheetsService.getRowById("Registration", req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.json({ data: team });
}

async function updateRegistration(req, res) {
  const patch = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      patch[field] = req.body[field];
    }
  }

  const updated = await sheetsService.updateRow("Registration", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Team not found" });

  const action = patch.status
    ? `Registration ${patch.status}`
    : "Registration Edited";
  await logAction(req, action, `Team ${updated.teamId} (${updated.teamName})`);

  res.json({ data: updated });
}

async function addRemark(req, res) {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Remark text is required" });
  }

  const team = await sheetsService.getRowById("Registration", req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const remark = {
    id: Date.now().toString(),
    text: text.trim(),
    author: req.user.name,
    timestamp: new Date().toISOString(),
  };
  const remarks = [...(team.remarks || []), remark];
  const updated = await sheetsService.updateRow("Registration", req.params.id, { remarks });

  await logAction(req, "Remark Added", `Team ${team.teamId}: "${remark.text}"`);
  res.json({ data: updated });
}

async function deleteRegistration(req, res) {
  const team = await sheetsService.getRowById("Registration", req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  await sheetsService.deleteRow("Registration", req.params.id);
  await logAction(req, "Registration Deleted", `Team ${team.teamId} (${team.teamName})`);
  res.json({ message: "Team deleted" });
}

async function exportRegistrations(req, res) {
  const teams = applyFilters(await sheetsService.getRows("Registration"), req.query);
  const format = req.query.format === "xlsx" ? "xlsx" : "csv";

  if (format === "csv") {
    const csv = toCsv(teams, EXPORT_COLUMNS);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
    return res.send(csv);
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Registrations");
  sheet.columns = EXPORT_COLUMNS.map((c) => ({ header: c.label, key: c.key, width: 22 }));
  teams.forEach((t) => sheet.addRow(t));
  sheet.getRow(1).font = { bold: true };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=registrations.xlsx");
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = {
  listRegistrations,
  getRegistration,
  updateRegistration,
  addRemark,
  deleteRegistration,
  exportRegistrations,
};
