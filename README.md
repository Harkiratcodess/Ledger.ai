# AgentGuard

**Security Middleware & Protected Runtime for AI Coding Agents**

AgentGuard creates a secure, monitored execution runtime around existing AI coding platforms and agents (such as Kilo, Claude Code, OpenAI Codex, OpenRouter-driven agents, and local autonomous scripts). 

AgentGuard is **not** an AI agent itself. It is security middleware: the user does **not** need to modify the agent's source code or adopt proprietary agent SDKs.

---

## Architecture

```
User
  ↓
Existing AI Coding Platform / Agent (agent-agnostic)
  ↓
AgentGuard Protected Runtime
  ↓
Docker Sandbox Container
  ├── Workspace-only bind mount (/workspace)
  ├── Real-time filesystem integrity monitoring
  ├── Outbound HTTP/HTTPS proxy inspection (mitmproxy)
  └── Risk Evaluation Engine
  ↓
Enforcement Action (Allow / Record / Pause)
  ↓
User's Managed Workspace
```

---

## Security Model

AgentGuard isolates workloads inside dedicated Docker containers and monitors actions in real time:

- **Isolated Docker Sandbox**: The agent workload executes inside a non-privileged Docker container. The Docker socket is never mounted. Host networking is disabled.
- **Workspace-Only Mounting**: Only the explicitly targeted project directory is mounted to `/workspace`. Deny-lists strictly prevent mounting root (`/`, `C:\`), user home directories (`~`), SSH keys (`.ssh`), cloud credentials (`.aws`), or system paths.
- **Real-Time Filesystem Monitoring**: File modifications within the workspace are captured via filesystem events and evaluated by the risk engine.
- **Network Observability**: Sandbox network traffic is proxied through an inspection addon. Metadata (domain, port, method, status code) is analyzed against baseline allowlists. **No request or response bodies are stored.**
- **Non-Destructive Enforcement**: When HIGH risk is detected (e.g. sensitive credential file access, suspicious outbound exfiltration targets), the sandbox container is **automatically paused** to prevent damage without destroying uncommitted code. High-risk containers are never automatically resumed.
- **Scope Boundary**: AgentGuard secures and constrains actions executed inside the protected sandbox. It does **not** claim to protect the entire host operating system outside the container boundary.

---

## Prerequisites

Before starting AgentGuard, ensure the following prerequisites are installed and running:

1. **Node.js**: Version 18.0.0 or higher (`node -v`)
2. **Docker**: Docker Desktop or Docker Engine running (`docker info`)
3. **MongoDB**: Local or cloud MongoDB instance running on port 27017 (`mongod`)
4. **mitmproxy** (optional for network interception): `mitmdump` installed on host or container

---

## Installation

### From Source (Local Development)

```bash
# Clone repository
git clone https://github.com/Harkiratcodess/Ledger.ai.git
cd Ledger.ai/backend

# Install dependencies
npm install

# Link CLI globally
npm link
```

Once linked, the `agentguard` command is available system-wide.

### Environment Configuration

Copy the sample environment file and adjust if necessary:

```bash
cp .env.example .env
```

Key environment variables:
| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | AgentGuard backend API port |
| `MONGODB_URI` | `mongodb://localhost:27017/agentguard` | MongoDB connection URI |
| `AGENTGUARD_PROXY_HOST` | `host.docker.internal` | Proxy hostname accessible from container |
| `AGENTGUARD_PROXY_PORT` | `8080` | Proxy port |
| `AGENTGUARD_SANDBOX_IMAGE` | `node:20-slim` | Base Docker image for sandboxes |
| `AGENTGUARD_API_URL` | `http://localhost:5000` | Backend API URL used by CLI |

---

## Starting the AgentGuard Services

In your terminal:

```bash
# Terminal 1: Start AgentGuard backend
cd backend
npm start

# Terminal 2: Start mitmproxy (for network visibility)
mitmdump -p 8080 -s backend/src/services/mitmproxy_network_addon.py --set flow_detail=1

# Terminal 3 (Optional): Start React Dashboard
cd agentguard-react
npm run dev
```

---

## CLI Commands

### 1. Protect a Workspace

Start a protected sandbox for a target project directory:

```bash
# Interactive mode (cleans up on Ctrl+C)
agentguard protect ./my-project

# Detached background mode
agentguard protect ./my-project --detach

# Run a workload command inside sandbox and immediately clean up
agentguard protect ./my-project --exec "npm test"
```

Output:
```text
AgentGuard protected runtime started

Workspace: /path/to/my-project
Session: AG-20260918-123456-abcdef
Container: 1a2b3c4d5e6f
Network monitoring: enabled
Filesystem monitoring: enabled
Risk enforcement: enabled
```

### 2. Check Sandbox Status

```bash
agentguard status
```

Or for machine-readable JSON:
```bash
agentguard status --json
```

### 3. Execute Commands Inside the Sandbox

```bash
agentguard exec "ls -la /workspace"
agentguard exec "npm run build"
```

### 4. Manual Enforcement & Lifecycle Controls

```bash
# Freeze the container
agentguard pause

# Unfreeze the container
agentguard resume

# Terminate and clean up the container
agentguard kill
```

### 5. Version and Help

```bash
agentguard --version
agentguard --help
```

---

## Generic MCP Security Gateway (`agentguard-mcp`)

AgentGuard includes a generic, agent-agnostic **MCP (Model Context Protocol)** Security Gateway. It exposes standard MCP tools to any compatible AI assistant (Claude Desktop, Cursor, Goose, Cline, or custom agent frameworks) so that agent tool calls are routed through the existing AgentGuard protected sandbox, filesystem integrity monitor, proxy, and risk engine.

### Architecture

```
AI Coding Agent (MCP Client)
      ↓ MCP Protocol (STDIO / JSON-RPC 2.0)
AgentGuard MCP Gateway (`agentguard-mcp`)
      ↓ REST API
AgentGuard Backend
      ↓
Docker Sandbox Container
  ├── Workspace-only mount (/workspace)
  ├── Filesystem watcher (Chokidar)
  ├── Outbound HTTP/HTTPS proxy (mitmproxy)
  └── Real-time Risk Engine & Enforcement
      ↓
Enforcement Action (Allow / Record / Pause)
```

### Available MCP Tools

| Tool | Description | Security Guarantees |
|---|---|---|
| `protected_execute` | Executes commands inside the sandbox container | Runs inside non-privileged container; never on host. Fails cleanly if sandbox is paused or killed. |
| `protected_read_file` | Reads workspace files via relative path | Path guard prevents path traversal (`../`), absolute paths, `.ssh`, `.aws`, and credential store access. |
| `protected_write_file` | Writes content to workspace files | Path-guarded; writes trigger filesystem watcher and risk engine. High-risk writes (`.env`, credentials) automatically pause sandbox. |
| `protected_network_request` | Makes HTTP/HTTPS requests from inside sandbox | Traffic routes through configured container proxy (`mitmproxy`); metadata inspected against allowlist. Response bodies are not stored. |

> **Important**: AgentGuard remains completely agent-agnostic. No vendor-specific code exists for any particular agent. Only operations explicitly routed through the AgentGuard MCP tools are protected.

### Starting the MCP Gateway

Ensure the AgentGuard backend and a protected sandbox session are running:

```bash
# 1. Start a protected session
agentguard protect ./my-project --detach

# 2. Run the MCP gateway via CLI
agentguard-mcp
```

### MCP Client Configuration Example

Add AgentGuard to your agent's MCP settings configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agentguard": {
      "command": "agentguard-mcp",
      "env": {
        "AGENTGUARD_API_URL": "http://localhost:5000",
        "AGENTGUARD_SESSION_ID": ""
      }
    }
  }
}
```

*Note: If `AGENTGUARD_SESSION_ID` is omitted, the gateway automatically resolves the currently active sandbox session.*

---

## Testing & Verification

Run the automated verification suite:

```bash
node scratch/phase9_tests.js
```

---

## Current Limitations

- **Container Image Support**: Defaults to Linux-based containers (`node:20-slim`). Workloads requiring Windows-native binaries must supply a compatible Windows container image.
- **Single Active Interactive Sandbox per CLI**: While the backend supports concurrent sessions, the CLI default commands (`exec`, `pause`, `resume`, `kill`) target the primary active sandbox unless `--session <id>` is specified.
- **Proxy Interception Scope**: Network monitoring relies on HTTP/HTTPS proxy configuration. Raw TCP or non-proxied UDP traffic bypassing standard proxy environment variables is blocked by container isolation but not deeply inspected.
- **Host Scope**: Only actions routed through the protected container boundary are governed. AgentGuard does not hook arbitrary host OS kernel calls.
