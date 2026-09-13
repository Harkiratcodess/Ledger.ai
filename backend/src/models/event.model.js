const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      required: true,
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