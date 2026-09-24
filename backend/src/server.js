import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      status: "ok",
      service: "cristiane-tx-backend"
    }));
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`CristianeTX backend listening on port ${PORT}`);
});
