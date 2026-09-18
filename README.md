# Ledger

**Protected Execution Boundary & Security Gateway for AI Coding Agents**

Ledger provides a security boundary for AI-agent workloads. Its **AgentGuard security runtime** monitors filesystem and network activity in real time and automatically pauses the execution sandbox when configured high-risk activity is detected.

Ledger is **agent-agnostic**: it works with existing AI coding platforms and agents (such as Claude Desktop, Cursor, Goose, Cline, Kilo, OpenAI Codex, or custom autonomous scripts) without modifying the agent's code or requiring proprietary agent SDKs.

> **Security Scope & Boundary**:  
> Ledger provides a protected execution boundary for operations executed inside its managed Docker sandbox or routed through the Ledger MCP Gateway. Installing Ledger does **not** automatically control every arbitrary process running on your host machine. Only operations routed through the Ledger/AgentGuard protected runtime are covered.

---

## Architecture

```
AI Coding Agent (MCP Client)         External Agent Workload / Developer
            │                                         │
            │  STDIO / JSON-RPC                       │  CLI
            ▼                                         ▼
   Ledger MCP Gateway                        Ledger CLI (`ledger`)
   (`ledger-mcp`)                                     │
            │                                         │
            └───────────────┬─────────────────────────┘
                            │ REST API (`:5000`)
                            ▼
           AgentGuard Security Runtime
                            │
              Docker Sandbox Container
          ┌───────────────────────────────────┐
          │ Workspace-only mount (/workspace) │
          │ Filesystem monitoring (Chokidar)  │
          │ Outbound HTTP proxy (mitmproxy)   │
          │ Real-Time Risk Evaluation Engine  │
          └───────────────────────────────────┘
                            │
           Automated Enforcement Action
             ├── LOW      → Allow
             ├── MEDIUM   → Record & Log
             └── HIGH     → Pause Sandbox (Freeze Container)
                            │
                    MongoDB & Dashboard
```

---

## Why Ledger Exists

Autonomous AI coding agents generate and execute code, invoke terminal commands, and make outbound network requests. Without containment, an agent could inadvertently:
- Read or overwrite sensitive host files (`~/.ssh`, `~/.aws`, `.env`, system files).
- Exfiltrate secrets to unverified endpoints.
- Execute destructive shell commands directly on your development workstation.

Ledger solves this by wrapping agent activity in an isolated, monitored execution runtime with non-destructive enforcement: if high-risk activity is detected, Ledger **freezes the sandbox immediately** without destroying uncommitted developer code.

---

## Prerequisites

Before starting Ledger, ensure the following are installed and running:

1. **Node.js**: Version 18.0.0 or higher (`node -v`)
2. **Docker**: Docker Desktop or Docker Engine running (`docker info`)
3. **MongoDB**: Local or cloud MongoDB instance running on port 27017 (`mongod`)
4. **mitmproxy** (optional, for network observability): `mitmdump` installed on host or container

---

## Installation

### Local Developer Installation

From the project root:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Link binaries globally
npm link
```

Once linked, the following CLI commands are available system-wide:
- **`ledger`**: Primary developer CLI
- **`ledger-mcp`**: Generic MCP Security Gateway
- **`agentguard`**: Backwards-compatible CLI alias
- **`agentguard-mcp`**: Backwards-compatible MCP binary alias

Verify installation from any directory:

```bash
ledger --version
ledger --help
```

---

## Starting Ledger Services

In your terminal windows:

```bash
# Terminal 1: Start AgentGuard backend service
cd backend
npm start

# Terminal 2: Start mitmproxy (for network visibility)
mitmdump -p 8080 -s backend/src/services/mitmproxy_network_addon.py --set flow_detail=1

# Terminal 3 (Optional): Start React Observability Dashboard
cd agentguard-react
npm run dev
```

---

## CLI Workflow

### 1. Protect a Workspace

Start a protected sandbox for any target project directory outside the Ledger source tree:

```bash
# Detached background mode
ledger protect ./my-project --detach

# Interactive mode (cleans up on Ctrl+C)
ledger protect ./my-project

# Run a workload command inside sandbox and immediately clean up
ledger protect ./my-project --exec "npm test"
```

Output:
```text
Ledger — AgentGuard protected runtime started

