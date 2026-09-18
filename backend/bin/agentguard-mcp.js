#!/usr/bin/env node
/**
 * AgentGuard MCP Gateway — CLI Entrypoint
 *
 * Usage:
 *   agentguard-mcp
 *   AGENTGUARD_SESSION_ID=<id> agentguard-mcp
 *   AGENTGUARD_API_URL=http://localhost:5000 agentguard-mcp
 *
 * This starts the AgentGuard MCP STDIO server. Connect it to any
 * MCP-compatible AI agent as an external process tool server.
 *
 * Environment Variables:
 *   AGENTGUARD_SESSION_ID   Optional. Pin to a specific session.
 *                            If omitted, the active sandbox session is used.
 *   AGENTGUARD_API_URL      Optional. Backend URL (default: http://localhost:5000)
 */

const path = require("path");

// Ensure we can resolve sibling modules from the backend src tree
const SRC_DIR = path.resolve(__dirname, "../src");
// Provide a require override so server.js can find its own ./tools etc.
process.env.AGENTGUARD_SRC_DIR = SRC_DIR;

const { startServer } = require("../src/mcp/server");

startServer();
