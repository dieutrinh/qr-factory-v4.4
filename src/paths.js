"use strict";

const fs = require("fs");
const path = require("path");
const { app } = require("electron");

/**
 * Portable runtime directory: next to the .exe (when packaged).
 * Dev fallback: process.cwd()
 */
function getBaseDir() {
  try {
    if (app && app.isPackaged) return path.dirname(process.execPath);
  } catch (_) {}
  return process.cwd();
}

function getRuntimeDir() {
  const baseDir = getBaseDir();
  const runtimeDir = path.join(baseDir, "runtime");
  if (typeof runtimeDir !== "string" || !runtimeDir.trim()) {
    throw new Error(`getRuntimeDir() invalid: ${String(runtimeDir)}`);
  }
  return runtimeDir;
}

function ensureRuntimeDirs() {
  const runtimeDir = getRuntimeDir();
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
