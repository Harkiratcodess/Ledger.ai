const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (_req, res) => {
  res.json({
    name: "AgentGuard",
    service: "backend",
    status: "running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "agentguard-backend",
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
