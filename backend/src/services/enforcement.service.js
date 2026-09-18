const ACTIVE_SANDBOX_CONTAINERS = new Map();
let ACTIVE_SANDBOX_CONTAINER_ID = null;

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

  ACTIVE_SANDBOX_CONTAINER_ID = container.id;
  container.__agentguardTracked = true;

  return container;
}

function setActiveSandboxContainer(container) {
  if (!container || !container.id || !ACTIVE_SANDBOX_CONTAINERS.has(container.id)) {
    return null;
  }

  ACTIVE_SANDBOX_CONTAINER_ID = container.id;
  return container;
}

function getActiveSandboxContainer() {
  if (ACTIVE_SANDBOX_CONTAINER_ID && ACTIVE_SANDBOX_CONTAINERS.has(ACTIVE_SANDBOX_CONTAINER_ID)) {
    return ACTIVE_SANDBOX_CONTAINERS.get(ACTIVE_SANDBOX_CONTAINER_ID).container;
  }

  const firstEntry = ACTIVE_SANDBOX_CONTAINERS.values().next().value;
  if (firstEntry) {
    ACTIVE_SANDBOX_CONTAINER_ID = firstEntry.container.id;
    return firstEntry.container;
  }

  return null;
}

function getActiveSandboxMetadata() {
  const container = getActiveSandboxContainer();
  return container ? ACTIVE_SANDBOX_CONTAINERS.get(container.id) || null : null;
}

function getTrackedSandboxContainer(containerId) {
  return ACTIVE_SANDBOX_CONTAINERS.get(containerId)?.container || null;
}

function getTrackedSandboxMetadata(containerId) {
  return ACTIVE_SANDBOX_CONTAINERS.get(containerId) || null;
}

function getActiveSandboxContext() {
  const container = getActiveSandboxContainer();
  if (!container) {
    return null;
  }

  return {
    container,
    metadata: ACTIVE_SANDBOX_CONTAINERS.get(container.id) || null,
  };
}

async function getValidActiveSandboxContext() {
  const context = getActiveSandboxContext();
  if (!context) {
    return null;
  }

  try {
    await context.container.inspect();
    return context;
  } catch (error) {
    if (error.statusCode === 404) {
      clearSandboxContainer(context.container);
      return null;
    }
    throw error;
  }
}

function isTrackedSandboxContainer(container) {
  return Boolean(container && container.id && ACTIVE_SANDBOX_CONTAINERS.has(container.id));
}

function clearSandboxContainer(container) {
  if (!container || !container.id) {
    return false;
  }

  const wasActive = ACTIVE_SANDBOX_CONTAINER_ID === container.id;
  const deleted = ACTIVE_SANDBOX_CONTAINERS.delete(container.id);

  if (wasActive) {
    ACTIVE_SANDBOX_CONTAINER_ID = null;
  }

  return deleted;
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

async function resumeSandbox(container) {
  if (!isTrackedSandboxContainer(container)) {
    throw new Error("Resume denied: container is not tracked by AgentGuard.");
  }

  const trackedContainer = ACTIVE_SANDBOX_CONTAINERS.get(container.id)?.container || container;
  const inspection = await trackedContainer.inspect();

  if (inspection?.State?.Running === false) {
    return {
      action: "resume",
      status: "already_stopped",
      timestamp: new Date(),
      containerId: trackedContainer.id,
    };
  }

  if (inspection?.State?.Paused === false) {
    return {
      action: "resume",
      status: "already_running",
      timestamp: new Date(),
      containerId: trackedContainer.id,
    };
  }

  await trackedContainer.unpause();

  return {
    action: "resume",
    status: "resumed",
    timestamp: new Date(),
    containerId: trackedContainer.id,
  };
}

async function killSandbox(container) {
  if (!container || !container.id) {
    throw new Error("Kill denied: no sandbox container provided.");
  }

  if (!isTrackedSandboxContainer(container)) {
    throw new Error("Kill denied: container is not tracked by AgentGuard.");
  }

  const activeSandbox = getActiveSandboxContainer();
  if (activeSandbox && activeSandbox.id !== container.id) {
    throw new Error("Kill denied: container does not belong to the active AgentGuard sandbox.");
  }

  const trackedContainer = ACTIVE_SANDBOX_CONTAINERS.get(container.id)?.container || container;
  let beforeKill;

  try {
    beforeKill = await trackedContainer.inspect();
  } catch (error) {
    if (error.statusCode === 404) {
      clearSandboxContainer(trackedContainer);
      return {
        action: "kill",
        status: "already_stopped",
        timestamp: new Date(),
        containerId: trackedContainer.id,
      };
    }

    throw error;
  }

  if (beforeKill?.State?.Running === false) {
    clearSandboxContainer(trackedContainer);
    return {
      action: "kill",
      status: "already_stopped",
      timestamp: new Date(),
      containerId: trackedContainer.id,
    };
  }

  await trackedContainer.kill();

  let afterKill;
  try {
    afterKill = await trackedContainer.inspect();
  } catch (error) {
    if (error.statusCode === 404) {
      clearSandboxContainer(trackedContainer);
      return {
        action: "kill",
        status: "terminated",
        timestamp: new Date(),
        containerId: trackedContainer.id,
      };
    }

    throw error;
  }

  clearSandboxContainer(trackedContainer);

  return {
    action: "kill",
    status: afterKill?.State?.Running === false ? "terminated" : "kill_failed",
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

  if (riskAssessment.riskLevel === "CRITICAL") {
    const sandboxContainer = context.container || getActiveSandboxContainer();

    if (sandboxContainer && isTrackedSandboxContainer(sandboxContainer)) {
      const killResult = await killSandbox(sandboxContainer);

      return {
        ...safeEvent,
        enforcementAction: killResult.action,
        enforcementStatus: killResult.status,
        enforcementTimestamp: killResult.timestamp,
      };
    }

    return {
      ...safeEvent,
      enforcementAction: "kill",
      enforcementStatus: "not_applicable",
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
  clearSandboxContainer,
  getActiveSandboxContainer,
  getActiveSandboxContext,
  getActiveSandboxMetadata,
  getValidActiveSandboxContext,
  getTrackedSandboxContainer,
  getTrackedSandboxMetadata,
  isTrackedSandboxContainer,
  killSandbox,
  pauseSandbox,
  registerSandboxContainer,
  resumeSandbox,
  setActiveSandboxContainer,
};
