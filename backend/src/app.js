const express = require("express");
const cors = require("cors");
const { createSandbox } = require("./services/docker.service");

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

app.post("/api/sandbox/test", async (req, res) => {
  try {
    const projectPath = `${process.cwd()}/sandbox-test`;

    const container = await createSandbox(projectPath);

    await container.start();

    const result = await container.wait();

    const logs = await container.logs({
      stdout: true,
      stderr: true,
    });

    await container.remove();

    res.json({
      success: true,
      exitCode: result.StatusCode,
      output: logs.toString(),
    });
  } catch (error) {
    console.error("Sandbox test failed:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
