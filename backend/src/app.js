const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { createSandbox } = require("./services/docker.service");
const { generateDecision } = require("./services/agent-provider.service");
const { validateDecision } = require("./services/agent-plan-validator.service");
const { executeSandboxCommand, inspectRunningContainer } = require("./services/agent-execution.service");
const { runAgentLoop } = require("./services/agent-loop.service");
const { evaluateEvent } = require("./services/risk-engine");
const {
  applyRiskEnforcement,
  clearSandboxContainer,
  getActiveSandboxContainer,
  getActiveSandboxContext,
  getActiveSandboxMetadata,
  getValidActiveSandboxContext,
  getTrackedSandboxContainer,
  getTrackedSandboxMetadata,
  isTrackedSandboxContainer,
  killSandbox,
  pauseSandbox,
  resumeSandbox,
  setActiveSandboxContainer,
} = require("./services/enforcement.service");
const Event = require("./models/event.model")
const Session = require("./models/session.model");

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

function createSessionId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `AG-${stamp}-${crypto.randomBytes(3).toString("hex")}`;
}

app.post("/api/sessions", async (_req, res) => {
  let session;
  let container;

  try {
    session = await Session.create({
      sessionId: createSessionId(),
      status: "CREATED",
    });
    const projectPath = `${process.cwd()}/sandbox-test`;
    container = await createSandbox(projectPath, {
      command: ["sleep", "600"],
      sessionId: session.sessionId,
    });

    await container.start();

    const startedAt = new Date();
    const updatedSession = await Session.findByIdAndUpdate(
      session._id,
      {
        status: "RUNNING",
        containerId: container.id,
        startedAt,
      },
      { new: true }
    );

    return res.status(201).json({ success: true, session: updatedSession });
  } catch (error) {
    const finishedAt = new Date();
    if (session) {
      await Session.findByIdAndUpdate(session._id, {
        status: "FAILED",
        ...(container?.id ? { containerId: container.id } : {}),
        finishedAt,
      });
    }

    if (container) {
      try {
        await container.remove({ force: true });
      } catch (cleanupError) {
        if (cleanupError.statusCode !== 404) {
          console.error("Failed to clean up failed session sandbox:", cleanupError.message);
        }
      }
      clearSandboxContainer(container);
    }

    console.error("Failed to create AgentGuard session:", error.message);
    return res.status(500).json({ success: false, error: "AgentGuard session could not be started." });
  }
});

app.get("/api/sessions", async (_req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, sessions });
  } catch (error) {
    console.error("Failed to fetch sessions:", error.message);
    return res.status(500).json({ success: false, error: "Sessions could not be loaded." });
  }
});

app.get("/api/sessions/:sessionId", async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }

    return res.json({ success: true, session });
  } catch (error) {
    console.error("Failed to fetch session:", error.message);
    return res.status(500).json({ success: false, error: "Session could not be loaded." });
  }
});

