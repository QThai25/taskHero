const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, required: true },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastCompleted: { type: Date, default: null },
    tasksCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStats", UserStatsSchema);
