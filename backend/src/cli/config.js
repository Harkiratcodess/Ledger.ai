const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  workspace: ".",
  sandboxImage: "node:20-slim",
  allowedNetworkDestinations: ["example.com", "localhost", "127.0.0.1"],
  enforcement: "pause",
  riskPolicy: "default",
};

function configDir(cwd = process.cwd()) {
  return path.join(cwd, ".ledger");
}

function configPath(cwd = process.cwd()) {
  return path.join(configDir(cwd), "config.json");
}

function loadProjectConfig(cwd = process.cwd()) {
  const file = configPath(cwd);
  if (!fs.existsSync(file)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function initProjectConfig(cwd = process.cwd()) {
  const dir = configDir(cwd);
  fs.mkdirSync(dir, { recursive: true });
  const file = configPath(cwd);
  if (fs.existsSync(file)) {
    return { created: false, path: file, config: loadProjectConfig(cwd) };
  }
  fs.writeFileSync(file, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`);
  return { created: true, path: file, config: { ...DEFAULT_CONFIG } };
}

module.exports = {
  DEFAULT_CONFIG,
  configDir,
  configPath,
  loadProjectConfig,
  initProjectConfig,
};
