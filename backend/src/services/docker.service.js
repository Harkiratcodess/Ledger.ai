const Docker = require("dockerode");
const { registerSandboxContainer } = require("./enforcement.service");
const { validateWorkspacePath } = require("../utils/workspace-validator");

const docker = new Docker();

async function testDocker() {
  try {
    const info = await docker.info();
    console.log("Docker connected successfully");
    console.log(`Docker version: ${info.ServerVersion}`);
    return true;
  } catch (error) {
    console.error("Docker is not running.");
    console.error("Start Docker Desktop and retry.");
    return false;
  }
}

async function createSandbox(projectPath, options = {}) {
  const validatedPath = validateWorkspacePath(projectPath);

  const command = options.command || ["sleep", "600"];
  const proxyHost = process.env.AGENTGUARD_PROXY_HOST || "host.docker.internal";
  const proxyPort = process.env.AGENTGUARD_PROXY_PORT || "8080";
  const proxyUrl = `http://${proxyHost}:${proxyPort}`;

  const env = options.env || [
    `HTTP_PROXY=${proxyUrl}`,
    `HTTPS_PROXY=${proxyUrl}`,
    `http_proxy=${proxyUrl}`,
    `https_proxy=${proxyUrl}`,
  ];

  const image = process.env.AGENTGUARD_SANDBOX_IMAGE || "node:20-slim";

  const container = await docker.createContainer({
    Image: image,
    Cmd: command,
    WorkingDir: "/workspace",
    Env: env,
    HostConfig: {
      Binds: [
        `${validatedPath}:/workspace`,
      ],
    },
  });

  registerSandboxContainer(container, {
    projectPath: validatedPath,
    type: "sandbox",
    command: command.join(" "),
    ...(options.sessionId ? { sessionId: options.sessionId } : {}),
  });

  return container;
}

module.exports = {
  docker,
  testDocker,
  createSandbox,
};