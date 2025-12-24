\
const XLSX = require("xlsx");
const { validateStatus, parseDateFlexible, err } = require("./validator");

function importSheet(filePath, sheetName){
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const ws = wb.Sheets[sheetName];
  if(!ws) throw err(sheetName,1,"__sheet__","Missing sheet");

  const rows = XLSX.utils.sheet_to_json(ws, { defval:"", raw:true });
  rows.forEach((r,i)=>{
    const row=i+2;
    if(r.status!=="" && r.status!==undefined) validateStatus(sheetName,row,r.status);
    if(r.start_date){
      const d=parseDateFlexible(r.start_date);
      if(!d) throw err(sheetName,row,"start_date","Invalid date format");
    }
    if(r.end_date){
      const d=parseDateFlexible(r.end_date);
      if(!d) throw err(sheetName,row,"end_date","Invalid date format");
    }
  });
  return rows;
}
module.exports = { importSheet };
