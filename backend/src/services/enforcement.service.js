const ACTIVE_SANDBOX_CONTAINERS = new Map();

function registerSandboxContainer(container, metadata = {}) {
  if (!container || !container.id) {
    return null;
  }

  const normalizedMetadata = {
    ...metadata,
    trackedAt: new Date(),
    createdBy: "agentguard",
  };

  ACTIVE_SANDBOX_CONTAINERS.set(container.id, {
    container,
    ...normalizedMetadata,
  });

  container.__agentguardTracked = true;

  return container;
}

function getActiveSandboxContainer() {
  const firstEntry = ACTIVE_SANDBOX_CONTAINERS.values().next().value;
  return firstEntry ? firstEntry.container : null;
}

function isTrackedSandboxContainer(container) {
  return Boolean(container && container.id && ACTIVE_SANDBOX_CONTAINERS.has(container.id));
}

async function pauseSandbox(container) {
  if (!isTrackedSandboxContainer(container)) {
    throw new Error("Pause denied: container is not tracked by AgentGuard.");
  }

  const trackedContainer = ACTIVE_SANDBOX_CONTAINERS.get(container.id)?.container || container;
  const inspection = await trackedContainer.inspect();

  if (inspection?.State?.Running === false || inspection?.State?.Paused === true) {
    return {
      action: "pause",
      status: "already_paused",
      timestamp: new Date(),
      containerId: trackedContainer.id,
    };
  }

  await trackedContainer.pause();

  return {
    action: "pause",
    status: "paused",
    timestamp: new Date(),
    containerId: trackedContainer.id,
  };
}

async function applyRiskEnforcement(event = {}, riskAssessment = {}, context = {}) {
  const safeEvent = {
    ...event,
    enforcementAction: "allow",
    enforcementStatus: "not_required",
    enforcementTimestamp: new Date(),
  };

  if (!riskAssessment || riskAssessment.riskLevel === "LOW") {
    return safeEvent;
  }

  if (riskAssessment.riskLevel === "MEDIUM") {
    return {
      ...safeEvent,
      enforcementAction: "record",
      enforcementStatus: "logged",
      enforcementTimestamp: new Date(),
    };
  }

  if (riskAssessment.riskLevel === "HIGH") {
    const sandboxContainer = context.container || getActiveSandboxContainer();

    if (sandboxContainer && isTrackedSandboxContainer(sandboxContainer)) {
      const pauseResult = await pauseSandbox(sandboxContainer);

      return {
        ...safeEvent,
        enforcementAction: pauseResult.action,
        enforcementStatus: pauseResult.status,
        enforcementTimestamp: pauseResult.timestamp,
      };
    }

    return {
      ...safeEvent,
      enforcementAction: "pause",
      enforcementStatus: "not_applicable",
      enforcementTimestamp: new Date(),
    };
  }

  return safeEvent;
}

module.exports = {
  ACTIVE_SANDBOX_CONTAINERS,
  applyRiskEnforcement,
  getActiveSandboxContainer,
  isTrackedSandboxContainer,
  pauseSandbox,
  registerSandboxContainer,
};
