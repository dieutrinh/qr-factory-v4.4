const http = require("http");
const fs = require("fs");
const path = require("path");

function startServer({ port = 3333, publicBaseUrl = "http://localhost:3333" } = {}) {
  const server = http.createServer((req, res) => {
    // Health check
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true, ts: Date.now(), publicBaseUrl }));
      return;
    }

    // Serve basic UI (www/index.html) if exists; otherwise show a simple page
    const wwwDir = path.join(__dirname, "..", "www");
    const indexPath = path.join(wwwDir, "index.html");

    if (req.url === "/" || req.url === "/index.html") {
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, "utf8");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
      } else {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("QR Factory v4.4 server is running.");
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => {
      resolve({ server, port });
    });
  });
}

async function stopServer(server) {
  if (!server) return;
  await new Promise((resolve) => server.close(() => resolve()));
}

module.exports = { startServer, stopServer };
