# Ledger

**Local security runtime and MCP gateway for AI agent workloads.**

Ledger provides an isolated execution boundary for AI coding agents. It is **not** an AI coding agent itself and does not generate code or replace tools like Cursor, Claude, or Codex. Instead, Ledger wraps agent workloads in an isolated Docker container, observes filesystem and network events in real time, evaluates security risk, and provides a protected Model Context Protocol (MCP) gateway.

```
AI Agent / Developer Tool
          ↓
  Ledger Runtime / MCP Gateway
          ↓
     Risk Engine
          ↓
  Policy Enforcement
          ↓
    Docker Sandbox
          ↓
   Workspace / Network
```

> **Important Boundary Notice**: Ledger does not claim to protect every AI agent from every conceivable attack. Protection strictly applies to agent workloads and tool calls operating through Ledger's supported boundaries (the sandboxed container execution environment and the MCP security gateway). Activities executed directly on the host machine outside Ledger bypass this runtime boundary.

---

## What Problem Ledger Solves

Autonomous AI coding agents routinely execute shell commands, read and write project files, and perform network operations. Running unconstrained agents directly on a developer workstation presents significant security risks:
- **Credential & Secret Exposure**: Agents or malicious dependencies reading `~/.ssh`, `~/.aws`, `.env`, or keychain data.
- **Host Escapes & Filesystem Corruption**: Errant or prompt-injected commands altering root filesystems, system binaries, or parent directories.
- **Unregulated Network Exfiltration**: Workloads transmitting source code or environment variables to arbitrary external servers.

Ledger solves this by confining workspace operations to an isolated Docker container, monitoring all filesystem and network signals, scoring actions against a local risk engine, and **freezing** (pausing) execution when high-risk activity is detected.

---

## Quick Start

### 1. Global Installation

```bash
# Clone the repository and link locally (or install from release tarball)
cd backend
npm install
npm link
```

### 2. Protect a Project

```bash
cd /path/to/my-project

# Initialize Ledger project configuration (.ledger/config.json)
ledger init

# Start the protected sandbox runtime in background
ledger protect . --detach

# Check runtime status
ledger status
```

### 3. Run Agent Workloads

```bash
# Execute commands safely inside the isolated container
ledger exec npm test
ledger exec "ls -la /workspace"

# Pause or resume the sandbox
ledger pause
ledger resume

# Terminate the sandbox when finished
ledger kill
```

### 4. Use as an MCP Security Gateway

```bash
# Launch the STDIO MCP gateway
ledger mcp
```

---

## CLI Command Reference

| Command | Arguments / Flags | Description |
|---|---|---|
| `ledger init` | — | Generates a clean `.ledger/config.json` in the current directory. |
| `ledger protect` | `<workspace> [--detach] [--exec <cmd>]` | Validates workspace path, boots container sandbox, starts file & network monitoring. |
| `ledger exec` | `<command...>` | Executes a command inside the `/workspace` directory of the active sandbox. |
| `ledger status` | `[--json]` | Displays real-time status of the sandbox (active, paused, stopped, container ID). |
| `ledger pause` | — | Non-destructively freezes container processes via Docker API. |
| `ledger resume` | — | Unfreezes a paused container and restores execution. |
| `ledger kill` | — | Stops and removes the active sandbox container cleanly. |
| `ledger mcp` | — | Launches the Ledger MCP JSON-RPC server over standard I/O. |
| `ledger version` | `-v, --version` | Prints installed CLI version. |
| `ledger --help` | `-h, --help` | Displays usage instructions and options. |

*Backwards compatibility aliases*: `agentguard` and `agentguard-mcp` remain supported aliases for all commands.

---

## MCP Gateway Integration

Ledger implements the Model Context Protocol (MCP) specification over `stdio`, allowing any MCP-compliant agent (Claude Desktop, Cursor, VS Code, Goose, or custom LLM frameworks) to interact with the protected sandbox through structured tools.

### Available MCP Tools

1. **`protected_execute`**: Runs an isolated command inside `/workspace` inside the container.
2. **`protected_read_file`**: Reads a file confined strictly within the project workspace.
3. **`protected_write_file`**: Atomically writes a file inside the container without shell injection risks.
4. **`protected_network_request`**: Dispatches HTTP/HTTPS requests routed through the monitoring proxy.

### Client Configuration Example

