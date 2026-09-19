/**
 * Ledger MCP Gateway Server
 *
 * Implements the MCP (Model Context Protocol) JSON-RPC 2.0 wire protocol
 * over STDIO transport. Exposes protected tools that route through the
 * Ledger backend REST API and existing Docker sandbox runtime.
 *
 * NO AI logic, NO risk engine logic, NO duplicate enforcement.
 * The existing Ledger backend remains the source of truth.
 */

const {
  protectedExecute,
  protectedReadFile,
  protectedWriteFile,
  protectedNetworkRequest,
  requireSession,
} = require("./tools");

const API_URL = process.env.AGENTGUARD_API_URL || "http://localhost:5000";
const SERVER_NAME = "agentguard-mcp";
const SERVER_VERSION = "0.1.0";

// ── Tool Definitions ──────────────────────────────────────────────────────────

const TOOL_DEFINITIONS = [
  {
    name: "protected_execute",
    description:
      "Execute a shell command inside the Ledger protected Docker sandbox. " +
      "The command runs inside the managed container — NOT on the host. " +
      "Filesystem changes trigger monitoring and risk evaluation. " +
      "If the sandbox is paused due to a HIGH-risk event, this tool returns an error.",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          oneOf: [
            { type: "string", description: "Shell command string (executed via sh -lc)." },
            { type: "array", items: { type: "string" }, description: "Command and arguments array." },
          ],
          description: "Command to execute inside the protected sandbox.",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "protected_read_file",
    description:
      "Read a file from the protected workspace inside the Ledger sandbox. " +
      "Path must be relative (e.g. 'src/main.js'). " +
      "Absolute paths, parent traversal (../), .ssh, .aws, and credential stores are blocked.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path within the protected workspace (e.g. 'src/app.js').",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "protected_write_file",
    description:
      "Write content to a file inside the protected workspace. " +
      "The write goes through the sandbox boundary and triggers the existing " +
      "filesystem watcher and risk engine. " +
      "If the risk engine flags the write as HIGH risk, the sandbox is automatically paused.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path within the protected workspace (e.g. 'output.txt').",
        },
        content: {
          type: "string",
          description: "Text content to write to the file.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "protected_network_request",
    description:
      "Make an HTTP/HTTPS request from inside the Ledger protected sandbox. " +
      "The request routes through the existing mitmproxy interception pipeline. " +
      "Network metadata (hostname, method, status code) is captured and evaluated by the risk engine. " +
      "Response body is NOT returned (metadata-only policy). " +
      "Only operations routed through this tool are protected by Ledger.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target URL (http:// or https:// only).",
        },
        method: {
          type: "string",
          description: "HTTP method (default: GET).",
          enum: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
          default: "GET",
        },
      },
      required: ["url"],
    },
  },
];

// ── JSON-RPC 2.0 MCP Wire Protocol ───────────────────────────────────────────

/**
 * Write a JSON-RPC response to stdout.
 */
function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, result });
  process.stdout.write(msg + "\n");
}

/**
 * Write a JSON-RPC error to stdout.
 */
function sendError(id, code, message, data) {
  const msg = JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data ? { data } : {}) },
  });
  process.stdout.write(msg + "\n");
}

/**
 * Send a server log notification (MCP notifications/message).
 */
function sendLog(level, text) {
  const msg = JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/message",
    params: { level, logger: SERVER_NAME, data: text },
  });
  process.stdout.write(msg + "\n");
}

// ── Request Dispatcher ────────────────────────────────────────────────────────

async function handleRequest(req) {
  const { id, method, params } = req;

  // ── initialize ──
  if (method === "initialize") {
    sendResponse(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
    });
    return;
  }

  // ── initialized (notification, no response) ──
  if (method === "notifications/initialized") {
    return;
  }

  // ── tools/list ──
  if (method === "tools/list") {
    sendResponse(id, { tools: TOOL_DEFINITIONS });
    return;
  }

  // ── tools/call ──
  if (method === "tools/call") {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    sendLog("info", `Ledger MCP: tool call '${toolName}'`);

    try {
      let result;
      switch (toolName) {
        case "protected_execute":
          result = await protectedExecute(API_URL, toolArgs);
          break;
        case "protected_read_file":
          result = await protectedReadFile(API_URL, toolArgs);
          break;
        case "protected_write_file":
          result = await protectedWriteFile(API_URL, toolArgs);
          break;
        case "protected_network_request":
          result = await protectedNetworkRequest(API_URL, toolArgs);
          break;
        default:
          sendResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `Unknown tool: ${toolName}`,
                  source: "agentguard",
                }),
              },
            ],
            isError: true,
          });
          return;
      }

      sendResponse(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: false,
      });
    } catch (err) {
      // Structured error — not a JSON-RPC protocol error, but a tool-level error
      // returned as a successful response with isError: true (MCP spec).
      sendResponse(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: err.message,
              tool: toolName,
              source: "agentguard",
            }),
          },
        ],
        isError: true,
      });
    }
    return;
  }

  // ── ping ──
  if (method === "ping") {
    sendResponse(id, {});
    return;
  }

  // ── Unknown method ──
  sendError(id, -32601, `Method not found: ${method}`);
}

// ── STDIO Transport ───────────────────────────────────────────────────────────

function startServer() {
  process.stderr.write(
    `[Ledger MCP] Gateway starting on STDIO (backend: ${API_URL})\n`
  );

  const sessionId = process.env.AGENTGUARD_SESSION_ID;
  if (sessionId) {
    process.stderr.write(
      `[Ledger MCP] Pinned to session: ${sessionId}\n`
    );
  } else {
    process.stderr.write(
      `[Ledger MCP] No AGENTGUARD_SESSION_ID set — will use active sandbox session.\n`
    );
  }

  // Verify backend connectivity at startup (non-blocking)
  requireSession(API_URL)
    .then(({ sessionId: sid }) => {
      process.stderr.write(`[Ledger MCP] Connected to session: ${sid}\n`);
    })
    .catch((err) => {
      process.stderr.write(`[Ledger MCP] Warning: ${err.message}\n`);
    });

  let buffer = "";

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    // Process complete newline-delimited JSON messages
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep the incomplete last line
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let req;
      try {
        req = JSON.parse(trimmed);
      } catch (err) {
        sendError(null, -32700, "Parse error: invalid JSON");
        continue;
      }
      handleRequest(req).catch((err) => {
        process.stderr.write(`[Ledger MCP] Unhandled error: ${err.message}\n`);
        sendError(req?.id ?? null, -32603, "Internal error", err.message);
      });
    }
  });

  process.stdin.on("end", () => {
    process.stderr.write("[Ledger MCP] Client disconnected. Gateway exiting.\n");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    process.stderr.write("[Ledger MCP] Received SIGINT. Exiting.\n");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    process.stderr.write("[Ledger MCP] Received SIGTERM. Exiting.\n");
    process.exit(0);
  });
}

module.exports = { startServer, TOOL_DEFINITIONS };

if (require.main === module) {
  startServer();
}