Workspace: /path/to/my-project
Session: AG-20260918-123456-abcdef
Container: 1a2b3c4d5e6f
Network monitoring: enabled
Filesystem monitoring: enabled
Risk enforcement: enabled
```

### 2. Check Sandbox Status

```bash
ledger status
```

For machine-readable JSON:
```bash
ledger status --json
```

### 3. Execute Commands in the Sandbox

All commands execute strictly inside the containerized `/workspace`:

```bash
ledger exec "ls -la"
ledger exec "npm test"
```

### 4. Lifecycle & Enforcement Controls

```bash
# Freeze the container
ledger pause

# Unfreeze the container
ledger resume

# Terminate container and finalize session
ledger kill
```

---

## Generic MCP Security Gateway (`ledger-mcp`)

Ledger includes a generic, agent-agnostic **Model Context Protocol (MCP)** Security Gateway. It exposes standard tools to any MCP-compatible AI assistant (Claude Desktop, Cursor, Goose, Cline, or custom agent frameworks) so that tool calls route through Ledger's protected sandbox.

### Available MCP Tools

| Tool | Description | Security Guarantees |
|---|---|---|
| `protected_execute` | Executes shell commands in the sandbox container | Runs inside the container at `/workspace`; never on host. Blocked when paused. |
| `protected_read_file` | Reads workspace files via relative path | Path guard blocks `../`, absolute paths (`/`, `C:\`), `.ssh`, `.aws`, and credentials. |
| `protected_write_file` | Writes content to workspace files | Triggers filesystem watcher and risk engine. Writing to `.env` or sensitive paths pauses sandbox. |
| `protected_network_request` | Makes HTTP/HTTPS requests from inside sandbox | Routes through container proxy (`mitmproxy`); metadata audited against allowlists. Response bodies are never stored. |

### Connecting an MCP-Compatible Agent

Add Ledger to your agent's MCP configuration file (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ledger": {
      "command": "ledger-mcp",
      "env": {
        "AGENTGUARD_API_URL": "http://localhost:5000",
        "AGENTGUARD_SESSION_ID": ""
      }
    }
  }
}
```

*Note: If `AGENTGUARD_SESSION_ID` is left empty, the gateway automatically connects to the currently active sandbox session.*

---

## How Risk Detection & Enforcement Works

1. **Filesystem Integrity**: Modifications inside `/workspace` are detected in real time by Chokidar and evaluated by the AgentGuard risk engine.
2. **Network Observability**: Sandbox outbound HTTP/HTTPS requests pass through the mitmproxy addon. Only metadata (hostname, method, status code, timestamp) is persisted. **No request or response bodies are stored.**
3. **Risk Scoring**:
   - **LOW**: Normal coding activity within the workspace or approved baseline domains (`example.com`, `localhost`, etc.). Action: `allow`.
   - **MEDIUM**: Unrecognized outbound destinations or anomalous tool usage. Action: `record` (logged in database and dashboard).
   - **HIGH**: Sensitive credential path access (`.env`, `.ssh`, `.aws`, private keys, secret tokens). Action: **automatic sandbox pause** (`container.pause()`).
4. **Non-Destructive Freeze**: High-risk containers are frozen in place. The agent cannot execute further commands, but files remain intact on the developer's workstation.
5. **No Auto-Resume**: The sandbox will never resume on its own. The developer must inspect the alert and explicitly run `ledger resume` or `ledger kill`.

---

## Limitations

- **Container Image**: Default sandbox image is `node:20-slim` (Linux). Workloads requiring Windows-native binaries must supply an alternative image via `AGENTGUARD_SANDBOX_IMAGE`.
- **Protected Boundary Only**: Ledger secures operations routed into the Docker sandbox or through `ledger-mcp`. It does not intercept raw host processes or arbitrary system calls outside the container boundary.
- **Proxy Scope**: Outbound network inspection applies to HTTP/HTTPS traffic honoring standard proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`).
- **Single Active CLI Sandbox**: The CLI defaults commands (`exec`, `pause`, `resume`, `kill`) to the primary active sandbox unless targeted via backend APIs.

---

## Testing & Verification

Run the automated verification test suites:

```bash
# Complete Phase 13 End-to-End Product & Workflow Test
node scratch/phase13_e2e_test.js

# Phase 12 MCP Security Gateway Tests (32/32)
node scratch/phase12_mcp_test.js

# Phase 11 Real Agent Workload Validation (43/43)
node scratch/phase11_workload_test.js

# Phase 10 CLI & Packaging Tests (47/47)
node scratch/phase10_tests.js
```
