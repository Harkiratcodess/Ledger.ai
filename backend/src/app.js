const express = require("express");
const cors = require("cors");
const { createSandbox } = require("./services/docker.service");
const { evaluateEvent } = require("./services/risk-engine");
const {
  applyRiskEnforcement,
  clearSandboxContainer,
  getActiveSandboxContainer,
  isTrackedSandboxContainer,
  killSandbox,
  pauseSandbox,
  resumeSandbox,
} = require("./services/enforcement.service");
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

async function inspectActiveSandbox() {
  const container = getActiveSandboxContainer();

  if (!container || !isTrackedSandboxContainer(container)) {
    return null;
  }

  try {
    const inspection = await container.inspect();
    return {
      container,
      state: {
        active: true,
        containerId: container.id,
        status: inspection.State?.Status || "unknown",
        running: Boolean(inspection.State?.Running),
        paused: Boolean(inspection.State?.Paused),
      },
    };
  } catch (error) {
    if (error.statusCode === 404) {
      clearSandboxContainer(container);
      return null;
    }

    throw error;
  }
}

app.get("/api/sandbox/status", async (_req, res) => {
  try {
    const activeSandbox = await inspectActiveSandbox();
    return res.json(activeSandbox?.state || { active: false });
  } catch (error) {
    console.error("Failed to inspect active sandbox:", error.message);
    return res.status(503).json({ success: false, error: "Active sandbox status is unavailable." });
  }
});

app.post("/api/sandbox/pause", async (_req, res) => {
  try {
    const activeSandbox = await inspectActiveSandbox();
    if (!activeSandbox) {
      return res.status(404).json({ success: false, error: "No active AgentGuard sandbox is available." });
    }

    const result = await pauseSandbox(activeSandbox.container);
    const state = await inspectActiveSandbox();
    return res.json({ success: true, ...result, ...(state?.state || { active: false }) });
  } catch (error) {
    console.error("Failed to pause active sandbox:", error.message);
    return res.status(error.statusCode === 404 ? 404 : 409).json({
      success: false,
      error: "The active AgentGuard sandbox could not be paused.",
    });
  }
});

app.post("/api/sandbox/resume", async (_req, res) => {
  try {
    const activeSandbox = await inspectActiveSandbox();
    if (!activeSandbox) {
      return res.status(404).json({ success: false, error: "No active AgentGuard sandbox is available." });
    }

    const result = await resumeSandbox(activeSandbox.container);
    const state = await inspectActiveSandbox();
    return res.json({ success: true, ...result, ...(state?.state || { active: false }) });
  } catch (error) {
    console.error("Failed to resume active sandbox:", error.message);
    return res.status(error.statusCode === 404 ? 404 : 409).json({
      success: false,
      error: "The active AgentGuard sandbox could not be resumed.",
    });
  }
});

app.post("/api/sandbox/kill", async (_req, res) => {
  try {
    const activeSandbox = await inspectActiveSandbox();
    if (!activeSandbox) {
      return res.status(404).json({ success: false, error: "No active AgentGuard sandbox is available." });
    }

    const result = await killSandbox(activeSandbox.container);

    try {
      await activeSandbox.container.remove({ force: true });
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
    }

    return res.json({ success: true, ...result, active: false, status: "removed", running: false, paused: false });
  } catch (error) {
    console.error("Failed to kill active sandbox:", error.message);
    return res.status(error.statusCode === 404 ? 404 : 409).json({
      success: false,
      error: "The active AgentGuard sandbox could not be terminated.",
    });
  }
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
