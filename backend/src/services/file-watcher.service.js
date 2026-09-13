const chokidar = require("chokidar");
const Event = require("../models/event.model");

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
    await Event.create(event);
    console.log("EVENT SAVED:", event);
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