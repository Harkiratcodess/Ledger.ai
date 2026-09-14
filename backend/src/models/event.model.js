const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    action: {
      type: String,
    },

    path: {
      type: String,
    },

    hostname: {
      type: String,
    },

    method: {
      type: String,
    },

    url: {
      type: String,
    },

    statusCode: {
      type: Number,
    },

    riskLevel: {
      type: String,
      default: "LOW",
    },

    riskScore: {
      type: Number,
      default: 0,
    },

    riskReason: {
      type: String,
      default: "No risk indicators detected.",
    },

    enforcementAction: {
      type: String,
      default: "allow",
    },

    enforcementStatus: {
      type: String,
      default: "not_required",
    },

    enforcementTimestamp: {
      type: Date,
    },

    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Event", eventSchema);