const Badge = require("../models/Badge");
const UserBadge = require("../models/UserBadge");

async function evaluateBadges({ userId, stats, rank }) {
  const badges = await Badge.find();
  const awarded = [];

  for (const badge of badges) {
    const { type, value } = badge.condition;

    let passed = false;

    switch (type) {
      case "tasks":
        passed = stats.tasksCompleted >= value;
        break;

      case "streak":
        passed = stats.streakDays >= value;
        break;

      case "onTime":
        passed = stats.onTimeCompleted >= value;
        break;

      case "level":
        passed = stats.level >= value;
        break;

      case "dailyTasks":
        passed = stats.dailyCompletedCount >= value;
        break;

      case "rank":
        passed = rank === value;
        break;

      default:
        break;
    }

    if (!passed) continue;

    const exists = await UserBadge.findOne({
      userId,
      badgeId: badge._id,
    });

    if (!exists) {
      await UserBadge.create({ userId, badgeId: badge._id });
      awarded.push(badge);
    }
  }

  return awarded;
}

module.exports = { evaluateBadges };
