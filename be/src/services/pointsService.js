const UserStats = require("../models/UserStats");
const mongoose = require("mongoose");
const { evaluateBadges } = require("./badgeService");

const XP_PER_LEVEL = 100;

/* =========================
   DATE HELPERS
========================= */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(lastDate, today) {
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return isSameDay(lastDate, y);
}

/* =========================
   COMPLETE TASK → AWARD
========================= */
async function awardUserPoints(task, userId) {
  if (!task || !userId || task.pointsAwarded) {
    return { points: 0, awarded: [], stats: null };
  }

  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const today = new Date(now);
  const deadline = task.dueDate ? new Date(task.dueDate) : null;

  let stats = await UserStats.findOne({ userId: uid });

  /* ===== INIT STATS ===== */
  if (!stats) {
    stats = await UserStats.create({
      userId: uid,
      points: 0,
      level: 1,
      streakDays: 0,
      bestStreak: 0,
      lastActiveDate: null,
      tasksCompleted: 0,
    });
  }

  /* ===== POINT LOGIC ===== */
  let points = 0;
  if (deadline && now > deadline) {
    points = -4;
  } else {
    points = task.points || 2;
  }

  /* ===== STREAK LOGIC (PER DAY) ===== */
  if (points > 0) {
    if (!stats.lastActiveDate) {
      stats.streakDays = 1;
    } else if (isSameDay(stats.lastActiveDate, today)) {
      // same day → do nothing
    } else if (isYesterday(stats.lastActiveDate, today)) {
      stats.streakDays += 1;
    } else {
      stats.streakDays = 1;
    }

    stats.bestStreak = Math.max(stats.bestStreak, stats.streakDays);
    stats.lastActiveDate = today;
  }

  /* ===== UPDATE STATS ===== */
  stats.points = Math.max(0, stats.points + points);
  if (points > 0) stats.tasksCompleted += 1;

  stats.level = Math.floor(stats.points / XP_PER_LEVEL) + 1;
  await stats.save();

  /* ===== BADGES (GENERIC) ===== */
  const awarded = await evaluateBadges({
    userId: uid,
    stats,
    rank: null, // leaderboard gắn sau
  });

  /* ===== SAVE TASK (FOR UNDO) ===== */
  task.completedAt = now;
  task.pointsAwarded = true;
  task.awardedPoints = points;
  await task.save();

  return { points, stats, awarded };
}

/* =========================
   UNDO COMPLETE TASK
========================= */
async function undoUserPoints(task, userId) {
  if (!task || !userId || !task.pointsAwarded) {
    return { points: 0, stats: null };
  }

  const uid = new mongoose.Types.ObjectId(userId);
  const stats = await UserStats.findOne({ userId: uid });
  if (!stats) return { points: 0, stats: null };

  const rollback = task.awardedPoints || 0;

  stats.points = Math.max(0, stats.points - rollback);
  if (rollback > 0) {
    stats.tasksCompleted = Math.max(0, stats.tasksCompleted - 1);
  }

  stats.level = Math.floor(stats.points / XP_PER_LEVEL) + 1;
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
