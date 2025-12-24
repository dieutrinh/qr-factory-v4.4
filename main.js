"use strict";

const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");

const { ensureRuntimeDirs, getRuntimeDir } = require("./src/paths");
const { loadConfig } = require("./src/config");
const { startServer, stopServer } = require("./src/server");

let mainWindow = null;
let httpServer = null;
let quitting = false;

function safeShowError(title, err) {
  try {
    dialog.showErrorBox(title, String(err && err.stack ? err.stack : err));
  } catch (_) {
    // ignore
  }
}

function createWindow(cfg) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Không mở DevTools mặc định (portable test)
  // mainWindow.webContents.openDevTools({ mode: "detach" });

  const port = Number(cfg && cfg.port ? cfg.port : 3333);
  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  // ✅ Đóng cửa sổ là QUIT hẳn (Windows)
  mainWindow.on("close", () => {
    // close sẽ gọi before-quit -> stopServer sạch
    if (!quitting) app.quit();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function boot() {
  // ✅ runtime cạnh exe
  const baseDir = getRuntimeDir();
  ensureRuntimeDirs(baseDir);

  // ✅ load config.json / config.sample.json / default
  const { cfg } = loadConfig(baseDir);

  // ✅ start server
  const started = await startServer({
    port: cfg.port || 3333,
    publicBaseUrl: cfg.publicBaseUrl || "http://localhost:3333",
  });
  httpServer = started.server;

  createWindow(cfg);
}

// ✅ Windows: nếu không còn cửa sổ -> quit luôn (không chạy nền)
app.on("window-all-closed", () => {
  app.quit();
});

// ✅ QUAN TRỌNG: đóng sạch server trước khi thoát để không lock file/folder
app.on("before-quit", async (e) => {
  if (quitting) return;

  quitting = true;

  try {
    if (httpServer) {
      e.preventDefault(); // chặn quit để đóng server trước
      const s = httpServer;
      httpServer = null;

      await stopServer(s);

      // Sau khi stop sạch -> quit thật
      app.quit();
      return;
    }
  } catch (err) {
    // Có lỗi vẫn cho quit
    safeShowError("QR Factory - shutdown error", err);
  }
});

// ✅ Start app
app.whenReady().then(async () => {
  try {
    await boot();
  } catch (err) {
    safeShowError("QR Factory - boot error", err);
    app.quit();
  }
});
