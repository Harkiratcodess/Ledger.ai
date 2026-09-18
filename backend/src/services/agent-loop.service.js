const DEFAULT_MAX_ITERATIONS = 10;
const MAX_OBSERVATION_LENGTH = 2048;

function getMaxIterations() {
  const configured = Number.parseInt(process.env.AGENTGUARD_MAX_AGENT_ITERATIONS, 10);
  return Number.isInteger(configured) && configured > 0 ? Math.min(configured, 50) : DEFAULT_MAX_ITERATIONS;
}

function limitOutput(value) {
  const text = String(value || "");
  return text.length > MAX_OBSERVATION_LENGTH ? `${text.slice(0, MAX_OBSERVATION_LENGTH)}...[truncated]` : text;
}

function createObservation(execution, action, index, sandboxState) {
  return {
    actionIndex: index,
    status: execution.exitCode === 0 ? "completed" : "failed",
    exitCode: execution.exitCode,
    stdout: limitOutput(execution.stdout),
    stderr: limitOutput(execution.stderr),
    sandboxStatus: sandboxState,
  };
}

function actionKey(action) {
  return JSON.stringify(action.command);
}

async function runAgentLoop({ prompt, container, generateDecision, validateDecision, executeSandboxCommand, inspectRunningContainer }) {
  const maxIterations = getMaxIterations();
  const executions = [];
  const actions = [];
  const observations = [];
  const seenActions = new Set();
  let status = "max_iterations";
  let reason = "Maximum agent iterations reached.";
  let failureCount = 0;
  let decisionCount = 0;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const availability = await inspectRunningContainer(container);
    if (!availability.ok) {
      status = "blocked";
      reason = availability.reason;
      actions.push({ index: iteration, status: "blocked", reason });
      break;
    }

    let rawDecision;
    try {
      rawDecision = await generateDecision(prompt, {
        iteration,
        maxIterations,
        observations,
        sandboxStatus: "running",
      });
      decisionCount += 1;
    } catch (error) {
      status = error.code === "llm_timeout" ? "llm_timeout" : "llm_error";
      reason = error.message;
      break;
    }

    let decision;
    try {
      decision = validateDecision(rawDecision);
    } catch (error) {
      status = "validation_failed";
      reason = error.message;
      break;
    }
    if (decision.status === "completed") {
      status = "completed";
      reason = decision.reason;
      break;
    }

    const key = actionKey(decision.action);
    if (seenActions.has(key)) {
      status = "loop_detected";
      reason = "The provider repeated an action without meaningful progress.";
      actions.push({ index: iteration, status: "loop_detected", reason });
      break;
    }
    seenActions.add(key);

    const startedAt = new Date();
    const result = await executeSandboxCommand(container, decision.action.command);
    console.log(`Agent action execution iteration=${iteration} exitCode=${result.exitCode}`);
    const execution = {
      executionId: require("crypto").randomUUID(),
      iteration,
      command: decision.action.command,
      ...result,
      startedAt,
      finishedAt: new Date(),
    };
    executions.push(execution);
    const afterExecution = await inspectRunningContainer(container);
    const sandboxStatus = afterExecution.ok ? "running" : "paused";
    const observation = createObservation(execution, decision.action, iteration, sandboxStatus);
    observations.push(observation);
    actions.push({
      index: iteration,
      status: result.exitCode === 0 ? "completed" : "failed",
      executionId: execution.executionId,
      exitCode: result.exitCode,
    });

    if (!afterExecution.ok) {
      status = "blocked";
      reason = afterExecution.reason;
      if (iteration + 1 < maxIterations) {
        actions.push({ index: iteration + 1, status: "blocked", reason });
      }
      break;
    }

    if (result.exitCode !== 0) {
      failureCount += 1;
      if (failureCount > 1) {
        status = "failed";
        reason = "Multiple agent actions failed.";
        break;
      }
    }

    if (iteration === maxIterations - 1) {
      status = "max_iterations";
      break;
    }
  }

  return { status, reason, iterations: decisionCount, actions, executions };
}

module.exports = {
  getMaxIterations,
  limitOutput,
  runAgentLoop,
};
