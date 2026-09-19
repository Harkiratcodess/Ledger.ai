# Security Policy

## Supported Versions

Security updates and patches are applied to the active development branch.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of Ledger and the safety of AI-assisted software development seriously. If you identify a security vulnerability or potential container boundary bypass in Ledger, please do **not** open a public issue.

### Disclosure Process

1. **Email Reports**: Please report vulnerabilities via email to `security@ledger-security.local` (or via GitHub Private Vulnerability Reporting if using GitHub).
2. **Details to Include**:
   - Description of the vulnerability or security bypass.
   - Steps to reproduce, including any test workloads or commands.
   - Operating system, Docker version, and Node.js version.
   - Proof of concept or minimal reproduction script if possible.
3. **Response Timeline**:
   - Initial acknowledgement within 48 hours.
   - Assessment and status update within 7 days.
   - Coordinated public disclosure after a patch is released.

## Security Model & Scope

- **In Scope**:
  - Sandbox boundary escapes from `/workspace` to the host environment.
  - Path traversal vulnerabilities in MCP tools (`protected_read_file`, `protected_write_file`).
  - Unauthorized Docker socket access from within the sandbox container.
  - Failures of the risk engine to detect sensitive file touches (e.g. `.env`, `.ssh`) when events are processed.
  - Privilege escalation or command injection within CLI execution handlers.

- **Out of Scope**:
  - Attacks requiring root or administrative access to the host machine running Ledger.
  - Workloads executed directly by the user on the host system without routing through Ledger.
  - Third-party vulnerabilities in underlying Docker engine or Node.js runtime.
