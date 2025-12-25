"use strict";

const http = require("http");

function listenAsync(server, { host, port }) {
  return new Promise((resolve, reject) => {
    const onError = (err) => {
      server.removeListener("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      server.removeListener("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

async function startServer({ host = "127.0.0.1", port = 3333, publicBaseUrl } = {}) {
  const server = http.createServer((req, res) => {
    // TODO: giữ nguyên router/handler hiện tại của bạn ở đây
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  });

  const maxTry = 20;
  let lastErr = null;

  for (let i = 0; i < maxTry; i++) {
    const tryPort = port + i;
    try {
      await listenAsync(server, { host, port: tryPort });
      const base = publicBaseUrl || `http://${host}:${tryPort}`;
      return { server, host, port: tryPort, publicBaseUrl: base };
    } catch (err) {
      lastErr = err;
      if (err && err.code === "EADDRINUSE") continue;
      // lỗi khác -> dừng luôn
      try { server.close(); } catch (_) {}
      throw err;
    }
  }

  try { server.close(); } catch (_) {}
  const msg = lastErr ? `${lastErr.code || ""} ${lastErr.message || lastErr}` : "Unknown";
  throw new Error(`Cannot bind server port from ${port}..${port + maxTry - 1}: ${msg}`);
}

async function stopServer(server) {
  if (!server) return;
  await new Promise((resolve) => {
    try {
      server.close(() => resolve());
    } catch (_) {
      resolve();
    }
  });
}

module.exports = { startServer, stopServer };
