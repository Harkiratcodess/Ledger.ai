#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { validateWorkspacePath } = require("../src/utils/workspace-validator");
const packageInfo = require("../package.json");

const DEFAULT_BACKEND_URL = process.env.AGENTGUARD_API_URL || "http://localhost:5000";

function printHelp() {
  const isLedger = process.argv[1] && path.basename(process.argv[1], ".js").toLowerCase().includes("ledger");
  const bin = isLedger ? "ledger" : "agentguard";
  console.log(`
Ledger CLI — powered by AgentGuard Protected Security Runtime (v${packageInfo.version})

USAGE:
  agentguard protect <workspace> [options]
  agentguard start <workspace> [options]
  agentguard exec <command...>
  agentguard status [options]
  agentguard pause
  agentguard resume
  agentguard kill
  agentguard version

COMMANDS:
  protect, start    Start a protected execution environment for the given workspace.
  exec              Execute a command inside the active AgentGuard sandbox.
  status            Display the status and policy details of the active sandbox.
  pause             Pause the active sandbox container.
  resume            Resume a paused sandbox container.
  kill              Terminate and remove the active sandbox container.
  version           Display the AgentGuard CLI version.

OPTIONS:
  --exec <cmd>      Run a command inside the sandbox immediately after creation.
  --url <url>       AgentGuard backend API URL (default: ${DEFAULT_BACKEND_URL}).
  --detach          Start the protected sandbox in the background and exit immediately.
  --json            Output machine-readable JSON (applicable to 'status').
  -v, --version     Show AgentGuard version.
  -h, --help        Show this help message.

EXAMPLES:
  agentguard protect ./my-project
  agentguard protect ./my-project --detach
  agentguard protect ./my-project --exec "npm test"
  agentguard exec "ls -la /workspace"
  agentguard status
  agentguard kill
`);
}

async function checkPrerequisites(apiUrl) {
  try {
    const res = await fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      return { ok: false, reason: "backend_error", message: `Backend responded with HTTP ${res.status}` };
    }
    const data = await res.json();
    if (data?.prerequisites) {
      if (data.prerequisites.docker === false) {
        return { ok: false, reason: "docker_down", message: "Docker is not running.\nStart Docker Desktop and retry." };
      }
      if (data.prerequisites.mongodb === false) {
        return { ok: false, reason: "mongo_down", message: "MongoDB is unavailable.\nConfigure MONGODB_URI or start MongoDB." };
      }
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      reason: "backend_unreachable",
      message: `Cannot connect to AgentGuard backend at ${apiUrl}.\nEnsure the AgentGuard backend service is running ('npm start' or 'node src/server.js').`,
    };
  }
}

