const UserStats = require("../models/UserStats");

const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    let stats = await UserStats.findOne({ userId }).lean();
    if (!stats) {
      stats = { userId, points: 0, level: 1, streakDays: 0, tasksCompleted: 0 };
    }

    res.status(200).json(stats);
  } catch (err) {
    console.error("Error getting stats:", err);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};

module.exports = { getStats };
