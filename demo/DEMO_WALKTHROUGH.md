# Ledger Demonstration Script & Video Walkthrough

This guide provides a deterministic, step-by-step workflow designed for a recorded video demo (e.g. LinkedIn, GitHub, YouTube) showcasing Ledger's core security boundary.

> **Security Note**: All credentials and tokens used in this walkthrough are dummy placeholders (`API_KEY=dummy_test_token_12345`). Never use real secrets or private tokens during demonstrations.

---

## Prerequisites for Recording

1. **Terminal 1**: Ready in an empty disposable directory (e.g. `mkdir demo-workspace && cd demo-workspace`).
2. **Terminal 2 (Optional)**: Ledger dashboard running in `agentguard-react/` (`npm run dev` at `http://localhost:5173`).
3. **Docker**: Docker Desktop running locally.
4. **Backend**: Ledger server running on `http://localhost:5000` (or started automatically by `ledger protect`).

---

## Step-by-Step Demo Sequence

### Phase A: Initialize & Protect a Workspace
In Terminal 1:
```bash
# Initialize project configuration
ledger init

# Protect current directory in detached mode
ledger protect . --detach
```
**Talking Point**: *"Notice how Ledger initializes a clean `.ledger/config.json` with zero machine paths or secrets, boots an isolated Docker sandbox container, and attaches real-time filesystem and network observers."*

---

### Phase B: Check Runtime Status
```bash
ledger status
```
**Output Expected**:
```text
AgentGuard Status: ACTIVE (RUNNING)
  Session ID  : AG-2026...
  Container   : a1b2c3d4e5f6
  Running     : true
  Paused      : false
  Filesystem  : Monitored via integrity watcher
  Network     : Routed via mitmproxy
  Enforcement : Non-destructive pause on HIGH risk
```
**Talking Point**: *"The status confirms the sandbox is active and running. The AI agent's operations are now strictly confined to `/workspace`."*

---

### Phase C: Execute a Harmless Command (LOW Risk)
```bash
ledger exec "echo 'console.log(\"Hello from isolated container\");' > app.js"
ledger exec "node app.js"
```
**Output Expected**:
```text
Hello from isolated container
```
**Talking Point**: *"Commands execute inside the container, not on the host. In the optional dashboard, this appears as a normal LOW-risk filesystem event that is automatically allowed."*

---

### Phase D: Trigger a Controlled HIGH-Risk Security Violation
Simulate an agent attempting to create or modify a sensitive `.env` credential file:
```bash
ledger exec "echo 'OPENAI_API_KEY=dummy_sk_test_51NxYz123456789' > .env"
```
**Talking Point**: *"Watch what happens when an agent workload touches a sensitive credential path like `.env`..."*

---

### Phase E: Verify Autonomous Freeze & Command Blocking
Check status immediately:
```bash
ledger status
```
**Output Expected**:
```text
AgentGuard Status: ACTIVE (PAUSED)
  Session ID  : AG-2026...
  Container   : a1b2c3d4e5f6
  Running     : true
  Paused      : true
  Notice: Container is paused due to security policy enforcement.
```

Attempt to run another command while the sandbox is frozen:
```bash
ledger exec "ls -la"
```
**Output Expected**:
```text
[Ledger Error] Session sandbox is paused.
```
**Talking Point**: *"The risk engine detected a HIGH-risk policy violation: access to a credential file. Instead of killing the process abruptly or letting it silently exfiltrate data, Ledger non-destructively freezes the container processes. All subsequent commands are blocked."*

---

### Phase F: Developer Review & Resume
The developer reviews the alert, confirms the state, and decides to resume:
```bash
ledger resume
```
**Output Expected**:
```text
[Ledger] Resumed sandbox container: a1b2c3d4e5f6
```

Verify that execution is restored:
```bash
ledger exec "echo 'Sandbox is back online'"
```
**Output Expected**:
```text
Sandbox is back online
```
**Talking Point**: *"With `ledger resume`, the developer retains full supervisory control. The container is unfrozen and work proceeds safely."*

---

### Phase G: Clean Teardown & Container Hygiene
Terminate the sandbox environment:
```bash
ledger kill
```
**Output Expected**:
```text
[Ledger] Sandbox container terminated successfully.
```

Confirm that no lingering or orphaned Docker containers remain:
```bash
docker ps
```
**Talking Point**: *"Tearing down with `ledger kill` leaves zero orphan containers or lingering processes on the host. Clean, local, and zero telemetry."*
