\
const fs = const fs = require("fs");
const path = require("path");

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }

function initPaths(baseDir){
  const runtimeDir = path.join(baseDir,"runtime");
  const paths = {
    baseDir,
    runtimeDir,
    data: path.join(runtimeDir,"data"),
    imports: path.join(runtimeDir,"imports"),
    exports: path.join(runtimeDir,"exports"),
    templates: path.join(runtimeDir,"templates"),
    logs: path.join(runtimeDir,"logs"),
  };
  ensureDir(paths.runtimeDir);
  ensureDir(paths.data);
  ensureDir(paths.imports);
  ensureDir(paths.exports);
  ensureDir(paths.templates);
  ensureDir(paths.logs);
  return paths;
}

module.exports = { ensureDir, initPaths };
