#!/usr/bin/env node

const path = require("path");
const { validateWorkspacePath } = require("../src/utils/workspace-validator");
const { loadProjectConfig, initProjectConfig } = require("../src/cli/config");
const { DEFAULT_BACKEND_URL, ensureRuntime, pingHealth } = require("../src/cli/runtime");
const packageInfo = require("../package.json");

function invokedName() {
  const base = path.basename(process.argv[1] || "ledger", ".js").toLowerCase();
  if (base.includes("agentguard") && !base.includes("ledger")) return "agentguard";
  return "ledger";
}

function printHelp() {
  const bin = invokedName();
  console.log(`
Ledger CLI — AI agent security runtime (v${packageInfo.version})

USAGE:
  ${bin} init
  ${bin} protect <workspace> [options]
  ${bin} exec <command...>
  ${bin} status [options]
  ${bin} pause
  ${bin} resume
  ${bin} kill
  ${bin} mcp
  ${bin} version

COMMANDS:
  init              Create a minimal .ledger/config.json in the current directory.
  protect, start    Validate the workspace and start a protected sandbox runtime.
  exec              Execute a command inside the active protected sandbox.
  status            Display the status of the active sandbox.
  pause             Pause the active sandbox container.
  resume            Resume a paused sandbox container.
  kill              Terminate and remove the active sandbox container.
  mcp               Start the Ledger MCP security gateway over STDIO.
  version           Display the CLI version.

OPTIONS:
  --exec <cmd>      Run a command inside the sandbox immediately after creation.
  --url <url>       Backend API URL (default: ${DEFAULT_BACKEND_URL}).
  --detach          Start the protected sandbox in the background and exit immediately.
  --json            Output machine-readable JSON (applicable to 'status').
  -v, --version     Show version.
  -h, --help        Show this help message.

EXAMPLES:
  ${bin} init
  ${bin} protect .
  ${bin} protect ./my-project --detach
  ${bin} exec npm test
  ${bin} mcp
  ${bin} kill

The dashboard is optional. Protection does not require the React UI.
`);
}

async function checkPrerequisites(apiUrl, { autoStart = true } = {}) {
  const health = autoStart ? await ensureRuntime(apiUrl) : await pingHealth(apiUrl);
  return health;
}

