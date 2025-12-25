"use strict";

const fs = require("fs");
const path = require("path");
const { getRuntimeDir, ensureRuntimeDirs } = require("./paths");

const DEFAULT_CFG = {
  port: 3333,
  host: "127.0.0.1",
  // các field khác bạn có thể thêm ở đây, nhưng để tối thiểu cho chạy 1-click
};

function getConfigPath() {
  // đảm bảo runtime luôn tồn tại
  ensureRuntimeDirs();

  const runtimeDir = getRuntimeDir();
  if (typeof runtimeDir !== "string" || !runtimeDir.trim()) {
    throw new Error(`Invalid runtimeDir in getConfigPath(): ${String(runtimeDir)}`);
  }

  return path.join(runtimeDir, "config.json");
}

function loadConfig() {
  const cfgPath = getConfigPath();

  // nếu chưa có config -> tạo default
  if (!fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, JSON.stringify(DEFAULT_CFG, null, 2), "utf8");
    return { ...DEFAULT_CFG, _cfgPath: cfgPath };
  }

  // đọc config
  let raw = "";
  try {
    raw = fs.readFileSync(cfgPath, "utf8");
  } catch (_) {
    return { ...DEFAULT_CFG, _cfgPath: cfgPath };
  }

  try {
    const parsed = JSON.parse(raw || "{}");
    return { ...DEFAULT_CFG, ...parsed, _cfgPath: cfgPath };
  } catch (_) {
    // config hỏng -> fallback
    return { ...DEFAULT_CFG, _cfgPath: cfgPath, _cfgCorrupt: true };
  }
}

function saveConfig(newCfg) {
  const cfgPath = getConfigPath();
  const merged = { ...DEFAULT_CFG, ...(newCfg || {}) };
  fs.writeFileSync(cfgPath, JSON.stringify(merged, null, 2), "utf8");
  return { ...merged, _cfgPath: cfgPath };
}

module.exports = { DEFAULT_CFG, loadConfig, saveConfig, getConfigPath };
