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