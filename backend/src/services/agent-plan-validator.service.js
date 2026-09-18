const MAX_ACTIONS = 8;
const MAX_ARGUMENTS = 32;
const MAX_ARGUMENT_LENGTH = 4096;
const MAX_PLAN_LENGTH = 32768;

const FORBIDDEN_COMMAND_PATTERNS = [
  /(?:^|[\s/])docker(?:\s|$)/i,
  /docker\.sock/i,
  /(?:^|[\s])(?:sudo|su)(?:\s|$)/i,
  /(?:^|[\s])(?:powershell|pwsh|cmd(?:\.exe)?)(?:\s|$)/i,
  /(?:^|[\s])child_process(?:\s|$)/i,
  /(?:^|[\s/])(?:proc|sys)(?:[\s/]|$)/i,
  /(?:^|[\s/])etc[\s/]shadow(?:[\s]|$)/i,
  /(?:^|[\s/])root(?:[\s/]|$)/i,
  /(?:^|[\s/])agentguard(?:[\s/]|$)/i,
  /[A-Z]:[\\/]/i,
  /(?:^|[\s])(?:--privileged|--cap-add|--volume|-v)(?:\s|$)/i,
];

function validateCommandSafety(command) {
  const commandText = command.join(" ");
  if (FORBIDDEN_COMMAND_PATTERNS.some((pattern) => pattern.test(commandText))) {
    throw new Error("Execute action contains a forbidden host or infrastructure operation.");
  }
}

function validateAction(action) {
  if (!action || typeof action !== "object" || action.type !== "execute") {
    throw new Error("Decision contains an unsupported action type.");
  }

  if (!Array.isArray(action.command) || action.command.length === 0 || action.command.length > MAX_ARGUMENTS) {
    throw new Error("Execute actions must contain a bounded argv array.");
  }

  if (action.command.some((argument) => typeof argument !== "string" || argument.length > MAX_ARGUMENT_LENGTH)) {
    throw new Error("Execute action argv values must be bounded strings.");
  }

  validateCommandSafety(action.command);

  return {
    type: "execute",
    command: [...action.command],
  };
}

function validatePlan(rawPlan) {
  if (typeof rawPlan !== "string" || rawPlan.length === 0 || rawPlan.length > MAX_PLAN_LENGTH) {
    throw new Error("Provider output must be a non-empty JSON plan within the size limit.");
  }

  let plan;
  try {
    plan = JSON.parse(rawPlan);
  } catch (error) {
    throw new Error("Provider output was not valid JSON.");
  }

  if (!plan || typeof plan !== "object" || Array.isArray(plan) || !Array.isArray(plan.actions)) {
    throw new Error("Plan must contain an actions array.");
  }

  if (plan.actions.length === 0 || plan.actions.length > MAX_ACTIONS) {
    throw new Error(`Plan must contain between 1 and ${MAX_ACTIONS} actions.`);
  }

  const actions = plan.actions.map(validateAction);

  return { actions };
}

function validateDecision(rawDecision) {
  if (typeof rawDecision !== "string" || rawDecision.length === 0 || rawDecision.length > MAX_PLAN_LENGTH) {
    throw new Error("Provider decision must be a bounded JSON object.");
  }

  let decision;
  try {
    decision = JSON.parse(rawDecision);
  } catch (error) {
    throw new Error("Provider decision was not valid JSON.");
  }

  if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
    throw new Error("Provider decision must be an object.");
  }

  if (!["continue", "completed"].includes(decision.status)) {
    throw new Error("Provider decision has an unsupported status.");
  }

  if (typeof decision.reason !== "undefined" && (typeof decision.reason !== "string" || decision.reason.length > 2048)) {
    throw new Error("Provider decision reason is invalid.");
  }

  if (decision.status === "completed") {
    if (Object.prototype.hasOwnProperty.call(decision, "action")) {
      throw new Error("Completed decisions must not include an action.");
    }
    return { status: "completed", reason: decision.reason || "" };
  }

  if (!Object.prototype.hasOwnProperty.call(decision, "action")) {
    throw new Error("Continue decisions must include an action.");
  }

  return {
    status: "continue",
    reason: decision.reason || "",
    action: validateAction(decision.action),
  };
}

module.exports = {
  validateAction,
  validateDecision,
  validatePlan,
};
