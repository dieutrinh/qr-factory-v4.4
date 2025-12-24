"use strict";

const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// Runtime nằm cạnh exe (portable)
function getRuntimeDir() {
  // Khi chạy build
  if (app && app.isPackaged) {
    return path.join(path.dirname(process.execPath), "runtime");
  }

  // Khi dev
  return path.join(process.cwd(), "runtime");
}

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

// Tạo toàn bộ thư mục runtime cần thiết
function ensureRuntimeDirs(baseDir) {
  ensureDir(baseDir);
  ensureDir(path.join(baseDir, "data"));
  ensureDir(path.join(baseDir, "imports"));
  ensureDir(path.join(baseDir, "exports"));
  ensureDir(path.join(baseDir, "templates"));
  ensureDir(path.join(baseDir, "logs"));
}

module.exports = {
  getRuntimeDir,
  ensureRuntimeDirs,
};
