const DEFAULT_NETWORK_BASELINE = new Set([
  "example.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "host.docker.internal",
]);

const SENSITIVE_PATH_PATTERNS = [
  /(^|[\\/])\.ssh([\\/]|$)/i,
  /(^|[\\/])\.env$/i,
  /(^|[\\/])\.aws[\\/](credentials|config)$/i,
  /keychain/i,
  /credentials?/i,
  /token/i,
  /secret/i,
];

function normalizeHostname(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.hostname.toLowerCase();
  } catch (error) {
    return String(value).toLowerCase().replace(/^https?:\/\//, "").split(":")[0].split("/")[0];
  }
}

function looksInsideWorkspace(path) {
  if (!path) {
    return false;
  }

  const normalized = String(path).replace(/\\/g, "/");
  return (
    normalized.includes("/workspace/") ||
    normalized.includes("\\workspace\\") ||
    normalized.includes("/sandbox-test/") ||
    normalized.includes("\\sandbox-test\\") ||
    normalized.includes("workspace")
  );
}

function detectOllamaUsage(event) {
  const urlText = `${event?.url || ""} ${event?.hostname || ""}`.toLowerCase();
  return /ollama|localhost:11434|127\.0\.0\.1:11434|0\.0\.0\.0:11434/.test(urlText);
}

function evaluateEvent(event = {}) {
  const type = String(event.type || "").toLowerCase();

  if (type === "network") {
    const hostname = normalizeHostname(event.hostname || event.url || "");
    const destination = hostname || normalizeHostname(event.url || "");
    const url = String(event.url || "");

    if (detectOllamaUsage(event)) {
      return {
        riskLevel: "MEDIUM",
        riskScore: 60,
        reason: "Local Ollama usage detected from network metadata.",
      };
    }

    if (destination && !DEFAULT_NETWORK_BASELINE.has(destination)) {
      return {
        riskLevel: "MEDIUM",
        riskScore: 55,
        reason: `Unexpected network destination outside the allowlist: ${destination}`,
      };
    }

    if (destination && DEFAULT_NETWORK_BASELINE.has(destination)) {
      return {
        riskLevel: "LOW",
        riskScore: 10,
        reason: `Destination ${destination} matches the known baseline allowlist.`,
      };
    }

    return {
      riskLevel: "LOW",
      riskScore: 0,
      reason: "No unexpected network destination detected.",
    };
  }

  if (type === "filesystem") {
    const rawPath = String(event.path || "");
    const lowerPath = rawPath.toLowerCase();
    const sensitivePathMatch = SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(lowerPath));
    const outsideWorkspace = rawPath && !looksInsideWorkspace(rawPath);

    if (sensitivePathMatch) {
      return {
        riskLevel: "HIGH",
        riskScore: 95,
        reason: `Sensitive credential path accessed: ${rawPath}`,
      };
    }

    if (outsideWorkspace) {
      return {
        riskLevel: "HIGH",
        riskScore: 85,
        reason: `Filesystem write outside the mounted workspace: ${rawPath}`,
      };
    }

    return {
      riskLevel: "LOW",
      riskScore: 5,
      reason: "Filesystem activity remains within the managed workspace.",
    };
  }

  return {
    riskLevel: "LOW",
    riskScore: 0,
    reason: "No additional risk indicators detected for this event type.",
  };
}

module.exports = {
  DEFAULT_NETWORK_BASELINE,
  evaluateEvent,
  normalizeHostname,
  looksInsideWorkspace,
};
