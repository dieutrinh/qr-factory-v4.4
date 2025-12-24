const XLSX = require("xlsx");
const { validateStatus, parseDateFlexible, err } = require("./validator");

/**
 * Lenient import:
 * - ignore unknown columns
 * - default missing optional columns
 * - require sheet exists
 * - error with Sheet/Row/Column
 */
function importSheet(filePath, sheetName) {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const ws = wb.Sheets[sheetName];
  if (!ws) throw err(sheetName, 1, "__sheet__", "Missing sheet");

  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

  rows.forEach((r, i) => {
    const row1 = i + 2; // +1 header, +1 for 1-based
    if (r.status !== undefined && r.status !== "") validateStatus(sheetName, row1, r.status);

    // optional: normalize dates if present
    if (r.start_date) {
      const d = parseDateFlexible(r.start_date);
      if (!d) throw err(sheetName, row1, "start_date", "Invalid date format");
    }
    if (r.end_date) {
      const d = parseDateFlexible(r.end_date);
      if (!d) throw err(sheetName, row1, "end_date", "Invalid date format");
    }
  });

  return rows;
}

module.exports = { importSheet };