Add the following to your agent's MCP configuration file (e.g. `claude_desktop_config.json` or Cursor MCP settings):

```json
{
  "mcpServers": {
    "ledger": {
      "command": "ledger-mcp",
      "env": {
        "AGENTGUARD_API_URL": "http://localhost:5000"
      }
    }
  }
}
```

*Path Guard Protection*: Any attempt by an MCP tool to access parent paths (`../../etc/passwd`), absolute host roots (`C:\`, `/etc`), or sensitive credential directories (`.ssh`, `.aws`) is rejected before execution with an explicit policy violation error.

---

## Security Model & Risk Engine

Ledger evaluates every recorded filesystem and network event against a deterministic, zero-cloud risk engine.

### Risk Levels & Actions

| Risk Level | Score | Description | Enforcement Action |
|---|---|---|---|
| **LOW** | 0 – 29 | Routine operations within `/workspace` (e.g., source file edit, standard build). | **Allow** |
| **MEDIUM** | 30 – 69 | Unusual operations or unclassified external network traffic. | **Log & Record** |
| **HIGH** | 70 – 100 | Critical violations: `.env` creation, credential reads, path escape attempts. | **Pause Container** |

### Container Isolation
- **Confined Mount**: Only the specified workspace directory is bind-mounted to `/workspace`.
- **Root & Sensitive Mount Denials**: Attempts to mount system roots (`/`, `C:\`), user home directories (`~`), `AppData`, or credential folders (`.ssh`, `.aws`) are rejected at startup by `workspace-validator.js`.
- **Docker Socket Unmounted**: `/var/run/docker.sock` is never mounted inside the sandbox, preventing container escape via the Docker daemon.
- **Non-Destructive Freeze**: On HIGH risk, Ledger issues an atomic container freeze. The developer can inspect events in the CLI or dashboard and safely choose to `resume` or `kill`.

---

## Privacy & Zero Telemetry

- **100% Local Execution**: All policy evaluation, container management, and event logging occurs entirely on `localhost`.
- **Zero Cloud Tracking**: Ledger transmits zero telemetry, usage metrics, or error reports to external servers.
- **Data Minimization**: Event logs in MongoDB store metadata (file paths, timestamp, risk score, rule reason). Sensitive file contents and payloads are never stored.

---

## Optional Dashboard

Ledger is fully functional headlessly from the CLI without any GUI. For visual observability, an optional React dashboard is included in `agentguard-react/`:

```bash
cd agentguard-react
npm install
npm run dev
```

The dashboard connects to `http://localhost:5000` to display real-time session status, timeline event logs, risk distributions, and pause/resume controls.

---

## Limitations

- **Routed Workloads Only**: Ledger protects operations that execute inside the sandbox container or through the MCP gateway. It cannot monitor background processes run directly on the host machine.
- **Container Environment**: The default sandbox image is `node:20-slim` (Debian Linux). Workloads requiring Windows-native binaries or specialized system packages require a custom Docker image specified in `.ledger/config.json`.
- **Docker Dependency**: Requires a running Docker engine (Docker Desktop or Linux Docker daemon) and local MongoDB instance.
- **Single Active CLI Session**: The standard CLI tracks one primary active sandbox at a time. Multi-session workflows can be managed concurrently via the REST API.

---

## Development & Automated Testing

Run the end-to-end verification suites from the workspace root:

```bash
# Start backend server
cd backend && npm start

# Execute test suites
node scratch/phase10_tests.js            # CLI & Core API Smoke Tests
node scratch/phase11_workload_test.js     # Real Workload Isolation Tests
node scratch/phase12_mcp_test.js          # MCP STDIO Protocol Tests
node scratch/phase13_e2e_test.js          # End-to-End Product Lifecycle Tests
node scratch/phase14_validation_test.js   # Isolated Package Distribution Tests

# Validate frontend build
cd agentguard-react && npm run build

# Validate production package contents
cd backend && npm pack --dry-run
```

---

## Roadmap

- [ ] Published `ledger-security` package on npm registry.
- [ ] Configurable per-project network allowlists enforced via proxy rules.
- [ ] Multi-container concurrent session management via CLI.
- [ ] Pre-configured MCP integration templates for popular agent frameworks (LangChain, AutoGen, CrewAI).

---

## License

This project is licensed under the [MIT License](LICENSE).
