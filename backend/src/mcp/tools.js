/**
 * AgentGuard MCP Tool Implementations
 *
 * Thin wrappers over the AgentGuard backend REST API.
 * No risk logic here — the existing backend risk engine + enforcement
 * remain the source of truth.
 */

const { guardWorkspacePath } = require("./path-guard");

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * POST a JSON body to the AgentGuard backend and return the parsed response.
 */
async function backendPost(apiUrl, endpoint, body) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  return { status: res.status, data: await res.json() };
}

async function backendGet(apiUrl, endpoint) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  return { status: res.status, data: await res.json() };
}

/**
 * Resolves the session ID: uses explicit env var or falls back to active sandbox status.
 * Returns null if no valid session is found.
 */
async function resolveSession(apiUrl) {
  const envSession = process.env.AGENTGUARD_SESSION_ID;
  if (envSession) {
    return envSession;
  }
  try {
    const { data } = await backendGet(apiUrl, "/api/sandbox/status");
    return data?.active && data?.sessionId ? data.sessionId : null;
  } catch (err) {
    return null;
  }
}

/**
 * Validates backend availability and resolves an active session.
 * Returns { sessionId } or throws a structured MCP error string.
 */
async function requireSession(apiUrl) {
  // 1. Check backend is reachable
  let healthData;
  try {
    const { data } = await backendGet(apiUrl, "/api/health");
    healthData = data;
  } catch (err) {
    throw new Error(
      "Ledger backend is not reachable. " +
      `Ensure it is running at ${apiUrl} (npm start in backend/).`
    );
  }

  if (healthData?.prerequisites?.docker === false) {
    throw new Error(
      "Docker is not running. Start Docker Desktop and retry."
    );
  }
  if (healthData?.prerequisites?.mongodb === false) {
    throw new Error(
      "MongoDB is unavailable. Configure MONGODB_URI or start MongoDB."
    );
  }

  // 2. Resolve session
  const sessionId = await resolveSession(apiUrl);
  if (!sessionId) {
    throw new Error(
      "No active Ledger session found. " +
      "Start a protected sandbox first: ledger protect <workspace>"
    );
  }

  return { sessionId };
}

/**
 * Executes an array of command tokens inside the AgentGuard protected sandbox.
 * Command must be a string (run via sh -lc) or an array.
 *
 * Input schema:
 *   command: string | string[]
 *
 * Returns: { exitCode, stdout, stderr }
 */
