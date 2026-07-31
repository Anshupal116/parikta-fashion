const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "inventory",
        "review",
        "customer",
        "system",
      ],
      default: "system",
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    referenceId: String,

    actionUrl: String,

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);