#!/usr/bin/env node
/**
 * Phase 12 — AgentGuard MCP Gateway Integration Tests
 *
 * Tests the MCP server by communicating over a child_process pipe
 * (the same channel an MCP-compatible AI agent uses).
 *
 * Prerequisites (must be running):
 *   1. MongoDB
 *   2. AgentGuard backend (npm start in backend/)
 *   3. A Docker sandbox session (agentguard protect <workspace>)
 *   4. mitmproxy (optional — network tests will skip if port 8080 is unavailable)
 *
 * Usage:
 *   node scratch/phase12_mcp_test.js
 *   AGENTGUARD_SESSION_ID=<id> node scratch/phase12_mcp_test.js
 */

const { spawn } = require("child_process");
const path = require("path");
const net = require("net");

const API_URL = process.env.AGENTGUARD_API_URL || "http://localhost:5000";
const MCP_BIN = path.resolve(__dirname, "../backend/bin/agentguard-mcp.js");

// ── Test Harness ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

function pass(name) {
  passed++;
  results.push({ status: "PASS", name });
  console.log(`  ✅ PASS  ${name}`);
}

function fail(name, reason) {
  failed++;
  results.push({ status: "FAIL", name, reason });
  console.log(`  ❌ FAIL  ${name}`);
  console.log(`           ${reason}`);
}

function skip(name, reason) {
  skipped++;
  results.push({ status: "SKIP", name, reason });
  console.log(`  ⏭  SKIP  ${name} — ${reason}`);
}

async function check(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

// ── HTTP Helpers ──────────────────────────────────────────────────────────────

async function apiGet(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, { signal: AbortSignal.timeout(10000) });
  return { status: res.status, data: await res.json() };
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  return { status: res.status, data: await res.json() };
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    signal: AbortSignal.timeout(10000),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// ── MCP Client Helpers ────────────────────────────────────────────────────────

let mcpProc = null;
let msgId = 0;
let pendingCallbacks = new Map();
let mcpBuffer = "";

function startMcpServer(sessionId) {
  const env = {
    ...process.env,
    AGENTGUARD_API_URL: API_URL,
  };
  if (sessionId) env.AGENTGUARD_SESSION_ID = sessionId;

  mcpProc = spawn("node", [MCP_BIN], { env, stdio: ["pipe", "pipe", "pipe"] });

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
      // Ignore notifications
      if (msg.method) continue;
      const cb = pendingCallbacks.get(msg.id);
      if (cb) {
        pendingCallbacks.delete(msg.id);
        cb(null, msg);
      }
    }
  });

  mcpProc.stderr.on("data", () => {}); // suppress server stderr in test output
  mcpProc.on("error", (err) => console.error("[MCP PROC ERROR]", err.message));
}

