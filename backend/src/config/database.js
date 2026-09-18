const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/agentguard";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB is unavailable.");
    console.error("Configure MONGODB_URI or start MongoDB.");
    process.exit(1);
  }
};

module.exports = connectDatabase;