/**
 * AgentGuard MCP Path Guard
 *
 * Validates file paths used in MCP tool calls to ensure they remain
 * inside the protected /workspace boundary. Blocks traversal attacks,
 * sensitive credential directories, and absolute host paths.
 */

const BLOCKED_PATTERNS = [
  /\.\.(\/|\\|$)/,          // parent traversal
  /^\//,                     // absolute Linux paths (would escape /workspace prefix)
  /^[A-Za-z]:[/\\]/,        // absolute Windows paths
  /(^|[/\\])\.ssh([/\\]|$)/i,
  /(^|[/\\])\.aws([/\\]|$)/i,
  /(^|[/\\])\.docker([/\\]|$)/i,
  /(^|[/\\])\.kube([/\\]|$)/i,
  /(^|[/\\])\.gnupg([/\\]|$)/i,
  /docker\.sock$/i,
];

const BLOCKED_NAMES = [
  "id_rsa",
  "id_ed25519",
  "id_ecdsa",
  "authorized_keys",
  "known_hosts",
  "credentials",
  "docker.sock",
];

/**
 * Normalizes a relative path from the MCP caller into a safe /workspace/<relative> path.
 *
 * @param {string} userPath - Path supplied by MCP caller (must be relative).
 * @returns {string} Safe container path: /workspace/<normalized>
 * @throws {Error} If the path is blocked.
 */
function guardWorkspacePath(userPath) {
  if (!userPath || typeof userPath !== "string" || userPath.trim().length === 0) {
    throw new Error("File path must be a non-empty string.");
  }

  const trimmed = userPath.trim();

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error(
        `Path rejected by AgentGuard security policy. Only relative paths inside the protected workspace are allowed.`
      );
    }
  }

  // Normalize: strip leading ./ or / so "/workspace" prefix applies cleanly, while preserving hidden dotfiles like .env
  const normalized = trimmed
    .replace(/^(\.[/\\])+/, "")
    .replace(/^[/\\]+/, "")
    .replace(/\\/g, "/");     // normalize separators

  if (normalized.length === 0) {
    throw new Error("Path resolves to workspace root. Specify a filename.");
  }

  // Check blocked filenames
  const basename = normalized.split("/").pop().toLowerCase();
  if (BLOCKED_NAMES.includes(basename)) {
    throw new Error(
      `Access to '${basename}' is denied by AgentGuard security policy.`
    );
  }

  return `/workspace/${normalized}`;
}

module.exports = { guardWorkspacePath };