function mcpCall(method, params, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timer = setTimeout(() => {
      pendingCallbacks.delete(id);
      reject(new Error(`MCP call '${method}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pendingCallbacks.set(id, (err, msg) => {
      clearTimeout(timer);
      if (err) return reject(err);
      resolve(msg);
    });

    const req = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    mcpProc.stdin.write(req);
  });
}

function stopMcpServer() {
  if (mcpProc) {
    mcpProc.stdin.end();
    mcpProc.kill("SIGTERM");
    mcpProc = null;
  }
}

// ── Port Check Helper ─────────────────────────────────────────────────────────

function isPortOpen(port, host = "127.0.0.1", timeout = 1000) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(timeout);
    sock.on("connect", () => { sock.destroy(); resolve(true); });
    sock.on("error", () => { sock.destroy(); resolve(false); });
    sock.on("timeout", () => { sock.destroy(); resolve(false); });
    sock.connect(port, host);
  });
}

// ── Path Guard Unit Tests (no backend needed) ─────────────────────────────────

function runPathGuardTests() {
  const { guardWorkspacePath } = require("../backend/src/mcp/path-guard");
  console.log("\n── Path Guard Unit Tests ──────────────────────────────────────");

  const guardCheck = (name, fn) => {
    try { fn(); pass(name); } catch (e) { fail(name, e.message); }
  };

  guardCheck("guardWorkspacePath: rejects traversal (../)", () => {
    let threw = false;
    try { guardWorkspacePath("../etc/passwd"); } catch { threw = true; }
    assert(threw, "Should have thrown on traversal");
  });

  guardCheck("guardWorkspacePath: rejects absolute Linux path", () => {
    let threw = false;
    try { guardWorkspacePath("/etc/passwd"); } catch { threw = true; }
    assert(threw, "Should have thrown on absolute path");
  });

  guardCheck("guardWorkspacePath: rejects absolute Windows path", () => {
    let threw = false;
    try { guardWorkspacePath("C:\\Windows\\System32"); } catch { threw = true; }
    assert(threw, "Should have thrown on absolute Windows path");
  });

  guardCheck("guardWorkspacePath: rejects .ssh directory", () => {
    let threw = false;
    try { guardWorkspacePath(".ssh/id_rsa"); } catch { threw = true; }
    assert(threw, "Should have thrown on .ssh path");
  });

  guardCheck("guardWorkspacePath: rejects .aws path", () => {
    let threw = false;
    try { guardWorkspacePath(".aws/credentials"); } catch { threw = true; }
    assert(threw, "Should have thrown on .aws path");
  });

  guardCheck("guardWorkspacePath: rejects blocked filename (id_rsa)", () => {
    let threw = false;
    try { guardWorkspacePath("id_rsa"); } catch { threw = true; }
    assert(threw, "Should have thrown on blocked filename");
  });

  guardCheck("guardWorkspacePath: accepts valid relative path (src/app.js)", () => {
    const result = guardWorkspacePath("src/app.js");
    assert(result === "/workspace/src/app.js", `Expected /workspace/src/app.js, got ${result}`);
  });

  guardCheck("guardWorkspacePath: strips leading ./", () => {
    const result = guardWorkspacePath("./output.txt");
    assert(result === "/workspace/output.txt", `Expected /workspace/output.txt, got ${result}`);
  });

  guardCheck("guardWorkspacePath: rejects empty string", () => {
    let threw = false;
    try { guardWorkspacePath(""); } catch { threw = true; }
    assert(threw, "Should have thrown on empty string");
  });
}

// ── MCP Protocol Tests (against running server) ───────────────────────────────

async function runMcpTests(sessionId, proxyAvailable) {
  console.log("\n── MCP Protocol Tests ─────────────────────────────────────────");

  // Test: initialize
  await check("MCP initialize handshake succeeds", async () => {
    const res = await mcpCall("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "phase12-test-client", version: "1.0.0" },
    });
    assert(!res.error, `Got error: ${res.error?.message}`);
    assert(res.result?.serverInfo?.name === "agentguard-mcp", "Server name mismatch");
    assert(res.result?.protocolVersion, "Missing protocolVersion");
  });

  // Test: tools/list
  await check("tools/list returns 4 protected tools", async () => {
    const res = await mcpCall("tools/list", {});
    assert(!res.error, `Got error: ${res.error?.message}`);
    const tools = res.result?.tools || [];
    assert(tools.length === 4, `Expected 4 tools, got ${tools.length}`);
    const names = tools.map((t) => t.name);
    assert(names.includes("protected_execute"), "Missing protected_execute");
    assert(names.includes("protected_read_file"), "Missing protected_read_file");
    assert(names.includes("protected_write_file"), "Missing protected_write_file");
    assert(names.includes("protected_network_request"), "Missing protected_network_request");
  });

  // Test: each tool has inputSchema
  await check("All tools have inputSchema with required properties", async () => {
    const res = await mcpCall("tools/list", {});
    const tools = res.result?.tools || [];
    for (const tool of tools) {
      assert(tool.inputSchema, `Tool '${tool.name}' missing inputSchema`);
      assert(tool.inputSchema.type === "object", `Tool '${tool.name}' inputSchema.type !== 'object'`);
    }
  });

  // Test: ping
  await check("MCP ping responds", async () => {
    const res = await mcpCall("ping", {});
    assert(!res.error, `Got error: ${res.error?.message}`);
  });

  // Test: unknown tool
  await check("Unknown tool returns isError: true (not JSON-RPC error)", async () => {
    const res = await mcpCall("tools/call", { name: "non_existent_tool", arguments: {} });
    assert(!res.error, "Should not be a JSON-RPC protocol error");
    assert(res.result?.isError === true, "Should be tool-level isError");
  });

  // Test: unknown method
  await check("Unknown RPC method returns JSON-RPC -32601", async () => {
    const res = await mcpCall("nonexistent/method", {});
    assert(res.error?.code === -32601, `Expected -32601, got ${res.error?.code}`);
  });

  // Test: protected_execute — benign command
  await check("protected_execute: runs echo inside sandbox", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "echo agentguard-mcp-test" },
    }, 30000);
    assert(!res.error, `RPC error: ${res.error?.message}`);
    if (res.result?.isError) {
      throw new Error(JSON.parse(res.result.content[0].text).error);
    }
    const result = JSON.parse(res.result.content[0].text);
    assert(result.exitCode === 0, `exitCode=${result.exitCode}`);
    assert(result.stdout.trim() === "agentguard-mcp-test", `stdout="${result.stdout.trim()}"`);
  });

  // Test: protected_execute — command runs inside container (not host)
  await check("protected_execute: pwd is /workspace (container, not host)", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "pwd" },
    }, 30000);
    const result = JSON.parse(res.result.content[0].text);
    if (res.result?.isError) {
      throw new Error(result.error);
    }
    // pwd should be /workspace (the mounted working dir), not a Windows path
    const wd = result.stdout.trim();
    assert(!wd.includes("\\"), `Appears to be running on host (got: ${wd})`);
    assert(!wd.match(/^[A-Z]:/i), `Appears to be running on host (got: ${wd})`);
  });

  // Test: protected_write_file
  const testFilePath = `mcp-test-${Date.now()}.txt`;
  const testFileContent = `Phase 12 MCP test — ${new Date().toISOString()}`;
  await check("protected_write_file: creates file in workspace", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: testFilePath, content: testFileContent },
    }, 30000);
    assert(!res.error, `RPC error: ${res.error?.message}`);
    if (res.result?.isError) {
      throw new Error(JSON.parse(res.result.content[0].text).error);
    }
    const result = JSON.parse(res.result.content[0].text);
    assert(result.success === true, "success !== true");
    assert(result.path === `/workspace/${testFilePath}`, `path mismatch: ${result.path}`);
  });

  // Test: protected_read_file
  await check("protected_read_file: reads back written file", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: testFilePath },
    }, 30000);
    assert(!res.error, `RPC error: ${res.error?.message}`);
    if (res.result?.isError) {
      throw new Error(JSON.parse(res.result.content[0].text).error);
    }
    const result = JSON.parse(res.result.content[0].text);
    assert(typeof result.content === "string", "content is not a string");
    assert(
      result.content.trim() === testFileContent,
      `Content mismatch. Expected: "${testFileContent}", Got: "${result.content.trim()}"`
    );
  });

  // Test: protected_read_file — non-existent file
  await check("protected_read_file: non-existent file returns isError: true", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: "does-not-exist-99999.txt" },
    }, 30000);
    assert(res.result?.isError === true, "Expected isError: true for missing file");
  });

  // Test: path traversal rejected
  await check("protected_read_file: path traversal (../) rejected at gateway", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_read_file",
      arguments: { path: "../../etc/passwd" },
    }, 15000);
    assert(res.result?.isError === true, "Expected isError: true for traversal path");
    const errorData = JSON.parse(res.result.content[0].text);
    assert(errorData.error.includes("rejected"), `Error msg: ${errorData.error}`);
  });

  // Test: .ssh path rejected
  await check("protected_write_file: .ssh path rejected at gateway", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: ".ssh/id_rsa", content: "fake-key" },
    }, 15000);
    assert(res.result?.isError === true, "Expected isError: true for .ssh path");
  });

  // Test: protected_network_request (conditional on proxy)
  if (proxyAvailable) {
    await check("protected_network_request: makes request through proxy", async () => {
      const res = await mcpCall("tools/call", {
        name: "protected_network_request",
        arguments: { url: "http://httpbin.org/get", method: "GET" },
      }, 30000);
      assert(!res.error, `RPC error: ${res.error?.message}`);
      if (res.result?.isError) {
        // Could fail if httpbin isn't reachable — only fail on sandbox issues
        const err = JSON.parse(res.result.content[0].text).error;
        if (err.includes("paused") || err.includes("session")) throw new Error(err);
        // Otherwise skip gracefully (network connectivity issues)
        skip("protected_network_request: server reached but external unreachable — " + err, "");
        return;
      }
      const result = JSON.parse(res.result.content[0].text);
      assert(typeof result.statusCode === "number", `statusCode missing: ${JSON.stringify(result)}`);
    });
  } else {
    skip("protected_network_request through proxy", "mitmproxy not detected on port 8080");
  }

  // Test: protected_execute returns array command form
  await check("protected_execute: accepts command array form", async () => {
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: ["echo", "array-form-ok"] },
    }, 30000);
    assert(!res.error, `RPC error: ${res.error?.message}`);
    if (res.result?.isError) {
      throw new Error(JSON.parse(res.result.content[0].text).error);
    }
    const result = JSON.parse(res.result.content[0].text);
    assert(result.exitCode === 0, `exitCode=${result.exitCode}`);
    assert(result.stdout.trim() === "array-form-ok", `stdout="${result.stdout.trim()}"`);
  });

  // Test: filesystem event recorded (check via API)
  await check("Filesystem event persisted to MongoDB after write", async () => {
    await new Promise((r) => setTimeout(r, 1500)); // allow watcher to flush
    const { data } = await apiGet(`/api/events?sessionId=${sessionId}&limit=50`);
    const events = Array.isArray(data) ? data : data?.events || [];
    const fsEvent = events.find(
      (e) => e.type === "filesystem" && e.path?.includes(testFilePath.replace(".txt", ""))
    );
    assert(fsEvent, `No filesystem event found for ${testFilePath} — events: ${events.length}`);
  });

  // Test: risk level present on events
  await check("Events have riskLevel field", async () => {
    const { data } = await apiGet(`/api/events?limit=5`);
    const events = Array.isArray(data) ? data : data?.events || [];
    assert(events.length > 0, "No events in DB");
    const evt = events[0];
    assert(["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(evt.riskLevel), `riskLevel: ${evt.riskLevel}`);
  });

  // Test: HIGH risk path blocked (write to /workspace/.env via MCP)
  let highRiskPaused = false;
  await check("HIGH-risk write (.env) causes sandbox pause via MCP", async () => {
    // Send the high-risk write
    const writeRes = await mcpCall("tools/call", {
      name: "protected_write_file",
      arguments: { path: ".env", content: "SECRET=leaked" },
    }, 30000);
    // Wait for filesystem watcher to fire and enforcement to apply
    await new Promise((r) => setTimeout(r, 4000));
    const { data: statusData } = await apiGet("/api/sandbox/status");
    if (statusData?.paused === true || statusData?.status === "paused") {
      highRiskPaused = true;
    }
    // If the tool itself returned a pause enforcement error, that also counts
    if (writeRes.result?.isError) {
      const errData = JSON.parse(writeRes.result.content[0].text);
      if (errData.error.toLowerCase().includes("paused") || errData.error.toLowerCase().includes("enforcement")) {
        highRiskPaused = true;
      }
    }
    // Also check if a HIGH/CRITICAL .env event was recorded for this session
    if (!highRiskPaused) {
      const { data: evtData } = await apiGet(`/api/sessions/${sessionId}/events`);
      const evts = Array.isArray(evtData?.events) ? evtData.events : [];
      const envEvent = evts.find(
        (e) => e.type === "filesystem" && e.path?.includes(".env") &&
               ["HIGH", "CRITICAL"].includes(e.riskLevel) &&
               ["pause", "kill"].includes(e.enforcementAction)
      );
      if (envEvent) {
        highRiskPaused = true;
      }
    }
    assert(highRiskPaused, "Expected sandbox to pause (or .env HIGH event) on HIGH risk .env write");
  });

  // Test: execute blocked when paused
  await check("protected_execute fails with structured error when sandbox is paused", async () => {
    if (!highRiskPaused) {
      // If HIGH risk didn't trigger, skip this test since we can't assert on paused behavior
      skip("depends on sandbox being paused", "");
      return;
    }
    const res = await mcpCall("tools/call", {
      name: "protected_execute",
      arguments: { command: "echo should-fail" },
    }, 30000);
    assert(res.result?.isError === true, "Expected isError: true when paused");
    const errData = JSON.parse(res.result.content[0].text);
    assert(
      errData.error.toLowerCase().includes("paused"),
      `Expected 'paused' error, got: "${errData.error}"`
    );
  });

  // Test: resume via API
  if (highRiskPaused) {
    await check("Resume sandbox via API", async () => {
      const { status } = await apiPost("/api/sandbox/resume", {});
      assert(status === 200, `Resume returned HTTP ${status}`);
    });

    await check("protected_execute succeeds after resume", async () => {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await mcpCall("tools/call", {
        name: "protected_execute",
        arguments: { command: "echo resumed-ok" },
      }, 30000);
      assert(!res.error, `RPC error: ${res.error?.message}`);
      if (res.result?.isError) {
        throw new Error(JSON.parse(res.result.content[0].text).error);
      }
      const result = JSON.parse(res.result.content[0].text);
      assert(result.exitCode === 0, `exitCode=${result.exitCode}`);
      assert(result.stdout.trim() === "resumed-ok", `stdout="${result.stdout.trim()}"`);
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  AgentGuard Phase 12 — MCP Security Gateway Integration Tests");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  API URL   : ${API_URL}`);
  console.log(`  MCP bin   : ${MCP_BIN}`);
  console.log(`  Node.js   : ${process.version}`);
  console.log("───────────────────────────────────────────────────────────────");

  // ── Path Guard unit tests (no backend needed) ──
  runPathGuardTests();

  // ── Check backend ──
  console.log("\n── Pre-flight Checks ───────────────────────────────────────────");
  let backendAlive = false;
  let sessionId = null;
  let proxyAvailable = false;

  await check("AgentGuard backend is reachable", async () => {
    const { data } = await apiGet("/api/health");
    assert(data?.status, "No status field in health response");
    backendAlive = true;
  });

  if (!backendAlive) {
    console.log("\n  ⛔  Backend unavailable — skipping all MCP protocol tests.");
    printSummary();
    process.exit(failed > 0 ? 1 : 0);
  }

  // Check proxy
  proxyAvailable = await isPortOpen(8080);
  console.log(`  🔌 mitmproxy on :8080: ${proxyAvailable ? "YES" : "NO (network tests will be skipped)"}`);

  // Resolve session
  await check("Active sandbox session exists", async () => {
    const { data } = await apiGet("/api/sandbox/status");
    sessionId = data?.sessionId;
    assert(sessionId, `No active session. Start one with: agentguard protect <workspace>`);
  });

  if (!sessionId) {
    console.log("\n  ⛔  No active session — skipping MCP protocol tests.");
    printSummary();
    process.exit(failed > 0 ? 1 : 0);
  }

  console.log(`  📦 Active session: ${sessionId}`);

  // ── Start MCP server ──
  console.log("\n── Starting MCP Gateway Server ─────────────────────────────────");
  startMcpServer(sessionId);
  await new Promise((r) => setTimeout(r, 1500)); // allow server to initialize

  // ── Run MCP protocol tests ──
  try {
    await runMcpTests(sessionId, proxyAvailable);
  } finally {
    stopMcpServer();
  }

  printSummary();
  process.exit(failed > 0 ? 1 : 0);
}

function printSummary() {
  const total = passed + failed + skipped;
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  Total   : ${total}`);
  console.log(`  ✅ Pass  : ${passed}`);
  console.log(`  ❌ Fail  : ${failed}`);
  console.log(`  ⏭  Skip  : ${skipped}`);
  console.log("═══════════════════════════════════════════════════════════════");
  if (failed > 0) {
    console.log("\n  ❌ PHASE 12 FAILED\n");
  } else {
    console.log(`\n  ✅ PHASE 12 PASSED (${passed}/${passed + failed} tests)\n`);
  }
}

main().catch((err) => {
  console.error("\n[FATAL]", err.message);
  process.exit(1);
});
