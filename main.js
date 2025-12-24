// v4.4 skeleton main.js
// Merge this logic into your existing v4.3 main.js (do not break UI routing).
const { app } = require("electron");
const path = require("path");
const { initPaths } = require("./src/paths");
const { loadConfig } = require("./src/config");
const { startServer } = require("./src/server");

let server = null;

app.whenReady().then(() => {
  // Portable-friendly baseDir: folder containing executable (or project root when dev)
  const baseDir = app.isPackaged ? path.dirname(app.getPath("exe")) : process.cwd();

  const runtime = initPaths(baseDir);
  const { cfg, path: cfgPath } = loadConfig(baseDir);

  console.log("[v4.4] baseDir:", baseDir);
  console.log("[v4.4] config:", cfgPath || "(defaults)");
  console.log("[v4.4] runtime:", runtime);

  // Start local server for QR endpoints (bind 0.0.0.0 so phone can reach, if firewall allows)
  const port = cfg.port || 3333;
  server = startServer({ port, bindHost: "0.0.0.0" });

  // TODO: create BrowserWindow and load your existing UI (www/index.html)
  // This skeleton intentionally avoids changing your UI code.
});

app.on("window-all-closed", () => {
  if (server) server.close();
  app.quit();
});
