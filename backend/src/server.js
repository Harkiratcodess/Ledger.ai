require("dotenv").config();

const app = require("./app");
const { testDocker } = require("./services/docker.service");
const { watchProject } = require("./services/file-watcher.service");

const PORT = process.env.PORT || 5000;
const projectPath = `${process.cwd()}/sandbox-test`;

app.listen(PORT, async () => {
  console.log(`AgentGuard backend running on http://localhost:${PORT}`);

  try {
    await testDocker();
  } catch (error) {
    console.error("Docker connection failed:", error.message);
  }

  watchProject(projectPath);
});