const UserStats = require("../models/UserStats");

const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      stats = await UserStats.create({
        userId,
        points: 0,
        level: 1,
        streakDays: 0,
        tasksCompleted: 0,
      });
    }

    res.json(stats);
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { getStats };
