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

  // Load UI
  if (startUrl && typeof startUrl === "string") {
    mainWindow.loadURL(startUrl);
  } else {
    // fallback: load static UI nếu server không có URL (không để “treo”)
    mainWindow.loadFile(path.join(__dirname, "www", "index.html"));
  }

  // Đóng cửa sổ = QUIT HẲN (không chạy nền)
  mainWindow.on("close", () => {
    if (!quitting) app.quit();
  });
}

async function boot() {
  try {
    // tạo runtime cạnh exe trước
    ensureRuntimeDirs();

    // đọc config từ runtime/config.json
    const cfg = loadConfig();
    const host = (cfg && cfg.host) || "127.0.0.1";
    const port = Number((cfg && cfg.port) || 3333);

    // Start server có timeout để không “treo”
    const started = await withTimeout(
      startServer({ port, host }),
      8000,
      "Start server"
    );

    httpServer = started.server;

    // URL để load (được server trả về; nếu không có thì tự dựng)
    const url =
      (started && started.publicBaseUrl) || `http://${host}:${started.port || port}`;

    createWindow(url);
  } catch (err) {
    // Hiện lỗi rõ ràng rồi vẫn tạo cửa sổ fallback để user thấy UI (tuỳ bạn muốn)
    safeShowError("QR Factory failed to start", err);

    // Nếu bạn muốn: vẫn cho UI local lên để debug, không “1-click treo”
    try {
      createWindow(null);
    } catch (_) {}

    // Hoặc nếu bạn muốn strict: quit luôn
    // try { app.quit(); } catch (_) {}
  }
}

app.whenReady().then(boot);

// Windows: không còn cửa sổ => quit hẳn
app.on("window-all-closed", () => app.quit());

// Trước khi thoát: stop server sạch để không lock win-unpacked
app.on("before-quit", async () => {
  if (quitting) return;
  quitting = true;

  try {
    await stopServer(httpServer);
  } catch (_) {}

  // “chốt hạ” để không giữ handle gây lock
  setTimeout(() => process.exit(0), 1500);
});
