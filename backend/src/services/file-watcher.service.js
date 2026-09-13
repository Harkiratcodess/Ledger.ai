const chokidar = require("chokidar");

function createFileEvent(action, filePath) {
  return {
    type: "filesystem",
    action,
    path: filePath,
    timestamp: new Date(),
  };
}

function watchProject(projectPath, onEvent) {
  const watcher = chokidar.watch(projectPath, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("add", (filePath) => {
    const event = createFileEvent("created", filePath);

    console.log("FILE EVENT:", event);

    if (onEvent) {
      onEvent(event);
    }
  });

  watcher.on("change", (filePath) => {
    const event = createFileEvent("changed", filePath);

    console.log("FILE EVENT:", event);

    if (onEvent) {
      onEvent(event);
    }
  });

  watcher.on("unlink", (filePath) => {
    const event = createFileEvent("deleted", filePath);

    console.log("FILE EVENT:", event);

    if (onEvent) {
      onEvent(event);
    }
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