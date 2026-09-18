#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { validateWorkspacePath } = require("../src/utils/workspace-validator");

const DEFAULT_BACKEND_URL = process.env.AGENTGUARD_API_URL || "http://localhost:5000";

function printHelp() {
  console.log(`
AgentGuard Protected Runtime CLI

USAGE:
  agentguard protect <workspace> [options]
  agentguard start <workspace> [options]
  agentguard exec <command...>
  agentguard status
  agentguard pause
  agentguard resume
  agentguard kill

COMMANDS:
  protect, start    Start a protected execution environment for the given workspace.
  exec              Execute a command inside the active AgentGuard sandbox.
  status            Display the status of the active sandbox.
  pause             Pause the active sandbox container.
  resume            Resume the paused sandbox container.
  kill              Terminate and remove the active sandbox container.

OPTIONS:
  --exec <cmd>      Run a command inside the sandbox immediately.
  --url <url>       AgentGuard backend API URL (default: http://localhost:5000).
  --detach          Start the protected sandbox in the background and exit.
  -h, --help        Show this help message.

EXAMPLES:
  agentguard protect ./my-project
  agentguard protect ./my-project --exec "npm test"
  agentguard exec "ls -la /workspace"
  agentguard status
  agentguard kill
`);
}

async function checkBackendHealth(apiUrl) {
  try {
    const res = await fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.status === "ok";
  } catch (err) {
    return false;
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

  console.log(`\x1b[36m[AgentGuard]\x1b[0m Checking AgentGuard backend at ${apiUrl}...`);
  const isHealthy = await checkBackendHealth(apiUrl);
  if (!isHealthy) {
    console.error(`\x1b[31m[AgentGuard Error]\x1b[0m Cannot connect to AgentGuard backend at ${apiUrl}.`);
    console.error(`Ensure the AgentGuard backend service is running ('npm run dev' or 'node src/server.js').`);
    process.exit(1);
  }

  console.log(`\x1b[36m[AgentGuard]\x1b[0m Provisioning protected sandbox for workspace: ${validatedWorkspace}`);

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
  console.log(`
\x1b[32m=======================================================
   AGENTGUARD PROTECTED RUNTIME ACTIVE
=======================================================\x1b[0m
  Session ID : \x1b[33m${session.sessionId}\x1b[0m
  Container  : \x1b[34m${session.containerId.slice(0, 12)}\x1b[0m
  Workspace  : ${session.workspace} -> /workspace (Docker sandbox)
  Security   : Isolated, Non-privileged, No Docker socket
  Network    : Proxy routed via mitmproxy (host.docker.internal:8080)
  Watcher    : Real-time filesystem integrity monitoring active
  Enforcement: Automatic container pause on HIGH-risk detections
\x1b[32m=======================================================\x1b[0m
`);

  if (options.exec) {
    console.log(`\x1b[36m[AgentGuard]\x1b[0m Executing command inside sandbox: ${options.exec}`);
    await executeCommand(session.sessionId, options.exec, apiUrl);
    if (!options.detach) {
      console.log(`\x1b[36m[AgentGuard]\x1b[0m Cleaning up protected sandbox...`);
      await killSandbox(apiUrl);
    }
    return;
  }

  if (options.detach) {
    console.log(`\x1b[32m[AgentGuard]\x1b[0m Protected sandbox running in background. Use 'agentguard kill' to terminate.`);
    return;
  }

  console.log(`Protected environment is ready. Workloads can execute against the sandbox.`);
  console.log(`Press Ctrl+C to stop the protected environment and clean up.\n`);

  let isCleaningUp = false;
  async function cleanup() {
    if (isCleaningUp) return;
    isCleaningUp = true;
    console.log(`\n\x1b[33m[AgentGuard]\x1b[0m Terminating protected sandbox and clearing state...`);
    try {
      await fetch(`${apiUrl}/api/sandbox/kill`, { method: "POST" });
      console.log(`\x1b[32m[AgentGuard]\x1b[0m Sandbox cleaned up successfully. Session marked KILLED.`);
    } catch (err) {
      console.error(`\x1b[31m[AgentGuard]\x1b[0m Cleanup error: ${err.message}`);
    }
    process.exit(0);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Monitor loop for risk pause detection
  const monitorInterval = setInterval(async () => {
    try {
      const statusRes = await fetch(`${apiUrl}/api/sandbox/status`);
      const statusData = await statusRes.json();
      if (statusData.paused) {
        console.log(`\x1b[41m\x1b[37m[SECURITY ALERT]\x1b[0m Sandbox was PAUSED by AgentGuard enforcement engine!`);
        console.log(`Check dashboard at http://localhost:5173 for event details.`);
      }
      if (!statusData.active) {
        console.log(`\x1b[33m[AgentGuard]\x1b[0m Sandbox container is no longer active.`);
        clearInterval(monitorInterval);
        process.exit(0);
      }
    } catch (err) {
      // Ignore transient network errors
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
    console.error(`Invalid command`);
    return;
  }

  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const statusRes = await fetch(`${apiUrl}/api/sandbox/status`);
    const status = await statusRes.json();
    if (!status.active || !status.sessionId) {
      console.error(`\x1b[31m[AgentGuard Error]\x1b[0m No active sandbox session found. Start one with 'agentguard protect <workspace>'.`);
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

async function showStatus(apiUrl = DEFAULT_BACKEND_URL) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/status`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to fetch status: ${err.message}`);
  }
}

async function pauseSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/pause`, { method: "POST" });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to pause: ${err.message}`);
  }
}

async function resumeSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/resume`, { method: "POST" });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to resume: ${err.message}`);
  }
}

async function killSandbox(apiUrl = DEFAULT_BACKEND_URL) {
  try {
    const res = await fetch(`${apiUrl}/api/sandbox/kill`, { method: "POST" });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to kill sandbox: ${err.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  if (command === "protect" || command === "start") {
    const workspace = args[1];
    if (!workspace || workspace.startsWith("-")) {
      console.error(`\x1b[31m[AgentGuard Error]\x1b[0m Missing workspace path.`);
      console.error(`Usage: agentguard protect <workspace>`);
      process.exit(1);
    }

    const options = {
      detach: args.includes("--detach"),
    };

    const execIndex = args.indexOf("--exec");
    if (execIndex !== -1 && args[execIndex + 1]) {
      options.exec = args[execIndex + 1];
    }

    const urlIndex = args.indexOf("--url");
    if (urlIndex !== -1 && args[urlIndex + 1]) {
      options.url = args[urlIndex + 1];
    }

    await protectWorkspace(workspace, options);
  } else if (command === "exec") {
    const cmdArgs = args.slice(1);
    if (cmdArgs.length === 0) {
      console.error(`Missing command to execute.`);
      process.exit(1);
    }
    const fullCmd = cmdArgs.join(" ");
    await executeCommand(null, fullCmd);
  } else if (command === "status") {
    await showStatus();
  } else if (command === "pause") {
    await pauseSandbox();
  } else if (command === "resume") {
    await resumeSandbox();
  } else if (command === "kill") {
    await killSandbox();
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
