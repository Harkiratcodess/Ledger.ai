/** Centralized mock audit sessions. Replace with Express API later. */
export const MOCK_SESSIONS = [
  {
    id: "AG-2026-001",
    project: "demo-project",
    projectPath: "/workspace/demo-project",
    status: "ACTIVE",
    events: 128,
    started: "10:38",
    startedFull: "10:38:12.104",
    duration: "00:04:19",
    container: "agentguard-sandbox-01",
    branch: "main",
  },
  {
    id: "AG-2026-002",
    project: "api-service",
    projectPath: "/workspace/api-service",
    status: "STOPPED",
    events: 94,
    started: "09:12",
    startedFull: "09:12:04.881",
    duration: "00:31:08",
    container: "agentguard-sandbox-02",
    branch: "develop",
  },
  {
    id: "AG-2026-003",
    project: "test-agent",
    projectPath: "/workspace/test-agent",
    status: "COMPLETE",
    events: 61,
    started: "08:42",
    startedFull: "08:42:55.012",
    duration: "00:18:44",
    container: "agentguard-sandbox-03",
    branch: "main",
  },
];

export function getSessionById(id) {
  return MOCK_SESSIONS.find((s) => s.id === id) || null;
}
