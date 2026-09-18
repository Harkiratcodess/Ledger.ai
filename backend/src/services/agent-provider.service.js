const DEFAULT_PROVIDER = "openai";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const REQUEST_TIMEOUT_MS = 15000;
const MAX_CONTEXT_LENGTH = 12000;
const MAX_RETRIES = 2;

const SYSTEM_PROMPT = "You are the AgentGuard planning component. Return only JSON matching {status: continue|completed, action?: {type: execute, command: string[]}, reason: string}. Commands run only inside the AgentGuard Docker sandbox under /workspace. You cannot access the host, Docker, AgentGuard source, credentials, environment secrets, or request/response bodies. Use observations to choose one safe next action and stop when the goal is verified.";

function createMockDecision(prompt, context = {}) {
  const normalizedPrompt = prompt.trim().toLowerCase();
  const iteration = context.iteration || 0;
  const lastObservation = context.observations?.[context.observations.length - 1];

  if (normalizedPrompt.includes("malformed decision")) {
    return "{\"status\":\"continue\",\"action\":";
  }

  if (normalizedPrompt.includes("loop")) {
    return JSON.stringify({
      status: "continue",
      action: { type: "execute", command: ["node", "-e", "console.log('repeat')"] },
      reason: "Repeating the same action for loop detection validation.",
    });
  }

  if (normalizedPrompt.includes("max iterations")) {
    return JSON.stringify({
      status: "continue",
      action: { type: "execute", command: ["node", "-e", `console.log('bounded ${iteration}')`] },
      reason: "Continue bounded iteration validation.",
    });
  }

  if (normalizedPrompt.includes("enforcement") || normalizedPrompt.includes("pause")) {
    if (iteration === 0) {
      return JSON.stringify({
        status: "continue",
        action: { type: "execute", command: ["node", "-e", "require('fs').writeFileSync('/workspace/.env', 'temporary test marker')"] },
        reason: "Create the controlled enforcement test event.",
      });
    }
    return JSON.stringify({
      status: "continue",
      action: { type: "execute", command: ["node", "-e", "require('fs').writeFileSync('/workspace/should-not-run.txt', 'unexpected')"] },
      reason: "This action should be blocked after enforcement.",
    });
  }

  if (normalizedPrompt.includes("fail")) {
    if (iteration === 0) {
      return JSON.stringify({
        status: "continue",
        action: { type: "execute", command: ["node", "-e", "require('fs').mkdirSync('/workspace/observe-demo', { recursive: true })"] },
        reason: "Prepare the workspace.",
      });
    }
    if (iteration === 1) {
      return JSON.stringify({
        status: "continue",
        action: { type: "execute", command: ["node", "-e", "process.stderr.write('intentional failure'); process.exit(7)"] },
        reason: "Run the controlled failure.",
      });
    }
    return JSON.stringify({ status: "completed", reason: "Failure observation received." });
  }

  if (normalizedPrompt.includes("hello.txt") || normalizedPrompt.includes("observe")) {
    if (normalizedPrompt.includes("/workspace/hello.txt")) {
      const commands = [
        ["node", "-e", "require('fs').writeFileSync('/workspace/hello.txt', 'Hello AgentGuard')"],
        ["node", "-e", "if (require('fs').readFileSync('/workspace/hello.txt', 'utf8') !== 'Hello AgentGuard') process.exit(1)"],
      ];
      return iteration < commands.length
        ? JSON.stringify({ status: "continue", action: { type: "execute", command: commands[iteration] }, reason: "Create and verify the requested file." })
        : JSON.stringify({ status: "completed", reason: "The requested file was created and verified." });
    }

    const commands = [
      ["sh", "-lc", "mkdir -p /workspace/demo"],
      ["sh", "-lc", "echo 'Hello AgentGuard' > /workspace/demo/hello.txt"],
      ["sh", "-lc", "cat /workspace/demo/hello.txt"],
    ];
    if (iteration < commands.length) {
      return JSON.stringify({ status: "continue", action: { type: "execute", command: commands[iteration] }, reason: "Continue the observed file workflow." });
    }
    return JSON.stringify({ status: "completed", reason: "The file was created and verified." });
  }

  if (lastObservation?.status === "failed") {
    return JSON.stringify({ status: "completed", reason: "The failure observation was received." });
  }

  return JSON.stringify({ status: "completed", reason: "No further action is required." });
}

