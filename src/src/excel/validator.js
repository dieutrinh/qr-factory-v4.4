const { ALLOWED_STATUS } = require("./schema");

function err(sheet, row, col, reason) {
  const e = new Error(`Sheet=${sheet} | Row=${row} | Column=${col} | Reason=${reason}`);
  e.meta = { sheet, row, col, reason };
  return e;
}

function isEmpty(v) {
  return v === null || v === undefined || String(v).trim() === "";
}

function parseDateFlexible(v) {
  if (v === null || v === undefined || v === "") return null;

  // Excel serial number
  if (typeof v === "number" && isFinite(v)) {
    // Excel epoch (1899-12-30)
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 24 * 60 * 60 * 1000;
    return new Date(epoch.getTime() + ms);
  }

  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const yyyy = parseInt(m[3], 10);
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd) return d;
  }

  const d2 = new Date(s);
  if (!isNaN(d2.getTime())) return d2;

  return null;
}

function validateStatus(sheet, rowIndex1Based, value) {
  if (!ALLOWED_STATUS.includes(String(value).trim())) {
    throw err(sheet, rowIndex1Based, "status", `Invalid value "${value}" (allowed: ${ALLOWED_STATUS.join(", ")})`);
  }
}

module.exports = { err, isEmpty, parseDateFlexible, validateStatus };
