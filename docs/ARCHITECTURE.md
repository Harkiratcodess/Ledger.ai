# Ledger Architecture Specification

This document details the internal architecture, component boundaries, and security enforcement pipeline of **Ledger**.

---

## High-Level Execution Pipeline

```
          +--------------------------------------+
          |       AI Agent / Developer Tool      |
          +--------------------------------------+
                             |
                             | (CLI `ledger exec` or MCP stdio JSON-RPC)
                             v
          +--------------------------------------+
          |     Ledger Runtime / MCP Gateway     |
          +--------------------------------------+
                             |
                             | Event telemetry (Filesystem / Network)
                             v
          +--------------------------------------+
          |             Risk Engine              |
          +--------------------------------------+
                             |
                             | Risk Assessment (Score & Level)
                             v
          +--------------------------------------+
          |          Policy Enforcement          |
          |  (Allow / Log / Non-destructive Pause|
          +--------------------------------------+
                             |
                             | Container State & Process Control
                             v
          +--------------------------------------+
          |            Docker Sandbox            |
          |         (Confined /workspace)        |
          +--------------------------------------+
                             |
                             v
          +--------------------------------------+
          |          Workspace / Network         |
          +--------------------------------------+
```

---

## Component Definitions & Responsibilities

### 1. CLI Runtime (`ledger`)
- **Location**: `backend/bin/agentguard.js`
- **Role**: Headless command-line interface for the developer.
- **Responsibilities**:
  - Validates requested workspace paths to reject root filesystems, user home directories, `AppData`, and sensitive credential directories (`.ssh`, `.aws`).
  - Ensures the local backend daemon is accessible (or starts it on demand).
  - Initiates session creation via REST API (`POST /api/sessions`).
  - Provides workflow operations: `init`, `protect`, `exec`, `status`, `pause`, `resume`, `kill`, and `version`.
  - Can run completely headless without the dashboard.

### 2. Docker Sandbox
- **Location**: `backend/src/services/docker.service.js`, `backend/src/services/agent-execution.service.js`
- **Role**: Process containment and file isolation boundary.
- **Responsibilities**:
  - Spawns a dedicated Docker container using a secure, lightweight Linux base image (`node:20-slim`).
  - Mounts **only** the validated project directory to the container path `/workspace`.
  - Enforces strict unmounting of the host Docker socket (`/var/run/docker.sock` does not exist inside the container).
  - Executes isolated agent commands within the container working directory `/workspace`.

### 3. Filesystem & Network Observers
- **Location**: `backend/src/services/file-watcher.service.js`, `backend/src/services/mitmproxy_network_addon.py`
- **Role**: Real-time signal collection.
- **Responsibilities**:
  - **Filesystem Integrity Watcher**: Uses `chokidar` to monitor the host-side project directory for real-time file creation, mutation, and deletion events.
  - **Network Monitoring**: Intercepts outbound HTTP/HTTPS connections from the sandbox container via an HTTP proxy, recording destination hostnames, ports, and methods.
  - Dispatches normalized event objects (`type`, `path`/`host`, `action`, `timestamp`) to the Risk Engine.

### 4. Risk Engine
- **Location**: `backend/src/services/risk-engine.js`
- **Role**: Deterministic, zero-cloud security scoring.
- **Responsibilities**:
  - Analyzes each incoming event against codified security rules:
    - **Credential Rules**: Creation or read of `.env`, `.pem`, `.key`, `.git/config`, `id_rsa`.
    - **Path Traversal Rules**: Escape sequences or traversal attempts outside `/workspace`.
    - **Network Rules**: Connections to unclassified external endpoints or private IP spaces.
  - Calculates a risk score (0 to 100) and maps it to a discrete level:
    - **LOW (0 - 29)**: Standard project operations (allowed).
    - **MEDIUM (30 - 69)**: Suspicious or unallowlisted external network activity (recorded).
    - **HIGH (70 - 100)**: Critical security violations (triggers enforcement).

### 5. Policy Enforcement
- **Location**: `backend/src/services/enforcement.service.js`
- **Role**: Autonomous reaction to security violations.
- **Responsibilities**:
  - When an event is scored as **HIGH** risk, the enforcement service executes a non-destructive container pause via the Docker Engine API (`container.pause()`).
  - Atomically transitions the session state in MongoDB to `PAUSED`.
  - Rejects further execution requests with HTTP 409 until an explicit `resume` or `kill` command is issued by the developer.

### 6. MCP Gateway (`ledger-mcp`)
- **Location**: `backend/bin/agentguard-mcp.js`, `backend/src/mcp/server.js`, `backend/src/mcp/tools.js`
- **Role**: Standardized Model Context Protocol adapter for modern AI coding agents.
- **Responsibilities**:
  - Runs as an MCP server communicating over standard I/O via JSON-RPC 2.0.
  - Exposes 4 secured tools:
    1. `protected_execute`: Executes shell commands inside the container sandbox.
    2. `protected_read_file`: Reads files strictly within `/workspace`.
    3. `protected_write_file`: Writes files safely inside `/workspace` using base64 decoding.
    4. `protected_network_request`: Makes HTTP requests through the monitored container proxy.
  - Employs an independent path guard (`path-guard.js`) to block traversal (`../`), sensitive directories, and host root paths before invoking tool logic.

### 7. Observability Dashboard (Optional)
- **Location**: `agentguard-react/`
- **Role**: Visual telemetry and administrative control.
- **Responsibilities**:
  - Connects to the local Ledger REST API (`http://localhost:5000`).
  - Displays active session metadata, real-time event logs, and risk distributions.
  - Provides visual controls for pause, resume, and sandbox termination.
  - Completely optional: Ledger security boundaries remain 100% active and enforced without the UI open.
