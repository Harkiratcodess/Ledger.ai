const Docker = require("dockerode");
const { registerSandboxContainer } = require("./enforcement.service");

const docker = new Docker();

async function testDocker() {
  const info = await docker.info();

  console.log("Docker connected successfully");
  console.log(`Docker version: ${info.ServerVersion}`);
}

async function createSandbox(projectPath, options = {}) {
  if (!projectPath) {
    throw new Error("Project path is required");
  }

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
        `${projectPath}:/workspace`,
      ],
    },
  });

  registerSandboxContainer(container, {
    projectPath,
    type: "sandbox",
    command: command.join(" "),
  });

  return container;
}

module.exports = {
  docker,
  testDocker,
  createSandbox,
};