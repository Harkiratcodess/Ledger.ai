const express = require("express");
const cors = require("cors");
const { createSandbox } = require("./services/docker.service");
const { evaluateEvent } = require("./services/risk-engine");
const { applyRiskEnforcement, getActiveSandboxContainer } = require("./services/enforcement.service");
const Event = require("./models/event.model")

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
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch events:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
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

    const container = await createSandbox(projectPath, {
      command: ["cat", "/workspace/test.txt"],
    });

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

app.post("/api/network-events", async (req, res) => {
  try {
    const { hostname, method, url, statusCode, timestamp } = req.body || {};

    if (!hostname || !method || !url || !timestamp) {
      return res.status(400).json({
        success: false,
        error: "hostname, method, url, and timestamp are required",
      });
    }

    const riskAssessment = evaluateEvent({
      type: "network",
      hostname,
      method: String(method).toUpperCase(),
      url,
      statusCode: statusCode !== undefined && statusCode !== null ? Number(statusCode) : undefined,
      timestamp: new Date(timestamp),
    });

    const enforcementResult = await applyRiskEnforcement(
      {
        type: "network",
        hostname,
        method: String(method).toUpperCase(),
        url,
        statusCode: statusCode !== undefined && statusCode !== null ? Number(statusCode) : undefined,
        timestamp: new Date(timestamp),
      },
      riskAssessment,
      { container: getActiveSandboxContainer() }
    );

    const event = await Event.create({
      type: "network",
      hostname,
      method: String(method).toUpperCase(),
      url,
      statusCode: statusCode !== undefined && statusCode !== null ? Number(statusCode) : undefined,
      timestamp: new Date(timestamp),
      riskLevel: riskAssessment.riskLevel,
      riskScore: riskAssessment.riskScore,
      riskReason: riskAssessment.reason,
      enforcementAction: enforcementResult.enforcementAction,
      enforcementStatus: enforcementResult.enforcementStatus,
      enforcementTimestamp: enforcementResult.enforcementTimestamp,
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Failed to store network event:", error.message);

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