async function protectedExecute(apiUrl, args) {
  const { command } = args;

  if (!command) {
    throw new Error("'command' is required.");
  }

  const { sessionId } = await requireSession(apiUrl);

  let commandArray;
  if (typeof command === "string") {
    commandArray = ["sh", "-lc", command];
  } else if (Array.isArray(command) && command.every((t) => typeof t === "string")) {
    commandArray = command;
  } else {
    throw new Error("'command' must be a string or array of strings.");
  }

  const { status, data } = await backendPost(
    apiUrl,
    `/api/sessions/${sessionId}/execute`,
    { command: commandArray }
  );

  if (status === 409) {
    const msg = data?.error || "Sandbox unavailable.";
    if (msg.toLowerCase().includes("paused")) {
      throw new Error(
        "Protected session is PAUSED by Ledger enforcement. " +
        "Review events and use 'ledger resume' to continue."
      );
    }
    if (msg.toLowerCase().includes("killed") || msg.toLowerCase().includes("completed") || msg.toLowerCase().includes("state")) {
      throw new Error(
        "Protected session has ended. " +
        "Start a new session with: ledger protect <workspace>"
      );
    }
    throw new Error(`Sandbox rejected execution: ${msg}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Command execution failed.");
  }

  const exec = data.execution;
  return {
    exitCode: exec.exitCode,
    stdout: exec.stdout || "",
    stderr: exec.stderr || "",
  };
}

/**
 * Reads a file from the protected workspace.
 * Path must be relative (e.g. "src/main.js") — not an absolute host path.
 *
 * Input schema:
 *   path: string  (relative to workspace root)
 *
 * Returns: { content: string }
 */
async function protectedReadFile(apiUrl, args) {
  const { path: userPath } = args;
  const containerPath = guardWorkspacePath(userPath);

  const result = await protectedExecute(apiUrl, {
    command: ["cat", containerPath],
  });

  if (result.exitCode !== 0) {
    throw new Error(
      `File not found or unreadable: ${userPath}. ${result.stderr.trim()}`
    );
  }

  return { content: result.stdout };
}

/**
 * Writes content to a file inside the protected workspace.
 * Path must be relative. Content is a string.
 * The write goes through the existing sandbox execute path, so the
 * filesystem watcher fires and the risk engine evaluates the write.
 *
 * Input schema:
 *   path: string  (relative to workspace root)
 *   content: string
 *
 * Returns: { success: true, path: containerPath }
 */
async function protectedWriteFile(apiUrl, args) {
  const { path: userPath, content } = args;

  if (content === undefined || content === null) {
    throw new Error("'content' is required.");
  }
  if (typeof content !== "string") {
    throw new Error("'content' must be a string.");
  }

  const containerPath = guardWorkspacePath(userPath);

  // Use printf to safely write arbitrary content without shell injection
  // The content is base64-encoded and decoded inside the container.
  const b64 = Buffer.from(content).toString("base64");
  const cmd = `printf '%s' "${b64}" | base64 -d > "${containerPath}"`;

  const result = await protectedExecute(apiUrl, { command: cmd });

  if (result.exitCode !== 0) {
    throw new Error(
      `Write failed for ${userPath}. ${result.stderr.trim()}`
    );
  }

  return { success: true, path: containerPath };
}

/**
 * Makes an HTTP request from inside the protected sandbox.
 * Traffic routes through the existing HTTP_PROXY (mitmproxy) already
 * configured in the container environment, so the request is fully
 * intercepted by the existing network monitoring pipeline.
 *
 * Input schema:
 *   url: string        (http/https URL)
 *   method: string     (default: GET)
 *
 * Returns: { statusCode, url, method }
 * Note: response body is NOT returned (metadata only, matching existing policy).
 */
async function protectedNetworkRequest(apiUrl, args) {
  const { url, method = "GET" } = args;

  if (!url || typeof url !== "string") {
    throw new Error("'url' is required and must be a string.");
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new Error("Only http:// and https:// URLs are supported.");
  }

  const safeMethod = String(method).toUpperCase();
  if (!["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(safeMethod)) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  // Build a self-contained Node.js script that runs inside the container.
  // The container already has HTTP_PROXY set → mitmproxy intercepts this.
  const inlineScript = `
const http = require('http');
const https = require('https');
const urlObj = new URL(${JSON.stringify(url)});
const proxyHost = process.env.http_proxy
  ? new URL(process.env.http_proxy).hostname
  : 'host.docker.internal';
const proxyPort = process.env.http_proxy
  ? parseInt(new URL(process.env.http_proxy).port)
  : 8080;
const useHttp = require('http');
const req = useHttp.request({
  host: proxyHost,
  port: proxyPort,
  path: ${JSON.stringify(url)},
  method: ${JSON.stringify(safeMethod)},
  headers: { Host: urlObj.hostname }
}, (res) => {
  process.stdout.write(String(res.statusCode));
  res.on('data', () => {});
  res.on('end', () => { process.exit(0); });
});
req.on('error', (e) => { process.stderr.write(e.message); process.exit(1); });
req.end();
`.trim();

  const result = await protectedExecute(apiUrl, {
    command: ["node", "-e", inlineScript],
  });

  const statusCode = parseInt(result.stdout.trim(), 10);

  if (result.exitCode !== 0 || isNaN(statusCode)) {
    throw new Error(
      `Network request failed: ${result.stderr.trim() || "Unknown error"}`
    );
  }

  return {
    statusCode,
    url,
    method: safeMethod,
    note: "Response body is not captured by Ledger policy (metadata only).",
  };
}

module.exports = {
  protectedExecute,
  protectedReadFile,
  protectedWriteFile,
  protectedNetworkRequest,
  requireSession,
};