function createMockPlan(prompt) {
  const normalizedPrompt = prompt.trim().toLowerCase();

  if (normalizedPrompt.includes("malformed")) {
    return "{\"actions\":";
  }

  if (normalizedPrompt.includes("invalid action") || normalizedPrompt.includes("host_execute")) {
    return JSON.stringify({
      actions: [
        { type: "execute", command: ["node", "-e", "console.log('should not run')"] },
        { type: "host_execute", command: ["echo", "invalid"] },
      ],
    });
  }

  if (normalizedPrompt.includes("malformed action in the middle")) {
    return JSON.stringify({
      actions: [
        { type: "execute", command: ["node", "-e", "console.log('should not run')"] },
        { type: "host_execute", command: ["echo", "invalid"] },
      ],
    });
  }

  if (normalizedPrompt.includes("intentionally fail") || normalizedPrompt.includes("action 2 fail")) {
    return JSON.stringify({
      actions: [
        { type: "execute", command: ["node", "-e", "require('fs').mkdirSync('/workspace/demo', { recursive: true })"] },
        { type: "execute", command: ["node", "-e", "process.stderr.write('intentional failure'); process.exit(7)"] },
        { type: "execute", command: ["node", "-e", "require('fs').writeFileSync('/workspace/demo/should-not-exist.txt', 'unexpected')"] },
      ],
    });
  }

  if (normalizedPrompt.includes("pause") || normalizedPrompt.includes("enforcement interruption")) {
    return JSON.stringify({
      actions: [
        { type: "execute", command: ["node", "-e", "require('fs').writeFileSync('/workspace/.env', 'temporary test marker')"] },
        { type: "execute", command: ["node", "-e", "require('fs').writeFileSync('/workspace/demo/should-not-run.txt', 'unexpected')"] },
      ],
    });
  }

  if (normalizedPrompt.includes("/workspace/demo") || normalizedPrompt.includes("multi-step")) {
    return JSON.stringify({
      actions: [
        { type: "execute", command: ["sh", "-lc", "mkdir -p /workspace/demo"] },
        { type: "execute", command: ["sh", "-lc", "echo 'Hello AgentGuard' > /workspace/demo/hello.txt"] },
        { type: "execute", command: ["sh", "-lc", "cat /workspace/demo/hello.txt"] },
      ],
    });
  }

  if (normalizedPrompt.includes("hello.txt")) {
    return JSON.stringify({
      actions: [
        {
          type: "execute",
          command: [
            "node",
            "-e",
            "require('fs').writeFileSync('/workspace/hello.txt', 'Hello AgentGuard')",
          ],
        },
      ],
    });
  }

  return JSON.stringify({
    actions: [{ type: "execute", command: ["node", "-e", "console.log('AgentGuard mock plan')"] }],
  });
}

function getProviderConfiguration() {
  const provider = String(process.env.LLM_PROVIDER || process.env.AGENTGUARD_LLM_PROVIDER || DEFAULT_PROVIDER).toLowerCase();
  const baseUrl = process.env.LLM_BASE_URL || process.env.AGENTGUARD_LLM_ENDPOINT || (provider === "groq" ? "https://api.groq.com/openai/v1" : DEFAULT_BASE_URL);
  return {
    provider,
    apiKey: process.env.LLM_API_KEY || process.env.AGENTGUARD_LLM_API_KEY,
    model: process.env.LLM_MODEL || process.env.AGENTGUARD_LLM_MODEL || DEFAULT_MODEL,
    baseUrl: baseUrl.replace(/\/$/, ""),
  };
}

function buildContext(prompt, context = {}) {
  const safeContext = {
    goal: String(prompt).slice(0, 4000),
    iteration: context.iteration,
    maxIterations: context.maxIterations,
    sandboxStatus: context.sandboxStatus,
    observations: Array.isArray(context.observations) ? context.observations.slice(-4) : [],
  };
  return JSON.stringify(safeContext).slice(0, MAX_CONTEXT_LENGTH);
}

function providerError(message, code, retryable = false) {
  const error = new Error(message);
  error.code = code;
  error.retryable = retryable;
  return error;
}

async function requestStructuredDecision(prompt, context, configuration) {
  if (!configuration.apiKey) {
    throw providerError("LLM provider is not configured.", "llm_error");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${configuration.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${configuration.apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: configuration.model,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Goal and bounded AgentGuard context:\n${buildContext(prompt, context)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 408 || response.status === 429 || response.status >= 500) {
      throw providerError("LLM provider temporarily unavailable.", "llm_error", true);
    }
    if (!response.ok) throw providerError("LLM provider request failed.", "llm_error");

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw providerError("LLM provider returned no structured decision.", "validation_failed");
    return content;
  } catch (error) {
    if (error.name === "AbortError") throw providerError("LLM provider request timed out.", "llm_timeout");
    throw error.code ? error : providerError("LLM provider request failed.", "llm_error", true);
  } finally {
    clearTimeout(timeout);
  }
}

async function generateDecision(prompt, context = {}) {
  const configuration = getProviderConfiguration();
  console.log(`Agent LLM request provider=${configuration.provider} iteration=${context.iteration ?? 0}`);

  if (configuration.provider === "mock") return createMockDecision(prompt, context);
  if (!["openai", "groq", "http"].includes(configuration.provider)) throw providerError("Unsupported LLM provider.", "llm_error");

  let attempt = 0;
  while (true) {
    try {
      const response = await requestStructuredDecision(prompt, context, configuration);
      console.log(`Agent LLM response received provider=${configuration.provider} iteration=${context.iteration ?? 0}`);
      return response;
    } catch (error) {
      if (!error.retryable || attempt >= MAX_RETRIES) throw error;
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** (attempt - 1))));
    }
  }
}

async function generatePlan(prompt, context = {}) {
  return generateDecision(prompt, context);
}

module.exports = {
  generateDecision,
  generatePlan,
  getProviderConfiguration,
  MAX_CONTEXT_LENGTH,
  MAX_RETRIES,
  REQUEST_TIMEOUT_MS,
};