app.get("/api/sessions/:sessionId/events", async (req, res) => {
  try {
    const session = await Session.exists({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }

    const events = await Event.find({ sessionId: req.params.sessionId })
      .sort({ timestamp: -1 })
      .limit(100);

    return res.json({ success: true, events });
  } catch (error) {
    console.error("Failed to fetch session events:", error.message);
    return res.status(500).json({ success: false, error: "Session events could not be loaded." });
  }
});

app.post("/api/sessions/:sessionId/agent", async (req, res) => {
  const { prompt } = req.body || {};

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ success: false, error: "prompt must be a non-empty string." });
  }

  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }

    if (session.status !== "RUNNING") {
      return res.status(409).json({ success: false, error: "Session is not active." });
    }

    const container = getTrackedSandboxContainer(session.containerId);
    const metadata = getTrackedSandboxMetadata(session.containerId);
    if (!container || metadata?.sessionId !== session.sessionId) {
      return res.status(409).json({ success: false, error: "Session sandbox is not tracked by AgentGuard." });
    }

    let inspection;
    try {
      inspection = await container.inspect();
    } catch (error) {
      if (error.statusCode === 404) {
        clearSandboxContainer(container);
        return res.status(409).json({ success: false, error: "Session sandbox no longer exists." });
      }
      throw error;
    }

    if (inspection.State?.Paused || !inspection.State?.Running) {
      return res.status(409).json({ success: false, error: "Session sandbox is not running." });
    }

    setActiveSandboxContainer(container);
    await Session.findByIdAndUpdate(session._id, { status: "RUNNING" });
    const runId = crypto.randomUUID();
    const startedAt = new Date();
    console.log(`Agent run started session=${session.sessionId} run=${runId}`);
    let loopResult;
    try {
      loopResult = await runAgentLoop({
        prompt,
        container,
        generateDecision,
        validateDecision,
        executeSandboxCommand,
        inspectRunningContainer,
      });
    } catch (error) {
      return res.status(422).json({ success: false, error: error.message });
    }

    const finalExecution = loopResult.executions[loopResult.executions.length - 1];
    const finalStatus = loopResult.status === "completed"
      ? "COMPLETED"
      : ["blocked", "interrupted"].includes(loopResult.status)
        ? "PAUSED"
        : "FAILED";
    await Session.findByIdAndUpdate(
      session._id,
      {
        status: finalStatus,
        ...(finalExecution ? { exitCode: finalExecution.exitCode, finishedAt: finalExecution.finishedAt } : { finishedAt: new Date() }),
        $push: {
          ...(loopResult.executions.length > 0 ? { executions: { $each: loopResult.executions } } : {}),
          agentRuns: {
            runId,
            prompt,
            status: loopResult.status,
            iterations: loopResult.iterations,
            startedAt,
            finishedAt: new Date(),
          },
        },
      }
    );
    console.log(`Agent run finished session=${session.sessionId} run=${runId} status=${loopResult.status}`);

    return res.json({
      success: true,
      sessionId: session.sessionId,
      runId,
      status: loopResult.status,
      reason: loopResult.reason,
      iterations: loopResult.iterations,
      actions: loopResult.actions,
      executions: loopResult.executions.map(({ executionId, iteration, exitCode, startedAt, finishedAt }) => ({
        executionId,
        iteration,
        exitCode,
        startedAt,
        finishedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to run AgentGuard agent plan:", error.message);
    return res.status(502).json({ success: false, error: "Agent plan could not be generated or executed." });
  }
});

app.post("/api/sessions/:sessionId/execute", async (req, res) => {
  const { command } = req.body || {};

  if (!Array.isArray(command) || command.length === 0 || command.some((argument) => typeof argument !== "string")) {
    return res.status(400).json({
      success: false,
      error: "command must be a non-empty array of arguments.",
    });
  }

  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }

    if (["KILLED", "COMPLETED", "FAILED"].includes(session.status)) {
      return res.status(409).json({ success: false, error: "Session cannot execute commands in its current state." });
    }

    const container = getTrackedSandboxContainer(session.containerId);
    const metadata = getTrackedSandboxMetadata(session.containerId);
    if (!container || metadata?.sessionId !== session.sessionId) {
      return res.status(409).json({ success: false, error: "Session sandbox is not tracked by AgentGuard." });
    }

    let inspection;
    try {
      inspection = await container.inspect();
    } catch (error) {
      if (error.statusCode === 404) {
        clearSandboxContainer(container);
        return res.status(409).json({ success: false, error: "Session sandbox no longer exists." });
      }
      throw error;
    }

    if (inspection.State?.Paused || session.status === "PAUSED") {
      return res.status(409).json({ success: false, error: "Session sandbox is paused." });
    }

    if (!inspection.State?.Running) {
      return res.status(409).json({ success: false, error: "Session sandbox is not running." });
    }

    setActiveSandboxContainer(container);
    const startedAt = new Date();
    await Session.findByIdAndUpdate(session._id, { status: "RUNNING" });
    const result = await executeSandboxCommand(container, command);
    const finishedAt = new Date();
    const execution = {
      executionId: crypto.randomUUID(),
      command,
      ...result,
      startedAt,
      finishedAt,
    };
    const status = result.exitCode === 0 ? "COMPLETED" : "FAILED";
    const updatedSession = await Session.findByIdAndUpdate(
      session._id,
      {
        status,
        exitCode: result.exitCode,
        finishedAt,
        $push: { executions: execution },
      },
      { new: true }
    );

    return res.json({ success: true, session: updatedSession, execution });
  } catch (error) {
    console.error("Failed to execute AgentGuard session command:", error.message);
    return res.status(500).json({ success: false, error: "AgentGuard command execution failed." });
  }
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
        sessionId: getActiveSandboxMetadata()?.sessionId,
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
    await Session.findOneAndUpdate(
      { containerId: activeSandbox.container.id, status: "RUNNING" },
      { status: "PAUSED" }
    );
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
    await Session.findOneAndUpdate(
      { containerId: activeSandbox.container.id, status: "PAUSED" },
      { status: "RUNNING" }
    );
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
    await Session.findOneAndUpdate(
      { containerId: activeSandbox.container.id, status: { $in: ["RUNNING", "PAUSED", "COMPLETED"] } },
      { status: "KILLED", finishedAt: new Date(), exitCode: null }
    );

    try {
      await activeSandbox.container.remove({ force: true });
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
    } finally {
      clearSandboxContainer(activeSandbox.container);
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

    const sandboxContext = await getValidActiveSandboxContext();
    const networkEvent = {
      type: "network",
      hostname,
      method: String(method).toUpperCase(),
      url,
      statusCode: statusCode !== undefined && statusCode !== null ? Number(statusCode) : undefined,
      timestamp: new Date(timestamp),
    };
    const riskAssessment = evaluateEvent(networkEvent);

    const enforcementResult = await applyRiskEnforcement(
      networkEvent,
      riskAssessment,
      { container: sandboxContext?.container }
    );

    const event = await Event.create({
      ...networkEvent,
      ...(sandboxContext?.metadata?.sessionId ? { sessionId: sandboxContext.metadata.sessionId } : {}),
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
