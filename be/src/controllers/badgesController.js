const UserBadge = require("../models/UserBadge");
const Badge = require("../models/Badge");

const getUserBadges = async (req, res) => {
  try {
    const userId = req.userId; // Use userId from auth middleware
    const userBadges = await UserBadge.find({ userId }).populate("badgeId");
    const badges = userBadges.map((ub) => ({
      id: ub._id,
      id: b.badgeId._id,
      name: ub.badgeId.name,
      awardedAt: ub.awardedAt,
    }));
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserBadges };
