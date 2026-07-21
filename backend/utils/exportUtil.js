const ExcelJS = require("exceljs");
const { toCsv } = require("./csv");

async function sendExport(res, rows, columns, format, filename) {
  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");
    sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: 22 }));
    rows.forEach((r) => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  const csv = toCsv(rows, columns);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
  res.send(csv);
}

module.exports = { sendExport };
