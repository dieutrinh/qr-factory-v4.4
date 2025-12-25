"use strict";

const fs = require("fs");
const path = require("path");
const { app } = require("electron");

/**
 * Base dir to store runtime next to the .exe (portable behavior).
 * - Packaged:  <folder_of_exe>
 * - Dev:       project root (process.cwd())
 */
function getBaseDir() {
  try {
    if (app && app.isPackaged) {
      // e.g. D:\QRFactory_Test\v4.7\win-unpacked\QR Factory.exe
      return path.dirname(process.execPath);
    }
  } catch (_) {}

  // dev fallback
  return process.cwd();
}

/**
 * Runtime dir (always string)
 */
function getRuntimeDir() {
  const baseDir = getBaseDir();
  const runtimeDir = path.join(baseDir, "runtime");

  if (typeof runtimeDir !== "string" || !runtimeDir.trim()) {
    throw new Error(`getRuntimeDir() invalid: ${String(runtimeDir)}`);
  }
  return runtimeDir;
}

/**
 * Create required runtime folders
 */
function ensureRuntimeDirs() {
  const runtimeDir = getRuntimeDir(); // GUARANTEED string

  const dirs = [
    runtimeDir,
    path.join(runtimeDir, "data"),
    path.join(runtimeDir, "imports"),
    path.join(runtimeDir, "exports"),
    path.join(runtimeDir, "templates"),
    path.join(runtimeDir, "logs"),
  ];

  for (const d of dirs) {
    if (typeof d !== "string" || !d.trim()) {
      throw new Error(`ensureRuntimeDirs() invalid path: ${String(d)}`);
    }
    fs.mkdirSync(d, { recursive: true });
  }

  return runtimeDir;
}

module.exports = { getRuntimeDir, ensureRuntimeDirs };
