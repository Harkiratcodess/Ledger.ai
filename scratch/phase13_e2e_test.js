#!/usr/bin/env node
/**
 * AgentGuard / Ledger — Phase 13 End-to-End Product & Workflow Test
 *
 * Tests the complete developer workflow:
 *   1. Installation / CLI verification (ledger, agentguard, ledger-mcp, agentguard-mcp)
 *   2. Creation of clean external project outside repository
 *   3. Protecting the workspace (ledger protect <workspace> --detach)
 *   4. Generic MCP gateway startup & connection
 *   5. Normal realistic coding workload via MCP
 *   6. Observability (filesystem & network events, metadata-only policy, MongoDB persistence)
 *   7. HIGH-risk sensitive path protection (.env -> pause sandbox -> blocked MCP exec -> resume)
 *   8. Session kill & cleanup
 *   9. Security boundaries audit
 *  10. Zero-orphan Docker hygiene
 */

const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const API_URL = process.env.AGENTGUARD_API_URL || "http://localhost:5000";
const ROOT_DIR = path.resolve(__dirname, "..");
const TEMP_WORKSPACE = path.resolve(os.tmpdir(), "ledger-demo-project-" + Date.now());

let passed = 0;
let failed = 0;
const results = [];

function pass(name, detail = "") {
  passed++;
  results.push({ pass: true, name, detail });
  console.log(`  ✅ PASS  ${name} ${detail ? `(${detail})` : ""}`);
}

function fail(name, reason = "") {
  failed++;
  results.push({ pass: false, name, reason });
  console.log(`  ❌ FAIL  ${name}`);
  if (reason) console.log(`           ${reason}`);
}

