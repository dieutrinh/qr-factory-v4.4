const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

function exportToXlsx({ outDir, filePrefix, sheets }) {
  const wb = XLSX.utils.book_new();

  for (const [sheetName, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(rows || []);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(outDir, `${filePrefix}_${ts}.xlsx`);
  fs.mkdirSync(outDir, { recursive: true });
  XLSX.writeFile(wb, outPath);
  return outPath;
}

module.exports = { exportToXlsx };
