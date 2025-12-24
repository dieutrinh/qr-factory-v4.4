const express = require("express");

function startServer({ port, bindHost = "0.0.0.0" }) {
  const app = express();
  app.get("/health", (req, res) => res.json({ ok: true, ts: Date.now() }));
  app.get("/ping", (req, res) => res.send("pong"));

  const srv = app.listen(port, bindHost, () => {
    console.log(`[server] listening on http://${bindHost}:${port}`);
  });
  return srv;
}

module.exports = { startServer };
