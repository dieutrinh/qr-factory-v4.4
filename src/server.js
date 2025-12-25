"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

function send(res, code, headers, body) {
  res.writeHead(code, headers || {});
  res.end(body);
}

function serveFile(res, filePath, contentType) {
  try {
    const data = fs.readFileSync(filePath);
    send(res, 200, { "Content-Type": contentType }, data);
  } catch (e) {
    send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not Found");
  }
}

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
  // NOTE:
  // - Khi đóng gói (asar), __dirname thường là .../resources/app.asar/src
  // - www nằm ở .../resources/app.asar/www
  const wwwDir = path.join(__dirname, "..", "www");
  const indexHtml = path.join(wwwDir, "index.html");
  const sharedCss = path.join(wwwDir, "shared.css");

  const server = http.createServer((req, res) => {
    const url = (req.url || "/").split("?")[0];

    // Health check
    if (url === "/health") {
      return send(
        res,
        200,
        { "Content-Type": "application/json; charset=utf-8" },
        JSON.stringify({ ok: true })
      );
    }

    // Static UI
    if (url === "/" || url === "/index.html") {
      return serveFile(res, indexHtml, "text/html; charset=utf-8");
    }
    if (url === "/shared.css") {
      return serveFile(res, sharedCss, "text/css; charset=utf-8");
    }

    // (Tuỳ bạn) chặn favicon để khỏi 404 spam
    if (url === "/favicon.ico") {
      return send(res, 204, {}, "");
    }

    return send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not Found");
  });

  // Auto port retry
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
      try {
        server.close();
      } catch (_) {}
      throw err;
    }
  }

  try {
    server.close();
  } catch (_) {}

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
