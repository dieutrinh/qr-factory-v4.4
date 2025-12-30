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
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (startUrl && typeof startUrl === "string") {
    mainWindow.loadURL(startUrl);
  } else {
    // fallback: load local UI if server didn't start
    mainWindow.loadFile(path.join(__dirname, "www", "index.html"));
  }

  // Close window = quit (no background)
  mainWindow.on("close", () => {
    if (!quitting) app.quit();
  });
}

async function boot() {
  try {
    ensureRuntimeDirs();

    const cfg = loadConfig();
    const host = (cfg && cfg.host) || "127.0.0.1";
    const port = Number((cfg && cfg.port) || 3333);

    const started = await withTimeout(startServer({ port, host }), 8000, "Start server");
    httpServer = started.server;

    const url = (started && started.publicBaseUrl) || `http://${host}:${started.port || port}`;
    createWindow(url);
  } catch (err) {
    safeShowError("QR Factory failed to start", err);
    try { createWindow(null); } catch (_) {}
  }
}

app.whenReady().then(boot);
app.on("window-all-closed", () => app.quit());

app.on("before-quit", async () => {
  if (quitting) return;
  quitting = true;

  try {
    await stopServer(httpServer);
  } catch (_) {}

  setTimeout(() => process.exit(0), 1500);
});
