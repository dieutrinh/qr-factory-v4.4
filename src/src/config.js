const fs = require("fs");
const path = require("path");

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); }
  catch { return null; }
}

/**
 * Load config with priority:
 * 1) --config <file>
 * 2) <baseDir>/config.json
 * 3) <baseDir>/pack-v4.4/config.sample.json (fallback)
 */
function loadConfig(baseDir) {
  const argv = process.argv.slice(1);
  const configIdx = argv.indexOf("--config");
  let configPath = null;
  if (configIdx >= 0 && argv[configIdx + 1]) configPath = argv[configIdx + 1];

  const candidates = [
    configPath,
    path.join(baseDir, "config.json"),
    path.join(baseDir, "pack-v4.4", "config.sample.json"),
  ].filter(Boolean);

  for (const p of candidates) {
    const cfg = readJsonSafe(p);
    if (cfg) return { cfg, path: p };
  }
  return { cfg: { schema_version: "4.4", publicBaseUrl: "", allowedStatus: ["active","disabled"] }, path: null };
}

module.exports = { loadConfig };
