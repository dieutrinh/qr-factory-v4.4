\
const { ALLOWED_STATUS } = require("./schema");

function err(sheet,row,col,reason){
  const e = new Error(`Sheet=${sheet} | Row=${row} | Column=${col} | Reason=${reason}`);
  e.meta = {sheet,row,col,reason};
  return e;
}

function parseDateFlexible(v){
  if(v===null||v===undefined||v==="") return null;
  if(typeof v === "number" && isFinite(v)){
    const epoch = new Date(Date.UTC(1899,11,30));
    return new Date(epoch.getTime() + v*86400000);
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m){
    const dd=+m[1], mm=+m[2], yy=+m[3];
    const d=new Date(yy,mm-1,dd);
    if(d.getFullYear()===yy && d.getMonth()===mm-1 && d.getDate()===dd) return d;
  }
  const d2=new Date(s);
  if(!isNaN(d2.getTime())) return d2;
  return null;
}

function validateStatus(sheet,row,value){
  const v=String(value).trim();
  if(!ALLOWED_STATUS.includes(v)){
    throw err(sheet,row,"status",`Invalid value "${value}" (allowed: ${ALLOWED_STATUS.join(", ")})`);
  }
}

module.exports = { err, parseDateFlexible, validateStatus };