async function protectWorkspace(workspaceArg, options = {}) {
  const apiUrl = options.url || DEFAULT_BACKEND_URL;
  const projectConfig = loadProjectConfig(process.cwd());

  let validatedWorkspace;
  try {
    validatedWorkspace = validateWorkspacePath(workspaceArg);
  } catch (err) {
    console.error(`\x1b[31m[Ledger Error]\x1b[0m ${err.message}`);
    process.exit(1);
  }

  const prereq = await checkPrerequisites(apiUrl);
  if (!prereq.ok) {
    console.error(`\x1b[31m[Ledger Error]\x1b[0m ${prereq.message}`);
    process.exit(1);
  }

  const payload = {
    workspace: validatedWorkspace,
    ...(projectConfig.sandboxImage ? { image: projectConfig.sandboxImage } : {}),
  };

  let sessionRes;
  try {
    sessionRes = await fetch(`${apiUrl}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(`\x1b[31m[Ledger Error]\x1b[0m Failed to request session creation: ${err.message}`);
    process.exit(1);
  }

  const sessionData = await sessionRes.json();
  if (!sessionRes.ok || !sessionData.success) {
    console.error(`\x1b[31m[Ledger Error]\x1b[0m Session creation failed: ${sessionData.error || "Unknown error"}`);
    process.exit(1);
  }

  const session = sessionData.session;
  const containerShortId = session.containerId ? session.containerId.slice(0, 12) : "unknown";

  console.log(`Ledger — protected runtime started\n`);
  console.log(`Workspace: ${session.workspace}`);
  console.log(`Session: ${session.sessionId}`);
  console.log(`Container: ${containerShortId}`);
  console.log(`Network monitoring: enabled`);
  console.log(`Filesystem monitoring: enabled`);
  console.log(`Risk enforcement: enabled\n`);

  if (options.exec) {
    console.log(`Executing workload: ${options.exec}\n`);
    const execResult = await executeCommand(session.sessionId, options.exec, apiUrl);
    if (!options.detach) {
      await killSandbox(apiUrl, { silent: true });
    }
    process.exit(execResult?.exitCode ?? 0);
  }

  if (options.detach) {
    const bin = invokedName();
    console.log(`Protected sandbox running in background. Use '${bin} kill' to terminate.`);
    return;
  }

  console.log(`Protected environment is ready. Workloads can execute against the sandbox.`);
  console.log(`Press Ctrl+C to stop the protected environment and clean up.\n`);

  let isCleaningUp = false;
  async function cleanup() {
    if (isCleaningUp) return;
    isCleaningUp = true;
    console.log(`\n[Ledger] Stopping protected runtime...`);
    try {
      await fetch(`${apiUrl}/api/sandbox/kill`, { method: "POST" });
      console.log(`[Ledger] Sandbox cleaned up successfully.`);
    } catch (err) {
      console.error(`[Ledger] Cleanup error: ${err.message}`);
    }
    process.exit(0);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);

  const monitorInterval = setInterval(async () => {
    try {
      const statusRes = await fetch(`${apiUrl}/api/sandbox/status`);
      const statusData = await statusRes.json();
      if (statusData.paused) {
        console.log(`\n\x1b[41m\x1b[37m[SECURITY ALERT]\x1b[0m Sandbox was PAUSED by the risk engine.`);
        console.log(`An event exceeded the security threshold. Container is frozen.`);
        console.log(`Inspect events in the optional dashboard or use '${invokedName()} resume' / '${invokedName()} kill'.\n`);
      }
      if (!statusData.active) {
        console.log(`\n[Ledger] Sandbox container is no longer active.`);
        clearInterval(monitorInterval);
        process.exit(0);
      }
    } catch {
      // Ignore transient errors
    }
  }, 2000);
}

async function executeCommand(sessionId, cmdStr, apiUrl = DEFAULT_BACKEND_URL) {
  let command;
  if (Array.isArray(cmdStr)) {
    command = cmdStr;
  } else if (typeof cmdStr === "string") {
    command = ["sh", "-lc", cmdStr];
  } else {
    console.error(`[Ledger Error] Invalid command`);
    return { exitCode: 1 };
  }

  const prereq = await checkPrerequisites(apiUrl);
  if (!prereq.ok) {
    console.error(`\x1b[31m[Ledger Error]\x1b[0m ${prereq.message}`);
    process.exit(1);
  }

  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const statusRes = await fetch(`${apiUrl}/api/sandbox/status`);
    const status = await statusRes.json();
    if (!status.active || !status.sessionId) {
      console.error(`\x1b[31m[Ledger Error]\x1b[0m No active sandbox session found.\nStart one with: ${invokedName()} protect <workspace>`);
      process.exit(1);
    }
    targetSessionId = status.sessionId;
  }

  try {
    const res = await fetch(`${apiUrl}/api/sessions/${targetSessionId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`\x1b[31m[Ledger] Execution failed:\x1b[0m ${data.error || "Unknown error"}`);
      process.exit(1);
    }

    if (data.execution?.stdout) {
      process.stdout.write(data.execution.stdout);
    }
    if (data.execution?.stderr) {
      process.stderr.write(data.execution.stderr);
    }
    return data.execution;
  } catch (err) {
    console.error(`\x1b[31m[Ledger Error]\x1b[0m Execution error: ${err.message}`);
    process.exit(1);
  }
}

async function showStatus(options = {}) {
  const apiUrl = options.url || DEFAULT_BACKEND_URL;
  try {
    const prereq = await checkPrerequisites(apiUrl);
    if (!prereq.ok && prereq.reason === "backend_unreachable") {
      console.error(`[Ledger Error] Failed to connect to backend: ${prereq.error?.message || prereq.message}`);
      console.error(`Ensure backend is running at ${apiUrl}`);
      process.exit(1);
    }

    const res = await fetch(`${apiUrl}/api/sandbox/status`);
    const data = await res.json();

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    if (!data.active) {
      console.log(`\nAgentGuard Status: INACTIVE\n`);
      console.log(`  No protected sandbox is currently running.`);
      console.log(`  Start one with: ${invokedName()} protect <workspace>\n`);
      return;
    }

    const state = data.paused ? "PAUSED" : data.running ? "RUNNING" : "STOPPED";
    const statusColor = data.paused ? "\x1b[33m" : "\x1b[32m";

    console.log(`\nAgentGuard Status: ${statusColor}ACTIVE (${state})\x1b[0m\n`);
    console.log(`  Session ID  : ${data.sessionId}`);
    console.log(`  Container   : ${data.containerId ? data.containerId.slice(0, 12) : "none"}`);
    console.log(`  Running     : ${Boolean(data.running)}`);
    console.log(`  Paused      : ${Boolean(data.paused)}`);
    console.log(`  Filesystem  : Monitored via integrity watcher`);
    console.log(`  Network     : Routed via mitmproxy`);
    console.log(`  Enforcement : Non-destructive pause on HIGH risk`);

    if (data.paused) {
      console.log(`\n  \x1b[33mNotice: Container is paused due to security policy enforcement.\x1b[0m`);
      console.log(`  Resume: ${invokedName()} resume`);
      console.log(`  Tear down: ${invokedName()} kill\n`);
    } else {
      console.log(`\n  Use '${invokedName()} exec <command...>' to run commands in the sandbox.`);
      console.log(`  Use '${invokedName()} kill' to tear down the environment.\n`);
    }
  } catch (err) {
    console.error(`[Ledger Error] Failed to connect to backend: ${err.message}`);
    console.error(`Ensure backend is running at ${apiUrl}`);
    process.exit(1);
  }
}

async function pauseSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  const prereq = await checkPrerequisites(apiUrl);
  if (!prereq.ok) {
    console.error(`[Ledger Error] ${prereq.message}`);
    process.exit(1);
  }
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/pause`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`[Ledger Error] ${data.error || "Failed to pause"}`);
      process.exit(1);
    }
    console.log(`[Ledger] Sandbox container paused.`);
  } catch (err) {
    console.error(`[Ledger Error] Failed to pause: ${err.message}`);
    process.exit(1);
  }
}

async function resumeSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  const prereq = await checkPrerequisites(apiUrl);
  if (!prereq.ok) {
    console.error(`[Ledger Error] ${prereq.message}`);
    process.exit(1);
  }
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/resume`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`[Ledger Error] ${data.error || "Failed to resume"}`);
      process.exit(1);
    }
    console.log(`[Ledger] Sandbox container resumed.`);
  } catch (err) {
    console.error(`[Ledger Error] Failed to resume: ${err.message}`);
    process.exit(1);
  }
}

async function killSandbox(apiUrl = DEFAULT_BACKEND_URL, options = {}) {
  const prereq = await checkPrerequisites(apiUrl);
  if (!prereq.ok && !options.silent) {
    console.error(`[Ledger Error] ${prereq.message}`);
    process.exit(1);
  }
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/kill`, { method: "POST" });
    const data = await res.json();
    if (!options.silent) {
      if (!res.ok || !data.success) {
        console.log(`[Ledger] ${data.error || "No active sandbox to terminate."}`);
      } else {
        console.log(`[Ledger] Sandbox container killed and cleaned up.`);
      }
    }
    return data;
  } catch (err) {
    if (!options.silent) {
      console.error(`[Ledger Error] Failed to kill sandbox: ${err.message}`);
    }
    process.exit(1);
  }
}

function runInit() {
  const result = initProjectConfig(process.cwd());
  if (result.created) {
    console.log(`Initialized Ledger workspace config:\n  ${result.path}`);
    console.log(`Edit this file to set sandbox image, network destinations, and enforcement.`);
  } else {
    console.log(`Ledger already initialized:\n  ${result.path}`);
  }
}

function runMcp() {
  const { startServer } = require("../src/mcp/server");
  startServer();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help") || args[0] === "help") {
    printHelp();
    process.exit(0);
  }

  if (args.includes("-v") || args.includes("--version") || args[0] === "version") {
    console.log(`${invokedName()} v${packageInfo.version}`);
    process.exit(0);
  }

  const command = args[0];

  const getOption = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const url = getOption("--url") || DEFAULT_BACKEND_URL;

  if (command === "init") {
    runInit();
  } else if (command === "mcp") {
    runMcp();
  } else if (command === "protect" || command === "start") {
    const workspace = args[1];
    if (!workspace || workspace.startsWith("-")) {
      console.error(`\x1b[31m[Ledger Error]\x1b[0m Missing workspace path.`);
      console.error(`Usage: ${invokedName()} protect <workspace> [options]`);
      process.exit(1);
    }

    const options = {
      detach: args.includes("--detach"),
      exec: getOption("--exec"),
      url,
    };

    await protectWorkspace(workspace, options);
  } else if (command === "exec") {
    const cmdArgs = args.slice(1).filter((a) => a !== "--url" && a !== url);
    if (cmdArgs.length === 0) {
      console.error(`[Ledger Error] Missing command to execute.`);
      console.error(`Usage: ${invokedName()} exec <command...>`);
      process.exit(1);
    }
    const fullCmd = cmdArgs.join(" ");
    await executeCommand(null, fullCmd, url);
  } else if (command === "status") {
    await showStatus({ json: args.includes("--json"), url });
  } else if (command === "pause") {
    await pauseSandbox(url);
  } else if (command === "resume") {
    await resumeSandbox(url);
  } else if (command === "kill") {
    await killSandbox(url);
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[Ledger Fatal Error]:", err);
  process.exit(1);
});
