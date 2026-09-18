const crypto = require("crypto");
const { PassThrough } = require("stream");

async function executeSandboxCommand(container, command) {
  const exec = await container.exec({
    Cmd: command,
    AttachStdout: true,
    AttachStderr: true,
  });
  const stdoutStream = new PassThrough();
  const stderrStream = new PassThrough();
  const stdout = [];
  const stderr = [];

  stdoutStream.on("data", (chunk) => stdout.push(chunk));
  stderrStream.on("data", (chunk) => stderr.push(chunk));

  const stream = await exec.start({ hijack: true, stdin: false });
  const streamEnded = new Promise((resolve, reject) => {
    stream.once("end", resolve);
    stream.once("error", reject);
  });

  container.modem.demuxStream(stream, stdoutStream, stderrStream);
  await streamEnded;

  const result = await exec.inspect();
  return {
    exitCode: result.ExitCode,
    stdout: Buffer.concat(stdout).toString("utf8"),
    stderr: Buffer.concat(stderr).toString("utf8"),
  };
}

async function inspectRunningContainer(container) {
  try {
    const inspection = await container.inspect();
    if (inspection.State?.Paused) {
      return { ok: false, status: "interrupted", reason: "Sandbox is paused." };
    }
    if (!inspection.State?.Running) {
      return { ok: false, status: "interrupted", reason: "Sandbox is no longer running." };
    }
    return { ok: true };
  } catch (error) {
    if (error.statusCode === 404) {
      return { ok: false, status: "interrupted", reason: "Sandbox no longer exists." };
    }
    throw error;
  }
}

async function executeAgentPlan(container, plan) {
  const executions = [];
  const actions = [];
  let status = "completed";

  for (let index = 0; index < plan.actions.length; index += 1) {
    const availability = await inspectRunningContainer(container);
    if (!availability.ok) {
      status = "interrupted";
      actions.push({ index, status: "blocked", reason: availability.reason });
      break;
    }

    const action = plan.actions[index];
    const startedAt = new Date();
    const result = await executeSandboxCommand(container, action.command);
    const execution = {
      executionId: crypto.randomUUID(),
      command: action.command,
      ...result,
      startedAt,
      finishedAt: new Date(),
    };
    executions.push(execution);
    actions.push({
      index,
      status: result.exitCode === 0 ? "completed" : "failed",
      executionId: execution.executionId,
      exitCode: result.exitCode,
    });

    if (result.exitCode !== 0) {
      status = "failed";
      break;
    }
  }

  return { status, actions, executions };
}

module.exports = {
  executeAgentPlan,
  executeSandboxCommand,
  inspectRunningContainer,
};