const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const { initPaths } = require("./src/paths");
const { loadConfig } = require("./src/config");
const { startServer } = require("./src/server");

let mainWindow;
let server;

function getBaseDir() {
  // Ưu tiên portable (win-unpacked)
  if (app.isPackaged) {
    // resourcesPath = .../win-unpacked/resources
    // exe nằm ở .../win-unpacked/
    return path.dirname(process.execPath);
  }
  // dev mode
  return process.cwd();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const indexHtml = path.join(__dirname, "www", "index.html");
  mainWindow.loadFile(indexHtml);
}

app.whenReady().then(() => {
  try {
    const baseDir = getBaseDir();

    // log tạm để debug portable
    fs.writeFileSync(
      path.join(baseDir, "boot.log"),
      `[BOOT]\nbaseDir=${baseDir}\nexecPath=${process.execPath}\nresourcesPath=${process.resourcesPath}\n`
    );

    const runtime = initPaths(baseDir);
    const { cfg } = loadConfig(baseDir);

    server = startServer({
      port: cfg.port || 3333,
      bindHost: "0.0.0.0",
    });

    ipcMain.handle("getRuntimePaths", async () => runtime);

    createWindow();
  } catch (err) {
    // log crash
    const p = path.join(process.cwd(), "fatal.log");
    fs.writeFileSync(p, err.stack || String(err));
    throw err;
  }
});

app.on("window-all-closed", () => {
  if (server) server.close();
  app.quit();
});
