const path = require("path");
const chokidar = require("chokidar");
const Event = require("../models/event.model");
const Session = require("../models/session.model");
const { evaluateEvent } = require("./risk-engine");
const {
  applyRiskEnforcement,
  getValidActiveSandboxContext,
} = require("./enforcement.service");

const ACTIVE_WATCHERS = new Map();

function createFileEvent(action, filePath, workspace) {
  return {
    type: "filesystem",
    action,
    path: filePath,
    ...(workspace ? { workspace } : {}),
    timestamp: new Date(),
  };
}

async function saveEvent(event) {
  try {
    const sandboxContext = await getValidActiveSandboxContext();
    const workspace = event.workspace || sandboxContext?.metadata?.projectPath;
    const enrichedEvent = {
      ...event,
      workspace,
    };
    const riskAssessment = evaluateEvent(enrichedEvent);
    const enforcementResult = await applyRiskEnforcement(enrichedEvent, riskAssessment, {
      container: sandboxContext?.container,
    });
    const savedEvent = await Event.create({
      type: event.type,
      action: event.action,
      path: event.path,
      timestamp: event.timestamp,
      ...(sandboxContext?.metadata?.sessionId ? { sessionId: sandboxContext.metadata.sessionId } : {}),
      riskLevel: riskAssessment.riskLevel,
      riskScore: riskAssessment.riskScore,
      riskReason: riskAssessment.reason,
      enforcementAction: enforcementResult.enforcementAction,
      enforcementStatus: enforcementResult.enforcementStatus,
      enforcementTimestamp: enforcementResult.enforcementTimestamp,
    });
    if (sandboxContext?.metadata?.sessionId && enforcementResult.enforcementStatus === "paused") {
      await Session.findOneAndUpdate(
        { sessionId: sandboxContext.metadata.sessionId, status: { $in: ["RUNNING", "COMPLETED"] } },
        { status: "PAUSED" }
      );
    }
    if (sandboxContext?.metadata?.sessionId && ["terminated", "already_stopped"].includes(enforcementResult.enforcementStatus)) {
      await Session.findOneAndUpdate(
        { sessionId: sandboxContext.metadata.sessionId, status: { $in: ["RUNNING", "PAUSED"] } },
        { status: "KILLED", finishedAt: new Date(), exitCode: null }
      );
    }
    console.log("EVENT SAVED:", savedEvent);
  } catch (error) {
    console.error("Failed to save event:", error.message);
  }
}

function watchProject(projectPath, onEvent) {
  if (!projectPath) return null;
  const resolvedPath = path.resolve(projectPath);

  if (ACTIVE_WATCHERS.has(resolvedPath)) {
    return ACTIVE_WATCHERS.get(resolvedPath);
  }

  const watcher = chokidar.watch(resolvedPath, {
    persistent: true,
    ignoreInitial: true,
  });

  const handleEvent = (event) => {
    console.log("AGENTGUARD EVENT:", event);

    saveEvent(event);

    if (onEvent) {
      onEvent(event);
    }
  };

  watcher.on("add", (filePath) => {
    handleEvent(createFileEvent("created", filePath, resolvedPath));
  });

  watcher.on("change", (filePath) => {
    handleEvent(createFileEvent("changed", filePath, resolvedPath));
  });

  watcher.on("unlink", (filePath) => {
    handleEvent(createFileEvent("deleted", filePath, resolvedPath));
  });

  watcher.on("error", (error) => {
    console.error("Filesystem watcher error:", error);
  });

  console.log(`Watching project: ${resolvedPath}`);
  ACTIVE_WATCHERS.set(resolvedPath, watcher);

  return watcher;
}

function unwatchProject(projectPath) {
  if (!projectPath) return false;
  const resolvedPath = path.resolve(projectPath);
  const watcher = ACTIVE_WATCHERS.get(resolvedPath);
  if (watcher) {
    watcher.close();
    ACTIVE_WATCHERS.delete(resolvedPath);
    console.log(`Stopped watching project: ${resolvedPath}`);
    return true;
  }
  return false;
}

module.exports = {
  ACTIVE_WATCHERS,
  watchProject,
  unwatchProject,
};