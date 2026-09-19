require("dotenv").config();

const app = require("./app");
const { testDocker } = require("./services/docker.service");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Ledger runtime listening on http://localhost:${PORT}`);
  await connectDatabase();

  try {
    await testDocker();
  } catch (error) {
    console.error("Docker is not running.");
    console.error("Start Docker Desktop and retry.");
  }
});