"use strict";

const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");

const { ensureRuntimeDirs } = require("./src/paths");
const { loadConfig } = require("./src/config");
const { startServer, stopServer } = require("./src/server");

let mainWindow = null;
let httpServer = null;
let quitting = false;

function safeShowError(title, err) {
  try {
    dialog.showErrorBox(title, String(err && err.stack ? err.stack : err));
  } catch (_) {}
}

function withTimeout(promise, ms, label = "Operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function createWindow(startUrl) {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 1-click: load thẳng URL sau khi server sẵn sàng
  mainWindow.loadURL(startUrl);

  // Đóng cửa sổ = QUIT HẲN
  mainWindow.on("close", () => {
    if (!quitting) app.quit();
  });
}

async function boot() {
  try {
    ensureRuntimeDirs();

    const cfg = loadConfig(); // giữ nguyên config của bạn
    // Start server, có timeout để không “treo”
    const started = await withTimeout(
      startServer({ port: 3333, host: "127.0.0.1" }),
      8000,
      "Start server"
    );

    httpServer = started.server;

    createWindow(started.publicBaseUrl);
  } catch (err) {
    safeShowError("QR Factory failed to start", err);
    try { app.quit(); } catch (_) {}
  }
}

app.whenReady().then(boot);

// Windows: không còn cửa sổ => quit
app.on("window-all-closed", () => app.quit());

// Trước khi thoát: stop server sạch
app.on("before-quit", async () => {
  if (quitting) return;
  quitting = true;
  try {
    await stopServer(httpServer);
  } catch (_) {}
  // “chốt hạ” để không giữ handle gây lock
  setTimeout(() => process.exit(0), 1500);
});
