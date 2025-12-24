\
const fs = require("fs");
const path = require("path");

function readJsonSafe(p){
  try{ return JSON.parse(fs.readFileSync(p,"utf-8")); }catch{ return null; }
}

function loadConfig(baseDir){
  const candidates = [
    path.join(baseDir,"config.json"),
    path.join(baseDir,"excel-template","config.sample.json"),
  ];
  for(const p of candidates){
    const cfg = readJsonSafe(p);
    if(cfg) return {cfg, path:p};
  }
  return {cfg:{schema_version:"4.4", publicBaseUrl:"", allowedStatus:["active","disabled"], port:3333}, path:null};
}

module.exports = { loadConfig };
