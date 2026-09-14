const chokidar = require("chokidar");
const Event = require("../models/event.model");
const { evaluateEvent } = require("./risk-engine");
const { applyRiskEnforcement, getActiveSandboxContainer } = require("./enforcement.service");

function createFileEvent(action, filePath) {
  return {
    type: "filesystem",
    action,
    path: filePath,
    timestamp: new Date(),
  };
}

async function saveEvent(event) {
  try {
    const riskAssessment = evaluateEvent(event);
    const enforcementResult = await applyRiskEnforcement(event, riskAssessment, {
      container: getActiveSandboxContainer(),
    });
    const savedEvent = await Event.create({
      ...event,
      riskLevel: riskAssessment.riskLevel,
      riskScore: riskAssessment.riskScore,
      riskReason: riskAssessment.reason,
      enforcementAction: enforcementResult.enforcementAction,
      enforcementStatus: enforcementResult.enforcementStatus,
      enforcementTimestamp: enforcementResult.enforcementTimestamp,
    });
    console.log("EVENT SAVED:", savedEvent);
  } catch (error) {
    console.error("Failed to save event:", error.message);
  }
}

function watchProject(projectPath, onEvent) {
  const watcher = chokidar.watch(projectPath, {
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
    handleEvent(createFileEvent("created", filePath));
  });

  watcher.on("change", (filePath) => {
    handleEvent(createFileEvent("changed", filePath));
  });

  watcher.on("unlink", (filePath) => {
    handleEvent(createFileEvent("deleted", filePath));
  });

  watcher.on("error", (error) => {
    console.error("Filesystem watcher error:", error);
  });

  console.log(`Watching project: ${projectPath}`);

  return watcher;
}

module.exports = {
  watchProject,
};