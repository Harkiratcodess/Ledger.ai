const Docker = require("dockerode");

const docker = new Docker();

async function testDocker() {
  const info = await docker.info();

  console.log("Docker connected successfully");
  console.log(`Docker version: ${info.ServerVersion}`);
}

async function createSandbox(projectPath) {
  if (!projectPath) {
    throw new Error("Project path is required");
  }

  const container = await docker.createContainer({
    Image: "node:20-slim",
    Cmd: ["cat", "/workspace/test.txt"],
    Env: [
      "HTTP_PROXY=http://host.docker.internal:8080",
      "HTTPS_PROXY=http://host.docker.internal:8080",
      "http_proxy=http://host.docker.internal:8080",
      "https_proxy=http://host.docker.internal:8080",
    ],
    HostConfig: {
      Binds: [
        `${projectPath}:/workspace`,
      ],
    },
  });

  return container;
}

module.exports = {
  docker,
  testDocker,
  createSandbox,
};