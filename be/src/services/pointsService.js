const UserStats = require("../models/UserStats");
const Badge = require("../models/Badge");
const UserBadge = require("../models/UserBadge");

async function updateUserPoints(task, userId) {
  if (!task || !userId) return { points: 0 };

  const now = task.completedAt ? new Date(task.completedAt) : new Date();
  const deadline = task.dueDate ? new Date(task.dueDate) : null;

  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = new UserStats({
      userId,
      points: 0,
      level: 1,
      streakDays: 0,
      tasksCompleted: 0,
    });
  }

  // Nếu task đã được tính điểm → bỏ qua
  if (task.pointsAwarded) {
    return { points: 0, stats, awarded: [] };
  }

  // ✅ Logic điểm mới
  let points = 0;

  if (deadline) {
    if (now <= deadline) {
      // hoàn thành đúng hạn → cộng đúng số điểm priority
      points = task.points || 0;
      stats.streakDays += 1;
    } else {
      // trễ hạn → trừ 4 điểm
      points = -4;
      stats.streakDays = 0;
    }
  } else {
    // không có deadline → cộng 2 điểm
    points = 2;
  }

  // ✅ Cộng/trừ điểm cho user
  stats.points += points;
  if (stats.points < 0) stats.points = 0; // không âm
  stats.tasksCompleted += 1;
  stats.level = Math.floor(stats.points / 100) + 1;
  stats.lastCompleted = now;

  await stats.save();

  // ✅ Đánh dấu task đã cộng điểm
  task.pointsAwarded = true;
  await task.save();

  // ✅ Badge logic
  const awarded = [];

  if (stats.streakDays >= 7) {
    const badge = await Badge.findOneAndUpdate(
      { name: "7-Day Streak" },
      { name: "7-Day Streak", condition: "streak >= 7" },
      { upsert: true, new: true }
    );
    const exists = await UserBadge.findOne({ userId, badgeId: badge._id });
    if (!exists) {
      await UserBadge.create({ userId, badgeId: badge._id });
      awarded.push(badge.name);
    }
  }

  if (stats.tasksCompleted >= 10) {
    const badge = await Badge.findOneAndUpdate(
      { name: "10 Tasks" },
      { name: "10 Tasks", condition: "tasks_completed >= 10" },
      { upsert: true, new: true }
    );
    const exists = await UserBadge.findOne({ userId, badgeId: badge._id });
    if (!exists) {
      await UserBadge.create({ userId, badgeId: badge._id });
      awarded.push(badge.name);
    }
  }

  return { points, stats, awarded };
}

module.exports = { updateUserPoints };