async function check(name, fn) {
  try {
    const detail = await fn();
    pass(name, typeof detail === "string" ? detail : "");
  } catch (err) {
    fail(name, err.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

// ── HTTP API Client ───────────────────────────────────────────────────────────

async function api(method, endpoint, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15000),
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ── CLI Runner ────────────────────────────────────────────────────────────────

function runCli(command, args = [], cwd = ROOT_DIR) {
  try {
    const stdout = execSync(`${command} ${args.join(" ")}`, {
      cwd,
      encoding: "utf8",
      env: { ...process.env, AGENTGUARD_API_URL: API_URL },
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 30000,
    });
    return { code: 0, output: stdout };
  } catch (err) {
    return {
      code: err.status ?? 1,
      output: (err.stdout || "") + (err.stderr || "") + (err.message || ""),
    };
  }
}

// ── MCP Helper ────────────────────────────────────────────────────────────────

let mcpProc = null;
let mcpBuffer = "";
let mcpId = 0;
const pendingMcp = new Map();

function startMcp(sessionId) {
  const env = {
    ...process.env,
    AGENTGUARD_API_URL: API_URL,
  };
  if (sessionId) env.AGENTGUARD_SESSION_ID = sessionId;

  mcpProc = spawn("ledger-mcp", {
    env,
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });

  mcpProc.stdout.setEncoding("utf8");
  mcpProc.stdout.on("data", (chunk) => {
    mcpBuffer += chunk;
    const lines = mcpBuffer.split("\n");
    mcpBuffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let msg;
      try { msg = JSON.parse(trimmed); } catch { continue; }
      if (msg.method) continue; // ignore notifications
      const cb = pendingMcp.get(msg.id);
      if (cb) {
        pendingMcp.delete(msg.id);
        cb(null, msg);
      }
    }
  });

  mcpProc.stderr.on("data", () => {}); // suppress stderr in test output
}

function mcpCall(method, params, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const id = ++mcpId;
    const timer = setTimeout(() => {
      pendingMcp.delete(id);
      reject(new Error(`MCP call '${method}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pendingMcp.set(id, (err, msg) => {
      clearTimeout(timer);
      if (err) return reject(err);
      resolve(msg);
    });

    const req = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    mcpProc.stdin.write(req);
  });
}

function stopMcp() {
  if (mcpProc) {
    mcpProc.stdin.end();
    mcpProc.kill("SIGTERM");
    mcpProc = null;
  }
}

// ── Main E2E Workflow ─────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  LEDGER (POWERED BY AGENTGUARD) — PHASE 13 E2E PRODUCT TEST");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Backend URL   : ${API_URL}`);
  console.log(`  Temp Workspace: ${TEMP_WORKSPACE}`);
  console.log("───────────────────────────────────────────────────────────────\n");

  let activeSessionId = null;

  // ───────────────────────────────────────────────────────────────────────────
  // PART 1 — INSTALLATION & CLI HEALTH
  // ───────────────────────────────────────────────────────────────────────────
  console.log("── PART 1: INSTALLATION & COMMAND AVAILABILITY ─────────────────");

  await check("ledger --help works globally outside backend dir", () => {
    const res = runCli("ledger", ["--help"], os.tmpdir());
    assert(res.code === 0, `Exit code ${res.code}`);
    assert(res.output.includes("Ledger CLI"), "Missing Ledger CLI header");
    assert(res.output.includes("USAGE:") && res.output.includes("COMMANDS:"), "Missing USAGE/COMMANDS");
    return "exit 0, Ledger branding present";
  });

  await check("ledger status returns clean inactive state", () => {
    const res = runCli("ledger", ["status"], os.tmpdir());
    assert(res.code === 0, `Exit code ${res.code}`);
    assert(res.output.includes("INACTIVE"), "Expected INACTIVE");
    return "inactive status confirmed";
  });

  await check("agentguard backwards-compatible alias works", () => {
    const res = runCli("agentguard", ["--version"], os.tmpdir());
    assert(res.code === 0, `Exit code ${res.code}`);
    assert(res.output.includes("v0.1.0"), "Missing version");
    return "agentguard alias verified";
  });

  await check("ledger-mcp command is available and speaks JSON-RPC", async () => {
    const res = await new Promise((resolve, reject) => {
      const p = spawn("ledger-mcp", { shell: true, stdio: ["pipe", "pipe", "pipe"] });
      let out = "";
      p.stdout.on("data", (d) => { out += d.toString(); });
      p.on("close", () => resolve(out));
      p.on("error", reject);
      p.stdin.write(JSON.stringify({
        jsonrpc: "2.0", id: 999, method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0" } }
      }) + "\n");
      setTimeout(() => p.kill(), 3000);
    });
    assert(res.includes("agentguard-mcp") || res.includes("protocolVersion"), `Unexpected MCP response: ${res}`);
    return "JSON-RPC handshake response verified";
  });

  await check("agentguard-mcp backwards-compatible binary works", async () => {
    const res = await new Promise((resolve, reject) => {
      const p = spawn("agentguard-mcp", { shell: true, stdio: ["pipe", "pipe", "pipe"] });
      let out = "";
      p.stdout.on("data", (d) => { out += d.toString(); });
      p.on("close", () => resolve(out));
      p.on("error", reject);
      p.stdin.write(JSON.stringify({
        jsonrpc: "2.0", id: 998, method: "ping", params: {}
      }) + "\n");
      setTimeout(() => p.kill(), 3000);
    });
    assert(res.includes("result"), `Unexpected ping response: ${res}`);
    return "agentguard-mcp ping confirmed";
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 2 — CLEAN EXTERNAL WORKSPACE CREATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 2: CREATE CLEAN DEMO WORKSPACE OUTSIDE REPO ────────────");

  await check("Create clean project directory outside Ledger repository", () => {
    if (fs.existsSync(TEMP_WORKSPACE)) {
      fs.rmSync(TEMP_WORKSPACE, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_WORKSPACE, { recursive: true });

    // Seed realistic developer project
    fs.writeFileSync(
      path.join(TEMP_WORKSPACE, "package.json"),
      JSON.stringify({ name: "ledger-demo-app", version: "1.0.0", main: "index.js" }, null, 2)
    );
    fs.writeFileSync(
      path.join(TEMP_WORKSPACE, "index.js"),
      'console.log("Welcome to Ledger Demo App");\n'
    );
    fs.writeFileSync(
      path.join(TEMP_WORKSPACE, "test.js"),
      'const assert = require("assert");\nassert.strictEqual(1 + 1, 2);\nconsole.log("Math test passed");\n'
    );

    assert(fs.existsSync(path.join(TEMP_WORKSPACE, "package.json")), "package.json missing");
    assert(fs.existsSync(path.join(TEMP_WORKSPACE, "index.js")), "index.js missing");
    assert(fs.existsSync(path.join(TEMP_WORKSPACE, "test.js")), "test.js missing");
    return `Created files in ${TEMP_WORKSPACE}`;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 3 — PROTECT WORKSPACE VIA CLI
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 3: PROTECT WORKSPACE (ledger protect) ──────────────────");

  await check("ledger protect starts protected sandbox environment", () => {
    const res = runCli("ledger", ["protect", `"${TEMP_WORKSPACE}"`, "--detach"], os.tmpdir());
    assert(res.code === 0, `CLI failed with exit code ${res.code}: ${res.output}`);
    assert(res.output.includes("AgentGuard protected runtime started") || res.output.includes("Ledger"), "Missing startup banner");
    assert(res.output.includes("Network monitoring: enabled"), "Network monitoring not enabled");
    assert(res.output.includes("Filesystem monitoring: enabled"), "Filesystem monitoring not enabled");
    assert(res.output.includes("Risk enforcement: enabled"), "Risk enforcement not enabled");
    return "Sandbox created & monitoring active";
  });

  await check("ledger status shows ACTIVE session and container tracking", async () => {
    const { data } = await api("GET", "/api/sandbox/status");
    assert(data.active === true, "Sandbox is not active");
    assert(data.running === true, "Sandbox container is not running");
    assert(data.sessionId, "Missing sessionId");
    activeSessionId = data.sessionId;
    return `Session: ${activeSessionId}, Container: ${data.containerId?.slice(0, 12)}`;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 4 — START & CONNECT MCP GATEWAY
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 4: MCP GATEWAY INITIALIZATION ─────────────────────────");

  startMcp(activeSessionId);
  await new Promise((r) => setTimeout(r, 1500));

  await check("MCP initialize handshake over STDIO", async () => {
    const res = await mcpCall("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "ledger-test-agent", version: "1.0.0" },
    });
    assert(!res.error, `MCP initialize error: ${res.error?.message}`);
    assert(res.result?.protocolVersion, "Missing protocolVersion");
    return `Handshake OK (${res.result?.serverInfo?.name} v${res.result?.serverInfo?.version})`;
  });

  await check("MCP tools/list exposes all 4 protected tools", async () => {
    const res = await mcpCall("tools/list", {});
    assert(!res.error, `tools/list error: ${res.error?.message}`);
    const tools = res.result?.tools || [];
    const names = tools.map((t) => t.name);
    assert(names.includes("protected_execute"), "protected_execute missing");
    assert(names.includes("protected_read_file"), "protected_read_file missing");
    assert(names.includes("protected_write_file"), "protected_write_file missing");
    assert(names.includes("protected_network_request"), "protected_network_request missing");
    return `${tools.length} tools available`;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 5 — REALISTIC CODING WORKLOAD VIA MCP
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 5: NORMAL CODING WORKLOAD VIA PROTECTED BOUNDARY ───────");

  await check("Step 1: Inspect project files (protected_execute ls)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "ls -la /workspace" },
    });
    assert(!res.result?.isError, "Tool returned error");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.exitCode === 0, `Exit code ${data.exitCode}`);
    assert(data.stdout.includes("package.json"), "package.json not in output");
    assert(data.stdout.includes("index.js"), "index.js not in output");
    return "workspace files listed";
  });

  await check("Step 2: Read source file (protected_read_file index.js)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: "index.js" },
    });
    assert(!res.result?.isError, "Tool returned error");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.content.includes("Welcome to Ledger Demo App"), "Content mismatch");
    return "read index.js successfully";
  });

  await check("Step 3: Create a helper file (protected_write_file utils.js)", async () => {
    const helperCode = 'function add(a, b) { return a + b; }\nmodule.exports = { add };\n';
    const res = await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: "utils.js", content: helperCode },
    });
    assert(!res.result?.isError, "Tool returned error");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.success === true, "success !== true");
    assert(data.path === "/workspace/utils.js", `Unexpected path: ${data.path}`);
    return "created utils.js";
  });

  await check("Step 4: Modify existing file (protected_write_file index.js)", async () => {
    const updatedCode = 'const { add } = require("./utils");\nconsole.log("Sum:", add(2, 3));\n';
    const res = await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: "index.js", content: updatedCode },
    });
    assert(!res.result?.isError, "Tool returned error");
    return "updated index.js to use helper";
  });

  await check("Step 5: Run tests inside sandbox (protected_execute node test.js)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "node test.js" },
    });
    assert(!res.result?.isError, "Tool returned error");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.exitCode === 0, `Exit code ${data.exitCode}`);
    assert(data.stdout.includes("Math test passed"), "Test assertion failed");
    return "test passed with exit code 0";
  });

  await check("Step 6: Execute updated code (protected_execute node index.js)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "node index.js" },
    });
    assert(!res.result?.isError, "Tool returned error");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.exitCode === 0, `Exit code ${data.exitCode}`);
    assert(data.stdout.includes("Sum: 5"), "Unexpected calculation output");
    return "computed Sum: 5";
  });

  await check("Step 7: Harmless network request via proxy (protected_network_request)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_network_request",
      arguments: { url: "http://example.com/", method: "GET" },
    });
    assert(!res.result?.isError, `Tool returned error: ${res.result?.content?.[0]?.text}`);
    const data = JSON.parse(res.result.content[0].text);
    assert(data.statusCode === 200, `HTTP status ${data.statusCode}`);
    assert(data.note.includes("metadata only"), "Metadata note missing");
    return `HTTP ${data.statusCode} through mitmproxy`;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 6 — OBSERVABILITY & RISK VERIFICATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 6: OBSERVABILITY & EVENT METADATA AUDIT ───────────────");

  await check("Filesystem events recorded in MongoDB with risk assessment", async () => {
    await new Promise((r) => setTimeout(r, 2000)); // allow events to flush
    const { data } = await api("GET", `/api/sessions/${activeSessionId}/events`);
    const events = data.events || [];
    const fsEvents = events.filter((e) => e.type === "filesystem");
    assert(fsEvents.length >= 2, `Expected >= 2 fs events, found ${fsEvents.length}`);

    const utilsEvent = fsEvents.find((e) => e.path?.includes("utils.js"));
    assert(utilsEvent, "utils.js event not found");
    assert(utilsEvent.riskLevel === "LOW", `Expected LOW risk, got ${utilsEvent.riskLevel}`);
    assert(utilsEvent.enforcementAction === "allow", `Expected allow, got ${utilsEvent.enforcementAction}`);
    return `${fsEvents.length} fs events recorded (all LOW risk / allow)`;
  });

  await check("Network request recorded with metadata only (no body stored)", async () => {
    const { data } = await api("GET", `/api/sessions/${activeSessionId}/events`);
    const events = data.events || [];
    const netEvent = events.find((e) => e.type === "network");
    assert(netEvent, "No network event recorded");
    assert(netEvent.hostname === "example.com" || netEvent.url?.includes("example.com"), "Wrong hostname");
    assert(netEvent.method === "GET", `Expected GET, got ${netEvent.method}`);
    assert(netEvent.statusCode === 200, `Expected 200, got ${netEvent.statusCode}`);
    assert(netEvent.body === undefined, "Security policy violation: body was stored");
    assert(netEvent.responseBody === undefined, "Security policy violation: responseBody was stored");
    assert(netEvent.riskLevel === "LOW", `Expected LOW risk for allowlist, got ${netEvent.riskLevel}`);
    return "example.com GET:200 metadata-only confirmed";
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 7 — HIGH-RISK SENSITIVE PATH PROTECTION & PAUSE
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 7: HIGH-RISK PROTECTION & SANDBOX FREEZE ───────────────");

  await check("Writing sensitive .env file triggers HIGH risk and freezes sandbox", async () => {
    // Write sensitive file
    await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: ".env", content: "DATABASE_PASSWORD=secret_12345" },
    });

    // Wait for chokidar event & enforcement
    await new Promise((r) => setTimeout(r, 4000));

    const { data: status } = await api("GET", "/api/sandbox/status");
    assert(status.paused === true || status.status === "paused", `Sandbox not paused: ${JSON.stringify(status)}`);

    const { data: eventData } = await api("GET", `/api/sessions/${activeSessionId}/events`);
    const envEvent = (eventData.events || []).find(
      (e) => e.type === "filesystem" && e.path?.includes(".env") && e.riskLevel === "HIGH"
    );
    assert(envEvent, "HIGH-risk .env event not found in database");
    assert(envEvent.enforcementAction === "pause", `Expected pause action, got ${envEvent.enforcementAction}`);
    return `Sandbox PAUSED. Event: ${envEvent.riskReason}`;
  });

  await check("MCP protected_execute is blocked while sandbox is paused", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "echo should_be_blocked" },
    });
    assert(res.result?.isError === true, "Expected tool error when paused");
    const errObj = JSON.parse(res.result.content[0].text);
    assert(errObj.error.toLowerCase().includes("paused"), `Error text missing 'paused': ${errObj.error}`);
    return `Blocked: "${errObj.error}"`;
  });

  await check("Sandbox does not automatically resume", async () => {
    await new Promise((r) => setTimeout(r, 1500));
    const { data: status } = await api("GET", "/api/sandbox/status");
    assert(status.paused === true, "Security violation: sandbox resumed automatically");
    return "Sandbox remains safely frozen";
  });

  await check("Explicit resume via CLI restores sandbox execution", async () => {
    const res = runCli("ledger", ["resume"], os.tmpdir());
    assert(res.code === 0, `Resume failed: ${res.output}`);

    await new Promise((r) => setTimeout(r, 1000));
    const { data: status } = await api("GET", "/api/sandbox/status");
    assert(status.paused === false, "Sandbox still paused after resume");

    // Execution should now succeed
    const execRes = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "echo resumed_and_healthy" },
    });
    assert(!execRes.result?.isError, "Exec failed after resume");
    const data = JSON.parse(execRes.result.content[0].text);
    assert(data.stdout.trim() === "resumed_and_healthy", `Output mismatch: ${data.stdout}`);
    return "Resumed successfully, commands execute normally";
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 8 — SECURITY BOUNDARIES AUDIT
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 8: SECURITY BOUNDARY AUDIT ─────────────────────────────");

  await check("Path guard rejects parent traversal (../../etc/passwd)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: "../../etc/passwd" },
    });
    assert(res.result?.isError === true, "Path traversal was not rejected");
    return "Path traversal blocked at gateway";
  });

  await check("Path guard rejects absolute Linux paths (/etc/shadow)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: "/etc/shadow" },
    });
    assert(res.result?.isError === true, "Absolute path was not rejected");
    return "Absolute path blocked at gateway";
  });

  await check("Path guard rejects SSH credential stores (.ssh/id_rsa)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: ".ssh/id_rsa", content: "fake_key" },
    });
    assert(res.result?.isError === true, ".ssh path was not rejected");
    return ".ssh directory access blocked";
  });

  await check("Path guard rejects AWS credential stores (.aws/credentials)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: ".aws/credentials" },
    });
    assert(res.result?.isError === true, ".aws path was not rejected");
    return ".aws directory access blocked";
  });

  await check("Commands run in container /workspace (NOT host root or home)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "pwd" },
    });
    assert(!res.result?.isError, "pwd command failed");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.stdout.trim() === "/workspace", `Expected /workspace, got: ${data.stdout.trim()}`);
    return "Working directory strictly confined to /workspace";
  });

  await check("Docker socket is NOT accessible inside sandbox", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "test -e /var/run/docker.sock && echo EXPOSED || echo SAFE" },
    });
    assert(!res.result?.isError, "Exec failed");
    const data = JSON.parse(res.result.content[0].text);
    assert(data.stdout.trim() === "SAFE", "Docker socket is exposed in container!");
    return "Docker socket unmounted";
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 9 — SESSION KILL & TEARDOWN
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 9: SESSION KILL & LIFECYCLE TEARDOWN ───────────────────");

  await check("ledger kill terminates the sandbox and updates session state", async () => {
    stopMcp(); // cleanly stop MCP client first

    const res = runCli("ledger", ["kill"], os.tmpdir());
    assert(res.code === 0, `Kill failed: ${res.output}`);

    const { data: status } = await api("GET", "/api/sandbox/status");
    assert(status.active === false, "Sandbox still active after kill");

    const { data: sessionData } = await api("GET", `/api/sessions/${activeSessionId}`);
    assert(sessionData.session.status === "KILLED", `Session status: ${sessionData.session.status}`);
    return `Session ${activeSessionId} marked KILLED`;
  });

  await check("MCP execute fails cleanly against terminated session", async () => {
    startMcp(activeSessionId);
    await new Promise((r) => setTimeout(r, 1000));

    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "echo post_kill" },
    });
    assert(res.result?.isError === true, "Expected error on killed session");
    stopMcp();
    return "Execution denied on killed session";
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 10 — CLEANUP & DOCKER HYGIENE AUDIT
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n── PART 10: CLEANUP & CONTAINER HYGIENE AUDIT ──────────────────");

  await check("Clean up temporary external workspace", () => {
    if (fs.existsSync(TEMP_WORKSPACE)) {
      fs.rmSync(TEMP_WORKSPACE, { recursive: true, force: true });
    }
    assert(!fs.existsSync(TEMP_WORKSPACE), "Temp workspace still exists");
    return "Temporary workspace removed";
  });

  await check("No orphan AgentGuard / Ledger sandbox containers running in Docker", () => {
    const dockerPs = execSync("docker ps --filter \"ancestor=node:20-slim\" --format \"{{.ID}}\"", {
      encoding: "utf8",
    }).trim();
    assert(!dockerPs, `Found orphan containers: ${dockerPs}`);
    return "Zero orphan sandbox containers running";
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  PHASE 13 E2E RESULTS");
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  Total Tests : ${passed + failed}`);
  console.log(`  ✅ Passed    : ${passed}`);
  console.log(`  ❌ Failed    : ${failed}`);
  console.log("═══════════════════════════════════════════════════════════════");

  if (failed > 0) {
    console.log("\n  ❌ PHASE 13 FAILED\n");
    process.exit(1);
  } else {
    console.log(`\n  ✅ PHASE 13 PASSED (${passed}/${passed} tests)\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("\n[FATAL ERROR]", err);
  if (mcpProc) mcpProc.kill();
  process.exit(1);
});
