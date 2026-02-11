const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    streakDays: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },

    lastActiveDate: { type: Date, default: null }, // ⭐ QUAN TRỌNG
    tasksCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStats", UserStatsSchema);
