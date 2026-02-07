const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // 🔥 Đổi sang ObjectId
      ref: "User",
      required: true,
    },
    notifyTime: { type: Date, required: true },
    method: {
      type: String,
      enum: ["email", "browser"],
      default: "browser",
    },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", ReminderSchema);
