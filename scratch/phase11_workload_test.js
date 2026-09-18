const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const CLI_PATH = path.join(ROOT, "backend/bin/agentguard.js");
const WORKSPACE_DIR = path.join(ROOT, "demo-workload");
const API_URL = "http://localhost:5000";

let RESULTS = [];
function record(label, pass, detail = "") {
  const icon = pass ? "✅" : "❌";
  RESULTS.push({ label, pass, detail });
  console.log(`${icon} ${label}${detail ? ": " + detail : ""}`);
}

function runCli(args) {
  const res = spawnSync("node", [CLI_PATH, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
  });
  return {
    code: res.status,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
    output: (res.stdout || "") + (res.stderr || ""),
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(method, endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  console.log("\n=======================================================");
  console.log("  AGENTGUARD PHASE 11 — REAL AGENT WORKFLOW VALIDATION");
  console.log("=======================================================\n");

  // Step 0: Ensure environment is clean
  await api("POST", "/api/sandbox/kill").catch(() => {});

  // Clean demo-workload
  const cleanupFiles = [
    ".env",
    "phase10.txt",
    "agentguard-test.txt",
    "greeting.js",
    "agent_workload.js",
    "high_risk_workload.js",
  ];
  for (const f of cleanupFiles) {
    const p = path.join(WORKSPACE_DIR, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  // Ensure index.js and package.json exist
  fs.writeFileSync(
    path.join(WORKSPACE_DIR, "index.js"),
    "console.log('Demo Workload Application Active');\n",
    "utf8"
  );
  fs.writeFileSync(
    path.join(WORKSPACE_DIR, "package.json"),
    JSON.stringify({ name: "demo-workload", version: "1.0.0", main: "index.js" }, null, 2),
    "utf8"
  );

  // ─── 1. START PROTECTED RUNTIME ───────────────────────────────────
  console.log("── 1. AGENTGUARD PROTECTED RUNTIME START ────────────");
  const protectRes = runCli(["protect", WORKSPACE_DIR, "--detach"]);
  record("T01 Start protected sandbox via CLI", protectRes.code === 0, `exitCode=${protectRes.code}`);

  const statusRes = runCli(["status", "--json"]);
  let statusData = null;
  try {
    statusData = JSON.parse(statusRes.stdout);
  } catch (e) {}
  const SESSION_ID = statusData?.sessionId;
  const CONTAINER_ID = statusData?.containerId;

  record("T02 Sandbox is active & running", Boolean(statusData?.active && statusData?.running), `container=${CONTAINER_ID?.slice(0, 12)}`);
  record("T03 Session ID generated", Boolean(SESSION_ID), SESSION_ID);

  // ─── 2. SIMULATED EXTERNAL CODING AGENT WORKLOAD ───────────────────
  console.log("\n── 2. REALISTIC EXTERNAL CODING AGENT WORKLOAD ───────");
  // The external coding agent runs inside the sandbox without modification
  // It performs standard developer tasks:
  // 1. Reads existing source file (index.js)
  // 2. Creates new source file (greeting.js)
  // 3. Modifies existing source file (index.js)
  // 4. Runs a verification shell command (node index.js)
  // 5. Performs an HTTP request to example.com via proxy
  // 6. Completes normally with exit code 0 (LOW risk)

  const workloadScript = `
const fs = require('fs');
const http = require('http');

console.log('[External Agent] Task started: Implement greeting feature');

// Step 1: Read existing source file
const initialContent = fs.readFileSync('/workspace/index.js', 'utf8');
console.log('[External Agent] Read existing index.js, length:', initialContent.length);

// Step 2: Create a new source file
const greetingCode = "module.exports = { greet: (name) => 'Hello ' + name };\\n";
fs.writeFileSync('/workspace/greeting.js', greetingCode, 'utf8');
console.log('[External Agent] Created /workspace/greeting.js');

// Step 3: Modify existing source file
const updatedContent = "const { greet } = require('./greeting');\\nconsole.log(greet('AgentGuard World'));\\n";
fs.writeFileSync('/workspace/index.js', updatedContent, 'utf8');
console.log('[External Agent] Modified /workspace/index.js');

// Step 4: Verify execution
const { greet } = require('/workspace/greeting');
console.log('[External Agent] Verified logic locally:', greet('Test'));

// Step 5: Make HTTP request through proxy
const proxyHost = process.env.http_proxy ? new URL(process.env.http_proxy).hostname : 'host.docker.internal';
const proxyPort = process.env.http_proxy ? new URL(process.env.http_proxy).port : 8080;

const req = http.request({
  host: proxyHost,
  port: proxyPort,
  path: 'http://example.com/',
  method: 'GET',
  headers: { Host: 'example.com' }
}, (res) => {
  console.log('[External Agent] Documentation fetch statusCode:', res.statusCode);
  res.on('data', () => {});
  res.on('end', () => {
    console.log('[External Agent] Workload task completed successfully.');
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('[External Agent] HTTP request error:', e.message);
  process.exit(1);
});
req.end();
`;

  fs.writeFileSync(path.join(WORKSPACE_DIR, "agent_workload.js"), workloadScript, "utf8");

  const execWorkload = runCli(["exec", "node /workspace/agent_workload.js"]);
  record("T04 External workload executed successfully (exit 0)", execWorkload.code === 0, `exitCode=${execWorkload.code}`);
  record("T05 Workload read existing source file", execWorkload.output.includes("Read existing index.js"));
  record("T06 Workload created new source file", execWorkload.output.includes("Created /workspace/greeting.js"));
  record("T07 Workload modified source file", execWorkload.output.includes("Modified /workspace/index.js"));
  record("T08 Workload executed logic verification", execWorkload.output.includes("Verified logic locally: Hello Test"));
  record("T09 Workload fetched http://example.com via proxy", execWorkload.output.includes("Documentation fetch statusCode: 200"));

  await sleep(2500);

  // ─── 3. FILESYSTEM MONITORING VERIFICATION ─────────────────────────
  console.log("\n── 3. FILESYSTEM MONITORING & RISK VERIFICATION ─────");
  const { data: sessEventsData } = await api("GET", `/api/sessions/${SESSION_ID}/events`);
  const allEvents = sessEventsData.events || [];
  const fsEvents = allEvents.filter((e) => e.type === "filesystem");

  record("T10 Filesystem events recorded in MongoDB", fsEvents.length > 0, `count=${fsEvents.length}`);

  const greetingEvt = fsEvents.find((e) => e.path?.includes("greeting.js"));
  record("T11 Specific file creation captured (greeting.js)", Boolean(greetingEvt), greetingEvt?.path);
  record("T12 Filesystem riskLevel=LOW for benign coding action", greetingEvt?.riskLevel === "LOW", greetingEvt?.riskLevel);
  record("T13 Filesystem enforcement=allow", greetingEvt?.enforcementAction === "allow", greetingEvt?.enforcementAction);
  record("T14 Filesystem metadata only (no file content saved)", !greetingEvt?.content && !greetingEvt?.body && !greetingEvt?.fileContents);

  // ─── 4. NETWORK OBSERVABILITY VERIFICATION ─────────────────────────
  console.log("\n── 4. NETWORK INTERCEPTION & METADATA VERIFICATION ──");
  const netEvents = allEvents.filter((e) => e.type === "network");
  const exampleNetEvt = netEvents.find((e) => e.hostname === "example.com");

  record("T15 Proxy intercepted network request from sandbox", Boolean(exampleNetEvt), exampleNetEvt?.url);
  record("T16 Network event has hostname", exampleNetEvt?.hostname === "example.com", exampleNetEvt?.hostname);
  record("T17 Network event has method GET", exampleNetEvt?.method === "GET", exampleNetEvt?.method);
  record("T18 Network event has statusCode 200", exampleNetEvt?.statusCode === 200, String(exampleNetEvt?.statusCode));
  record("T19 Network event has timestamp", Boolean(exampleNetEvt?.timestamp), exampleNetEvt?.timestamp);
  record("T20 Network event riskLevel=LOW (allowlist)", exampleNetEvt?.riskLevel === "LOW", exampleNetEvt?.riskLevel);
  record("T21 Network enforcement=allow", exampleNetEvt?.enforcementAction === "allow", exampleNetEvt?.enforcementAction);
  record("T22 Network metadata only (NO request/response body)", !exampleNetEvt?.body && !exampleNetEvt?.responseBody && !exampleNetEvt?.requestBody);

  // Check that sandbox remained running during benign operations
  const { data: postBenignStatus } = await api("GET", "/api/sandbox/status");
  record("T23 Sandbox remained RUNNING during benign workload", postBenignStatus.running === true && postBenignStatus.paused === false);

  // ─── 5. HIGH-RISK SENSITIVE PATH TEST & ENFORCEMENT PAUSE ──────────
  console.log("\n── 5. HIGH-RISK ENFORCEMENT & CONTAINER PAUSE ───────");
  // External workload or untrusted action writes to sensitive .env path
  const highRiskExec = runCli(["exec", "echo 'API_SECRET_KEY=sk_live_critical_secret' > /workspace/.env"]);
  record("T24 Sensitive file write attempted (.env)", highRiskExec.code === 0 || highRiskExec.code === 1);

  await sleep(2000);

  // Check enforcement
  const { data: pausedStatus } = await api("GET", "/api/sandbox/status");
  record("T25 Sandbox automatically PAUSED by AgentGuard", pausedStatus.paused === true, `paused=${pausedStatus.paused}`);

  const { data: postHighEvents } = await api("GET", `/api/sessions/${SESSION_ID}/events`);
  const highRiskEvt = postHighEvents.events?.find((e) => e.riskLevel === "HIGH");
  record("T26 HIGH risk event stored in MongoDB", Boolean(highRiskEvt), highRiskEvt?.riskReason);
  record("T27 HIGH risk enforcementAction=pause", highRiskEvt?.enforcementAction === "pause", highRiskEvt?.enforcementAction);
  record("T28 HIGH risk enforcementStatus=paused", highRiskEvt?.enforcementStatus === "paused", highRiskEvt?.enforcementStatus);
  record("T29 HIGH risk event metadata only (no secret value stored)", !highRiskEvt?.content && !highRiskEvt?.body && !highRiskEvt?.fileContents);

  // Verify workload CANNOT execute further commands while paused
  const blockedExec = runCli(["exec", "echo 'after pause test'"]);
  record("T30 Subsequent workload execution blocked while paused", blockedExec.code !== 0, blockedExec.output.trim());

  // Verify sandbox does NOT automatically resume
  await sleep(2500);
  const { data: stillPausedStatus } = await api("GET", "/api/sandbox/status");
  record("T31 Sandbox does NOT automatically resume", stillPausedStatus.paused === true, `paused=${stillPausedStatus.paused}`);

  // ─── 6. EXPLICIT RESUME & TEARDOWN ─────────────────────────────────
  console.log("\n── 6. EXPLICIT RESUME & LIFECYCLE TEARDOWN ──────────");
  const resumeRes = runCli(["resume"]);
  record("T32 Explicit 'agentguard resume' succeeds", resumeRes.code === 0 && resumeRes.output.includes("resumed"));

  const { data: resumedStatus } = await api("GET", "/api/sandbox/status");
  record("T33 Sandbox container unpaused after explicit resume", resumedStatus.paused === false, `paused=${resumedStatus.paused}`);

  const killRes = runCli(["kill"]);
  record("T34 'agentguard kill' succeeds", killRes.code === 0 && killRes.output.includes("killed"));

  const { data: afterKillStatus } = await api("GET", "/api/sandbox/status");
  record("T35 Sandbox completely inactive after kill", afterKillStatus.active === false, `active=${afterKillStatus.active}`);

  // ─── 7. SECURITY ARCHITECTURE CHECKS ──────────────────────────────
  console.log("\n── 7. SECURITY BOUNDARIES AUDIT ─────────────────────");
  const dockerServiceSrc = fs.readFileSync(path.join(ROOT, "backend/src/services/docker.service.js"), "utf8");
  const validatorSrc = fs.readFileSync(path.join(ROOT, "backend/src/utils/workspace-validator.js"), "utf8");

  record("T36 No Docker socket exposed (/var/run/docker.sock)", !dockerServiceSrc.includes("docker.sock"));
  record("T37 No privileged container mode", !dockerServiceSrc.includes("Privileged: true"));
  record("T38 No host networking (NetworkMode: host)", !dockerServiceSrc.includes("NetworkMode: 'host'") && !dockerServiceSrc.includes('NetworkMode: "host"'));
  record("T39 Root filesystem mount denied", validatorSrc.includes("Mounting root filesystem is denied"));
  record("T40 User home directory mount denied", validatorSrc.includes("Mounting user home directory is denied"));
  record("T41 Sensitive credential stores denied (.ssh, .aws)", validatorSrc.includes(".ssh") && validatorSrc.includes(".aws"));
  record("T42 Workspace-only bind mount", dockerServiceSrc.includes("`${validatedPath}:/workspace`"));

  // ─── 8. CLEANUP AUDIT ─────────────────────────────────────────────
  console.log("\n── 8. CLEANUP AUDIT ─────────────────────────────────");
  for (const f of cleanupFiles) {
    const p = path.join(WORKSPACE_DIR, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  // Reset index.js
  fs.writeFileSync(path.join(WORKSPACE_DIR, "index.js"), "console.log('Demo Workload Application Active');\n", "utf8");

  const remainingFiles = fs.readdirSync(WORKSPACE_DIR);
  record("T43 demo-workload clean of test artifacts", !remainingFiles.includes(".env") && !remainingFiles.includes("greeting.js") && !remainingFiles.includes("agent_workload.js"), `files=${remainingFiles.join(",")}`);

  // ─── Summary ──────────────────────────────────────────────────────
  console.log("\n=======================================================");
  console.log("  PHASE 11 RESULTS SUMMARY");
  console.log("=======================================================");
  const passed = RESULTS.filter((r) => r.pass).length;
  const total = RESULTS.length;
  const failed = RESULTS.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.log("\nFailed tests:");
    failed.forEach((r) => console.log(`  ❌ ${r.label}: ${r.detail}`));
  }
  console.log(`\nTotal: ${passed}/${total} tests passed`);
  console.log(failed.length === 0 ? "\n✅ ALL PHASE 11 WORKLOAD TESTS PASSED" : `\n❌ ${failed.length} tests FAILED`);
  process.exit(failed.length > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
