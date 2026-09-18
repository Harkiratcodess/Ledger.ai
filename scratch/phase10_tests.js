const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const CLI_PATH = path.join(ROOT, "backend/bin/agentguard.js");
const DEMO_WORKSPACE = path.join(ROOT, "demo-workload");
const API_URL = "http://localhost:5000";

let RESULTS = [];
function record(label, pass, detail = "") {
  const icon = pass ? "✅" : "❌";
  RESULTS.push({ label, pass, detail });
  console.log(`${icon} ${label}${detail ? ": " + detail : ""}`);
}

function runCli(args, env = {}) {
  const res = spawnSync("node", [CLI_PATH, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
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
  console.log("  AGENTGUARD PHASE 10 — VERIFICATION & SMOKE TEST");
  console.log("=======================================================\n");

  // Ensure no lingering sandbox before starting
  await api("POST", "/api/sandbox/kill").catch(() => {});

  // Clean demo-workload directory
  try {
    if (fs.existsSync(path.join(DEMO_WORKSPACE, ".env"))) fs.unlinkSync(path.join(DEMO_WORKSPACE, ".env"));
    if (fs.existsSync(path.join(DEMO_WORKSPACE, "phase10.txt"))) fs.unlinkSync(path.join(DEMO_WORKSPACE, "phase10.txt"));
    if (fs.existsSync(path.join(DEMO_WORKSPACE, "agentguard-test.txt"))) fs.unlinkSync(path.join(DEMO_WORKSPACE, "agentguard-test.txt"));
  } catch (e) {}

  // 1. CLI Help
  console.log("── 1. CLI HELP & VERSION ─────────────────────────────");
  const helpRes = runCli(["--help"]);
  record("T01 CLI --help exits 0", helpRes.code === 0, `exitCode=${helpRes.code}`);
  record("T02 CLI --help shows USAGE & COMMANDS", helpRes.stdout.includes("USAGE:") && helpRes.stdout.includes("COMMANDS:"));

  // 2. CLI Version
  const verRes = runCli(["--version"]);
  record("T03 CLI --version exits 0", verRes.code === 0, `output=${verRes.stdout.trim()}`);
  record("T04 CLI --version shows correct format", verRes.stdout.includes("agentguard v0.1.0"));

  // 3. Configuration & Backend Down Handling
  console.log("\n── 2. CONFIGURATION & PREREQUISITES HANDLING ─────────");
  const badUrlRes = runCli(["protect", DEMO_WORKSPACE, "--url", "http://localhost:59999"]);
  record("T05 Missing backend exits with code 1", badUrlRes.code === 1, `exitCode=${badUrlRes.code}`);
  record("T06 Informative backend connection error", badUrlRes.output.includes("Cannot connect to AgentGuard backend"));

  // 4. Invalid workspace rejection
  console.log("\n── 3. WORKSPACE VALIDATION ───────────────────────────");
  const rootWsRes = runCli(["protect", "C:\\"]);
  record("T07 Root mount rejected", rootWsRes.code === 1 && rootWsRes.output.includes("denied"), rootWsRes.output.trim());

  const nonExistentWsRes = runCli(["protect", "C:\\nonexistent_agentguard_path_12345"]);
  record("T08 Nonexistent workspace rejected", nonExistentWsRes.code === 1 && nonExistentWsRes.output.includes("does not exist"));

  // 5. Status when inactive
  console.log("\n── 4. STATUS COMMAND (INACTIVE) ─────────────────────");
  const statusInactiveRes = runCli(["status"]);
  record("T09 Status inactive shows clean state", statusInactiveRes.output.includes("AgentGuard Status: INACTIVE"));

  // 6. Protect workspace
  console.log("\n── 5. PROTECT WORKSPACE (OUTPUT & STARTUP) ───────────");
  const protectRes = runCli(["protect", DEMO_WORKSPACE, "--detach"]);
  record("T10 Protect command exits 0", protectRes.code === 0, `code=${protectRes.code}`);
  record("T11 Protect output header matches spec", protectRes.output.includes("AgentGuard protected runtime started"));
  record("T12 Protect output contains Workspace:", protectRes.output.includes("Workspace:"));
  record("T13 Protect output contains Session:", protectRes.output.includes("Session:"));
  record("T14 Protect output contains Container:", protectRes.output.includes("Container:"));
  record("T15 Protect output contains Network monitoring: enabled", protectRes.output.includes("Network monitoring: enabled"));
  record("T16 Protect output contains Filesystem monitoring: enabled", protectRes.output.includes("Filesystem monitoring: enabled"));
  record("T17 Protect output contains Risk enforcement: enabled", protectRes.output.includes("Risk enforcement: enabled"));

  // 7. Status when active
  console.log("\n── 6. STATUS COMMAND (ACTIVE) ───────────────────────");
  const statusActiveRes = runCli(["status"]);
  record("T18 Status shows ACTIVE", statusActiveRes.output.includes("AgentGuard Status:") && statusActiveRes.output.includes("ACTIVE"));
  record("T19 Status shows Session ID & Container", statusActiveRes.output.includes("Session ID") && statusActiveRes.output.includes("Container"));

  const statusJsonRes = runCli(["status", "--json"]);
  let parsedStatus = null;
  try {
    parsedStatus = JSON.parse(statusJsonRes.stdout);
  } catch (e) {}
  record("T20 Status --json returns valid JSON", Boolean(parsedStatus && parsedStatus.active === true), `active=${parsedStatus?.active}`);
  const ACTIVE_SESSION_ID = parsedStatus?.sessionId;

  // 8. Exec command
  console.log("\n── 7. EXEC COMMAND INSIDE SANDBOX ────────────────────");
  const execRes = runCli(["exec", "ls /workspace"]);
  record("T21 Exec ls /workspace exits 0", execRes.code === 0, `code=${execRes.code}`);
  record("T22 Exec outputs workspace files", execRes.output.includes("index.js") || execRes.output.includes("package.json"), execRes.output.trim());

  // 9. Filesystem event & LOW risk
  console.log("\n── 8. FILESYSTEM EVENT & LOW RISK ───────────────────");
  const createFileRes = runCli(["exec", "echo 'phase10 test' > /workspace/phase10.txt"]);
  record("T23 File create command exit 0", createFileRes.code === 0);
  await sleep(2500);

  const { data: evData1 } = await api("GET", `/api/sessions/${ACTIVE_SESSION_ID}/events`);
  const fsEvents = evData1.events?.filter((e) => e.type === "filesystem") || [];
  const p10Event = fsEvents.find((e) => e.path?.includes("phase10.txt"));
  record("T24 Filesystem event captured in MongoDB", Boolean(p10Event), p10Event?.path);
  record("T25 Filesystem event riskLevel=LOW", p10Event?.riskLevel === "LOW", p10Event?.riskLevel);
  record("T26 Filesystem event enforcement=allow", p10Event?.enforcementAction === "allow", p10Event?.enforcementAction);

  // 10. Network event: LOW risk
  console.log("\n── 9. NETWORK EVENTS & RISK EVALUATION ──────────────");
  const { data: netLow } = await api("POST", "/api/network-events", {
    hostname: "example.com",
    method: "GET",
    url: "http://example.com/test",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
  record("T27 Network allowlist event risk=LOW", netLow.event?.riskLevel === "LOW", netLow.event?.riskLevel);
  record("T28 Network allowlist enforcement=allow", netLow.event?.enforcementAction === "allow", netLow.event?.enforcementAction);

  // 11. Network event: MEDIUM risk
  const { data: netMed } = await api("POST", "/api/network-events", {
    hostname: "external-unknown-service.io",
    method: "POST",
    url: "http://external-unknown-service.io/metrics",
    statusCode: 200,
    timestamp: new Date().toISOString(),
  });
  record("T29 Unknown network domain risk=MEDIUM", netMed.event?.riskLevel === "MEDIUM", netMed.event?.riskLevel);
  record("T30 MEDIUM risk enforcement=record", netMed.event?.enforcementAction === "record", netMed.event?.enforcementAction);

  // 12. HIGH risk & Automatic container pause
  console.log("\n── 10. HIGH RISK ENFORCEMENT & PAUSE ────────────────");
  runCli(["exec", "echo 'SECRET=xyz' > /workspace/.env"]);
  await sleep(2000);

  const { data: pauseStatus } = await api("GET", "/api/sandbox/status");
  record("T31 Sandbox automatically PAUSED on sensitive file write", pauseStatus.paused === true, `paused=${pauseStatus.paused}`);

  const { data: evData2 } = await api("GET", `/api/sessions/${ACTIVE_SESSION_ID}/events`);
  const highEvent = evData2.events?.find((e) => e.riskLevel === "HIGH");
  record("T32 HIGH-risk event captured", Boolean(highEvent), highEvent?.riskReason);
  record("T33 HIGH-risk enforcement=pause", highEvent?.enforcementAction === "pause", highEvent?.enforcementAction);

  // 13. Status when paused
  console.log("\n── 11. STATUS & CONTROLS (PAUSE/RESUME/KILL) ────────");
  const statusPausedRes = runCli(["status"]);
  record("T34 Status output reflects PAUSED state", statusPausedRes.output.includes("PAUSED"));

  // 14. Resume
  const resumeRes = runCli(["resume"]);
  record("T35 Resume command succeeds", resumeRes.code === 0 && resumeRes.output.includes("resumed"));

  const { data: resumedStatus } = await api("GET", "/api/sandbox/status");
  record("T36 Sandbox unpaused after resume", resumedStatus.paused === false, `paused=${resumedStatus.paused}`);

  // 15. Manual pause
  const pauseRes = runCli(["pause"]);
  record("T37 Manual pause command succeeds", pauseRes.code === 0 && pauseRes.output.includes("paused"));

  // 16. Kill
  const killRes = runCli(["kill"]);
  record("T38 Kill command succeeds", killRes.code === 0 && killRes.output.includes("killed"));

  const { data: afterKillStatus } = await api("GET", "/api/sandbox/status");
  record("T39 Sandbox inactive after kill", afterKillStatus.active === false, `active=${afterKillStatus.active}`);

  // 17. Cleanup verification
  console.log("\n── 12. CLEANUP & ARTIFACTS AUDIT ────────────────────");
  try {
    if (fs.existsSync(path.join(DEMO_WORKSPACE, ".env"))) fs.unlinkSync(path.join(DEMO_WORKSPACE, ".env"));
    if (fs.existsSync(path.join(DEMO_WORKSPACE, "phase10.txt"))) fs.unlinkSync(path.join(DEMO_WORKSPACE, "phase10.txt"));
  } catch (e) {}

  const demoRemaining = fs.readdirSync(DEMO_WORKSPACE);
  record("T40 demo-workload clean of test artifacts", !demoRemaining.includes(".env") && !demoRemaining.includes("phase10.txt"), `files=${demoRemaining.join(",")}`);

  // 18. Security verification: no Docker socket, no privileged mode
  const dockerSrc = fs.readFileSync(path.join(ROOT, "backend/src/services/docker.service.js"), "utf8");
  record("T41 No Docker socket in docker.service.js", !dockerSrc.includes("docker.sock"));
  record("T42 No privileged mode in docker.service.js", !dockerSrc.includes("Privileged: true"));
  record("T43 Workspace-only mount", dockerSrc.includes("`${validatedPath}:/workspace`"));

  // 19. Root README and package.json audit
  const readmeExists = fs.existsSync(path.join(ROOT, "README.md"));
  record("T44 Root README.md exists", readmeExists);

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "backend/package.json"), "utf8"));
  record("T45 Package name is agentguard", pkg.name === "agentguard", pkg.name);
  record("T46 Bin correctly exposes agentguard", pkg.bin?.agentguard === "./bin/agentguard.js");
  record("T47 Private flag removed for publishability", pkg.private === undefined || pkg.private === false);

  // Summary
  console.log("\n=======================================================");
  console.log("  PHASE 10 RESULTS SUMMARY");
  console.log("=======================================================");
  const passed = RESULTS.filter((r) => r.pass).length;
  const total = RESULTS.length;
  const failed = RESULTS.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.log("\nFailed tests:");
    failed.forEach((r) => console.log(`  ❌ ${r.label}: ${r.detail}`));
  }
  console.log(`\nTotal: ${passed}/${total} tests passed`);
  console.log(failed.length === 0 ? "\n✅ ALL PHASE 10 SMOKE TESTS PASSED" : `\n❌ ${failed.length} tests FAILED`);
  process.exit(failed.length > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
