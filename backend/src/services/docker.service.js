const Docker = require("dockerode");
const { registerSandboxContainer } = require("./enforcement.service");
const { validateWorkspacePath } = require("../utils/workspace-validator");

const docker = new Docker();

async function testDocker() {
  const info = await docker.info();

  console.log("Docker connected successfully");
  console.log(`Docker version: ${info.ServerVersion}`);
}

async function createSandbox(projectPath, options = {}) {
  const validatedPath = validateWorkspacePath(projectPath);

  const command = options.command || ["sleep", "600"];
  const env = options.env || [
    "HTTP_PROXY=http://host.docker.internal:8080",
    "HTTPS_PROXY=http://host.docker.internal:8080",
    "http_proxy=http://host.docker.internal:8080",
    "https_proxy=http://host.docker.internal:8080",
  ];

  const container = await docker.createContainer({
    Image: "node:20-slim",
    Cmd: command,
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