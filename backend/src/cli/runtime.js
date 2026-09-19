const { spawn } = require("child_process");
const path = require("path");

const DEFAULT_BACKEND_URL = process.env.AGENTGUARD_API_URL || "http://localhost:5000";

function isLocalDefaultUrl(apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return (
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      port === "5000"
    );
  } catch {
    return false;
  }
}

async function pingHealth(apiUrl, timeoutMs = 3000) {
  try {
    const res = await fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      return { ok: false, reason: "backend_error", message: `Backend responded with HTTP ${res.status}` };
    }
    const data = await res.json();
    if (data?.prerequisites) {
      if (data.prerequisites.docker === false) {
        return { ok: false, reason: "docker_down", message: "Docker is not running.\nStart Docker Desktop and retry.", data };
      }
      if (data.prerequisites.mongodb === false) {
        return { ok: false, reason: "mongo_down", message: "MongoDB is unavailable.\nConfigure MONGODB_URI or start MongoDB.", data };
      }
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      reason: "backend_unreachable",
      message:
        `Cannot connect to AgentGuard backend at ${apiUrl}.\n` +
        `Ensure the AgentGuard backend service is running ('npm start' or 'node src/server.js').`,
      error: err,
    };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(apiUrl, attempts = 24) {
  let last = { ok: false };
  for (let i = 0; i < attempts; i += 1) {
    last = await pingHealth(apiUrl);
    if (last.ok || last.reason === "docker_down" || last.reason === "mongo_down") {
      return last;
    }
    await sleep(250);
  }
  return last;
}

function startLocalRuntime() {
  const backendRoot = path.resolve(__dirname, "../..");
  const serverJs = path.join(backendRoot, "src", "server.js");
  const child = spawn(process.execPath, [serverJs], {
    cwd: backendRoot,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    env: { ...process.env, PORT: process.env.PORT || "5000" },
  });
  child.unref();
  return child.pid;
}

/**
 * Use an already-running local runtime when available.
 * Only auto-starts the headless Express process for the default localhost:5000 URL.
 */
async function ensureRuntime(apiUrl = DEFAULT_BACKEND_URL) {
  const existing = await pingHealth(apiUrl);
  if (existing.ok || existing.reason === "docker_down" || existing.reason === "mongo_down") {
    return { ...existing, started: false };
  }

  if (!isLocalDefaultUrl(apiUrl)) {
    return existing;
  }

  startLocalRuntime();
  const ready = await waitForHealth(apiUrl);
  return { ...ready, started: Boolean(ready.ok || ready.reason === "docker_down" || ready.reason === "mongo_down") };
}

module.exports = {
  DEFAULT_BACKEND_URL,
  isLocalDefaultUrl,
  pingHealth,
  ensureRuntime,
};
