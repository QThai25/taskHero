const UserStats = require("../models/UserStats");
const Badge = require("../models/Badge");
const UserBadge = require("../models/UserBadge");
const mongoose = require("mongoose");

/**
 * ✅ COMPLETE TASK → AWARD POINTS
 */
async function awardUserPoints(task, userId) {
  if (!task || !userId) return { points: 0, awarded: [], stats: null };

  const uid = new mongoose.Types.ObjectId(userId);
  // ❌ đã cộng rồi → bỏ qua
  if (task.pointsAwarded) {
    return { points: 0, awarded: [], stats: null };
  }

  const now = new Date();
  const deadline = task.dueDate ? new Date(task.dueDate) : null;

  let stats = await UserStats.findOne({ userId: uid });

  if (!stats) {
    stats = await UserStats.create({
      userId: uid, // ✅ FIX
      points: 0,
      level: 1,
      streakDays: 0,
      tasksCompleted: 0,
      lastCompleted: null,
    });
  }

  let points = 0;

  if (deadline) {
    if (now <= deadline) {
      points = task.points || 2;
      stats.streakDays += 1;
    } else {
      points = -4;
      stats.streakDays = 0;
    }
  } else {
    points = 2;
    stats.streakDays += 1;
  }

  stats.points = Math.max(0, stats.points + points);
  if (points > 0) stats.tasksCompleted += 1;

  stats.level = Math.floor(stats.points / 100) + 1;
  stats.lastCompleted = now;

  await stats.save();

  // 🔥 LƯU TASK ĐỂ UNDO
  task.completedAt = now;
  task.pointsAwarded = true;
  task.awardedPoints = points;
  await task.save();

  // 🎖️ BADGES
  const awarded = [];

  // 🏅 7-day streak
  if (stats.streakDays >= 7) {
    const badge = await Badge.findOneAndUpdate(
      { name: "7-Day Streak" },
      { name: "7-Day Streak" },
      { upsert: true, new: true },
    );

    const exists = await UserBadge.findOne({
      userId: uid, // ✅ FIX
      badgeId: badge._id,
    });

    if (!exists) {
      await UserBadge.create({ userId: uid, badgeId: badge._id });
      awarded.push(badge.name);
    }
  }

  // 🏅 10 tasks
  if (stats.tasksCompleted >= 10) {
    const badge = await Badge.findOneAndUpdate(
      { name: "10 Tasks" },
      { name: "10 Tasks" },
      { upsert: true, new: true },
    );

    const exists = await UserBadge.findOne({
      userId: uid, // ✅ FIX
      badgeId: badge._id,
    });

    if (!exists) {
      await UserBadge.create({ userId: uid, badgeId: badge._id });
      awarded.push(badge.name);
    }
  }

  return { points, stats, awarded };
}

/**
 * 🔁 UNDO COMPLETE → ROLLBACK POINTS
 */
async function undoUserPoints(task, userId) {
  if (!task || !userId) return { points: 0, stats: null };

  const uid = new mongoose.Types.ObjectId(userId);

  if (!task.pointsAwarded) {
    return { points: 0, stats: null };
  }

  const stats = await UserStats.findOne({ userId: uid });
  if (!stats) return { points: 0, stats: null };

  const rollback = task.awardedPoints || 0;

  stats.points = Math.max(0, stats.points - rollback);

  if (rollback > 0) {
    stats.tasksCompleted = Math.max(0, stats.tasksCompleted - 1);

    // 🔥 chỉ rollback streak nếu undo task mới nhất
    if (
      stats.lastCompleted &&
      task.completedAt &&
      stats.lastCompleted.getTime() === task.completedAt.getTime()
    ) {
      stats.streakDays = Math.max(0, stats.streakDays - 1);
      stats.lastCompleted = null;
    }
  }

  stats.level = Math.floor(stats.points / 100) + 1;
  await stats.save();

  task.completedAt = null;
  task.pointsAwarded = false;
  task.awardedPoints = 0;
  await task.save();

  return { points: -rollback, stats };
}

module.exports = {
  awardUserPoints,
  undoUserPoints,
};
