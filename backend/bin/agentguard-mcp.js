#!/usr/bin/env node
/**
 * Ledger MCP Gateway — CLI Entrypoint
 *
 * Usage:
 *   ledger mcp
 *   ledger-mcp
 *   agentguard-mcp
 *
 * Starts the MCP STDIO server. Connect it to any MCP-compatible AI agent.
 *
 * Environment Variables:
 *   AGENTGUARD_SESSION_ID   Optional. Pin to a specific session.
 *   AGENTGUARD_API_URL      Optional. Backend URL (default: http://localhost:5000)
 */

const path = require("path");

process.env.AGENTGUARD_SRC_DIR = path.resolve(__dirname, "../src");

const { startServer } = require("../src/mcp/server");

startServer();
