const fs = require("fs");
const path = require("path");

- const DEFAULT_CEG = {
+ const DEFAULT_CFG = {
  port: 3333,
  publicBaseUrl: "http://localhost:3333",
  adminCode: "VCRR-DEFAULT-ADMIN",
  appInstallUrl: "https://example.com/app.apk"
};

function readJsonSafe(p, fallback) {
  try {
    if (!fs.existsSync(p)) return fallback;
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

function loadConfig(baseDir) {
  const cfgPath = path.join(baseDir, "config.json");
  const samplePath = path.join(baseDir, "config.sample.json");

  // Nếu có config.json dùng nó
  const fromCfg = readJsonSafe(cfgPath, null);
  if (fromCfg) return { cfg: { ...DEFAULT_CFG, ...fromCfg }, cfgPath };

  // Nếu không có config.json mà có config.sample.json, copy ra config.json
  const fromSample = readJsonSafe(samplePath, null);
  if (fromSample) {
    const merged = { ...DEFAULT_CFG, ...fromSample };
    writeJson(cfgPath, merged);
    return { cfg: merged, cfgPath };
  }

  // Không có gì cả thì tạo config.json mặc định
  writeJson(cfgPath, DEFAULT_CFG);
  return { cfg: DEFAULT_CFG, cfgPath };
}

function saveConfig(baseDir, partial) {
  const cfgPath = path.join(baseDir, "config.json");
  const current = readJsonSafe(cfgPath, DEFAULT_CFG);
  const merged = { ...current, ...partial };
  writeJson(cfgPath, merged);
  return { cfg: merged, cfgPath };
}

module.exports = { loadConfig, saveConfig, DEFAULT_CFG };
