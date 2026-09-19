# Contributing to Ledger

Thank you for your interest in contributing to Ledger! Ledger is an open-source security runtime designed to keep AI coding agents safely contained within isolated workspaces.

## Development Setup

### Prerequisites
- **Node.js**: >= 18.0.0
- **Docker**: Docker Desktop or Docker Engine running locally
- **MongoDB**: MongoDB instance listening on `mongodb://localhost:27017`

### Repository Layout
- `backend/`: Core Node.js Express server, Docker orchestration, risk engine, CLI runtime (`bin/agentguard.js`), and MCP gateway (`bin/agentguard-mcp.js`).
- `agentguard-react/`: Optional React + Tailwind observability dashboard.
- `scratch/`: Automated regression and lifecycle test suites.
- `docs/`: Architecture specifications and guides.

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/Harkiratcodess/Ledger.ai.git
cd ledger

# 2. Set up backend
cd backend
npm install
npm link
cd ..

# 3. Set up optional dashboard
cd agentguard-react
npm install
cd ..
```

## Running Tests

Before submitting any Pull Request, ensure that all test suites pass without regression:

```bash
# Start backend in a background terminal
cd backend && npm start

# In another terminal, run validation suites
node scratch/phase10_tests.js
node scratch/phase11_workload_test.js
node scratch/phase12_mcp_test.js
node scratch/phase13_e2e_test.js
node scratch/phase14_validation_test.js

# Validate frontend build
cd agentguard-react && npm run build
```

## Contribution Guidelines

1. **Keep Code Local-Only**: Ledger enforces a strict zero-telemetry policy. Do not introduce network calls to third-party tracking, analytics, or remote logging services.
2. **Preserve Isolation**: Any changes to Docker mounting, process execution, or file handling must strictly preserve workspace isolation and path restrictions.
3. **No Breaking Changes to Core Commands**: Maintain backwards compatibility for CLI commands and MCP tool signatures.
4. **Code Quality**: Write clean, modern, well-documented JavaScript/Node.js code. Do not introduce heavy dependencies unnecessarily.