async function protectWorkspace(workspaceArg, options = {}) {
  const apiUrl = options.url || DEFAULT_BACKEND_URL;

  let validatedWorkspace;
  try {
    validatedWorkspace = validateWorkspacePath(workspaceArg);
  } catch (err) {
    console.error(`\x1b[31m[AgentGuard Error]\x1b[0m ${err.message}`);
    process.exit(1);
  }

  const prereq = await checkPrerequisites(apiUrl);
  if (!prereq.ok) {
    console.error(`\x1b[31m[AgentGuard Error]\x1b[0m ${prereq.message}`);
    process.exit(1);
  }

  let sessionRes;
  try {
    sessionRes = await fetch(`${apiUrl}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace: validatedWorkspace }),
    });
  } catch (err) {
    console.error(`\x1b[31m[AgentGuard Error]\x1b[0m Failed to request session creation: ${err.message}`);
    process.exit(1);
  }

  const sessionData = await sessionRes.json();
  if (!sessionRes.ok || !sessionData.success) {
    console.error(`\x1b[31m[AgentGuard Error]\x1b[0m Session creation failed: ${sessionData.error || "Unknown error"}`);
    process.exit(1);
  }

  const session = sessionData.session;
  const containerShortId = session.containerId ? session.containerId.slice(0, 12) : "unknown";

  // Clean user-facing output as specified in product requirements
  console.log(`AgentGuard protected runtime started\n`);
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
    console.log(`Protected sandbox running in background. Use 'agentguard kill' to terminate.`);
    return;
  }

  console.log(`Protected environment is ready. Workloads can execute against the sandbox.`);
  console.log(`Press Ctrl+C to stop the protected environment and clean up.\n`);

  let isCleaningUp = false;
  async function cleanup() {
    if (isCleaningUp) return;
    isCleaningUp = true;
    console.log(`\n[AgentGuard] Stopping protected runtime...`);
    try {
      await fetch(`${apiUrl}/api/sandbox/kill`, { method: "POST" });
      console.log(`[AgentGuard] Sandbox cleaned up successfully.`);
    } catch (err) {
      console.error(`[AgentGuard] Cleanup error: ${err.message}`);
    }
    process.exit(0);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);

  // Monitor sandbox status for enforcement pause notifications
  const monitorInterval = setInterval(async () => {
    try {
      const statusRes = await fetch(`${apiUrl}/api/sandbox/status`);
      const statusData = await statusRes.json();
      if (statusData.paused) {
        console.log(`\n\x1b[41m\x1b[37m[SECURITY ALERT]\x1b[0m Sandbox was PAUSED by AgentGuard risk engine!`);
        console.log(`An event exceeded the security threshold. Container is safely frozen.`);
        console.log(`Inspect events with dashboard or use 'agentguard resume' / 'agentguard kill'.\n`);
      }
      if (!statusData.active) {
        console.log(`\n[AgentGuard] Sandbox container is no longer active.`);
        clearInterval(monitorInterval);
        process.exit(0);
      }
    } catch (err) {
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
    console.error(`[AgentGuard Error] Invalid command`);
    return { exitCode: 1 };
  }

  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const statusRes = await fetch(`${apiUrl}/api/sandbox/status`);
    const status = await statusRes.json();
    if (!status.active || !status.sessionId) {
      console.error(`\x1b[31m[AgentGuard Error]\x1b[0m No active sandbox session found.\nStart one with: agentguard protect <workspace>`);
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
      console.error(`\x1b[31m[Execution Failed]\x1b[0m ${data.error || "Unknown error"}`);
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
    console.error(`\x1b[31m[AgentGuard Error]\x1b[0m Execution error: ${err.message}`);
    process.exit(1);
  }
}

async function showStatus(options = {}) {
  const apiUrl = options.url || DEFAULT_BACKEND_URL;
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/status`);
    const data = await res.json();

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    if (!data.active) {
      console.log(`\nAgentGuard Status: INACTIVE\n`);
      console.log(`  No protected sandbox is currently running.`);
      console.log(`  Start one with: agentguard protect <workspace>\n`);
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
      console.log(`  Resume: agentguard resume`);
      console.log(`  Tear down: agentguard kill\n`);
    } else {
      console.log(`\n  Use 'agentguard exec <command...>' to run commands in the sandbox.`);
      console.log(`  Use 'agentguard kill' to tear down the environment.\n`);
    }
  } catch (err) {
    console.error(`[AgentGuard Error] Failed to connect to backend: ${err.message}`);
    console.error(`Ensure backend is running at ${apiUrl}`);
    process.exit(1);
  }
}

async function pauseSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/pause`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`[AgentGuard Error] ${data.error || "Failed to pause"}`);
      process.exit(1);
    }
    console.log(`[AgentGuard] Sandbox container paused.`);
  } catch (err) {
    console.error(`[AgentGuard Error] Failed to pause: ${err.message}`);
    process.exit(1);
  }
}

async function resumeSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/resume`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`[AgentGuard Error] ${data.error || "Failed to resume"}`);
      process.exit(1);
    }
    console.log(`[AgentGuard] Sandbox container resumed.`);
  } catch (err) {
    console.error(`[AgentGuard Error] Failed to resume: ${err.message}`);
    process.exit(1);
  }
}

async function killSandbox(apiUrl = DEFAULT_BACKEND_URL, options = {}) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/kill`, { method: "POST" });
    const data = await res.json();
    if (!options.silent) {
      if (!res.ok || !data.success) {
        console.log(`[AgentGuard] ${data.error || "No active sandbox to terminate."}`);
      } else {
        console.log(`[AgentGuard] Sandbox container killed and cleaned up.`);
      }
    }
    return data;
  } catch (err) {
    if (!options.silent) {
      console.error(`[AgentGuard Error] Failed to kill sandbox: ${err.message}`);
    }
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help") || args[0] === "help") {
    printHelp();
    process.exit(0);
  }

  if (args.includes("-v") || args.includes("--version") || args[0] === "version") {
    console.log(`agentguard v${packageInfo.version}`);
    process.exit(0);
  }

  const command = args[0];

  const getOption = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const url = getOption("--url") || DEFAULT_BACKEND_URL;

  if (command === "protect" || command === "start") {
    const workspace = args[1];
    if (!workspace || workspace.startsWith("-")) {
      console.error(`\x1b[31m[AgentGuard Error]\x1b[0m Missing workspace path.`);
      console.error(`Usage: agentguard protect <workspace> [options]`);
      process.exit(1);
    }

    const options = {
      detach: args.includes("--detach"),
      exec: getOption("--exec"),
      url,
    };

    await protectWorkspace(workspace, options);
  } else if (command === "exec") {
    const cmdArgs = args.slice(1).filter((a) => !a.startsWith("--url"));
    if (cmdArgs.length === 0) {
      console.error(`[AgentGuard Error] Missing command to execute.`);
      console.error(`Usage: agentguard exec <command...>`);
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
  console.error("[AgentGuard Fatal Error]:", err);
  process.exit(1);
});
