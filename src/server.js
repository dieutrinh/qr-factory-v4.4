\
const express = require("express");

function startServer({port, bindHost="0.0.0.0"}){
  const app = express();
  app.get("/health",(req,res)=>res.json({ok:true, ts:Date.now()}));
  return app.listen(port, bindHost, ()=>console.log(`[server] http://${bindHost}:${port}`));
}
module.exports = { startServer };
