\
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

function exportToXlsx({ outDir, filePrefix, sheets }){
  const wb = XLSX.utils.book_new();
  for(const [name,rows] of Object.entries(sheets)){
    const ws = XLSX.utils.json_to_sheet(rows||[]);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  fs.mkdirSync(outDir,{recursive:true});
  const ts = new Date().toISOString().replace(/[:.]/g,"-");
  const outPath = path.join(outDir, `${filePrefix}_${ts}.xlsx`);
  XLSX.writeFile(wb,outPath);
  return outPath;
}
module.exports = { exportToXlsx };
