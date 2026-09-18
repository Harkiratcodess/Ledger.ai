const mongoose = require("mongoose");

const executionSchema = new mongoose.Schema(
  {
    executionId: {
      type: String,
      required: true,
    },

    command: {
      type: [String],
      required: true,
    },

    exitCode: {
      type: Number,
      required: true,
    },

    stdout: {
      type: String,
      default: "",
    },

    stderr: {
      type: String,
      default: "",
    },

    startedAt: {
      type: Date,
      required: true,
    },

    finishedAt: {
      type: Date,
      required: true,
    },

    iteration: {
      type: Number,
    },
  },
  { _id: false }
);

const agentRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true },
    prompt: { type: String, required: true },
    status: { type: String, required: true },
    iterations: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["CREATED", "RUNNING", "PAUSED", "COMPLETED", "FAILED", "KILLED"],
      required: true,
      default: "CREATED",
    },

    containerId: {
      type: String,
    },

    startedAt: {
      type: Date,
    },

    finishedAt: {
      type: Date,
    },

    exitCode: {
      type: Number,
    },

    executions: {
      type: [executionSchema],
      default: [],
    },

    agentRuns: {
      type: [agentRunSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

module.exports = mongoose.model("Session", sessionSchema);