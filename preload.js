"use strict";

const { contextBridge } = require("electron");

/**
 * Minimal, safe preload for v4.4 baseline:
 * - contextIsolation: true
 * - nodeIntegration: false
 *
 * Renderer can read app/runtime info without Node access.
 * Add more APIs later via IPC if needed.
 */
contextBridge.exposeInMainWorld("qrFactory", {
  platform: process.platform,
  arch: process.arch,
  node: process.versions.node,
  electron: process.versions.electron,
});
