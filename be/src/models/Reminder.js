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
    methods: {
      type: [String],
      enum: ["browser", "email"],
      default: ["browser"],
    },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reminder", ReminderSchema);
