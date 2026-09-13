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