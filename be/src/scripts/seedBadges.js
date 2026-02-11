const mongoose = require("mongoose");
const Badge = require("../models/Badge");
require("dotenv").config();

async function seedBadges() {
  await mongoose.connect(process.env.MONGO_URI);

  await Badge.deleteMany();

  await Badge.insertMany([
    // ================= TASK =================
    {
      key: "tasks_1",
      name: "First Task",
      description: "Complete your first task",
      condition: { type: "tasks", value: 1 },
      icon: "🏆",
    },
    {
      key: "tasks_10",
      name: "Task Crusher",
      description: "Complete 10 tasks",
      condition: { type: "tasks", value: 10 },
      icon: "🥊",
    },
    {
      key: "tasks_50",
      name: "Task Machine",
      description: "Complete 50 tasks",
      condition: { type: "tasks", value: 50 },
      icon: "⚙️",
    },

    // ================= STREAK =================
    {
      key: "streak_3",
      name: "Getting Started",
      description: "Maintain a 3-day streak",
      condition: { type: "streak", value: 3 },
      icon: "✨",
    },
    {
      key: "streak_7",
      name: "Week Warrior",
      description: "Complete tasks 7 days in a row",
      condition: { type: "streak", value: 7 },
      icon: "🔥",
    },
    {
      key: "streak_30",
      name: "Unstoppable",
      description: "Maintain a 30-day streak",
      condition: { type: "streak", value: 30 },
      icon: "🧠",
    },

    // ================= ON TIME =================
    {
      key: "on_time_5",
      name: "Early Bird",
      description: "Complete 5 tasks before deadline",
      condition: { type: "onTime", value: 5 },
      icon: "🐦",
    },
    {
      key: "on_time_10",
      name: "Perfectionist",
      description: "Complete 10 tasks early",
      condition: { type: "onTime", value: 10 },
      icon: "🎯",
    },

    // ================= DAILY =================
    {
      key: "daily_3",
      name: "Quick Finisher",
      description: "Complete 3 tasks in one day",
      condition: { type: "dailyTasks", value: 3 },
      icon: "⚡",
    },
    {
      key: "daily_5",
      name: "Speed Demon",
      description: "Complete 5 tasks in one day",
      condition: { type: "dailyTasks", value: 5 },
      icon: "🚀",
    },

    // ================= LEVEL =================
    {
      key: "level_3",
      name: "Rising Star",
      description: "Reach Level 3",
      condition: { type: "level", value: 3 },
      icon: "⭐",
    },
    {
      key: "level_5",
      name: "Diamond Level",
      description: "Reach Level 5",
      condition: { type: "level", value: 5 },
      icon: "💎",
    },
    {
      key: "level_10",
      name: "Legend",
      description: "Reach Level 10",
      condition: { type: "level", value: 10 },
      icon: "👑",
    },

    // ================= LEADERBOARD =================
    {
      key: "rank_1",
      name: "Productivity King",
      description: "Top of the leaderboard",
      condition: { type: "rank", value: 1 },
      icon: "👑",
    },
    {
      key: "rank_10",
      name: "Top Performer",
      description: "Reach top 10 leaderboard",
      condition: { type: "rank", value: 10 },
      icon: "🏅",
    },
  ]);

  console.log("✅ Badges seeded (extended)");
  process.exit();
}

seedBadges();
