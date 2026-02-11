// controllers/profileController.js
const Task = require("../models/Task");
const User = require("../models/User");
const UserStats = require("../models/UserStats");
const UserBadge = require("../models/UserBadge");

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.userId;

    const tasks = await Task.find({
      userId,
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .select("title completedAt awardedPoints dueDate");

    const activity = tasks.map((t) => ({
      task: t.title,
      points:
        t.awardedPoints > 0 ? `+${t.awardedPoints}` : `${t.awardedPoints}`,
      status:
        t.completedAt && t.dueDate && t.completedAt <= t.dueDate
          ? "Early completion"
          : "Late",
      date: t.completedAt,
    }));

    res.json(activity);
  } catch (err) {
    console.error("getRecentActivity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getLevelProgress = async (req, res) => {
  const XP_PER_LEVEL = 100;

  try {
    const userId = req.userId;
    const stats = await UserStats.findOne({ userId });

    if (!stats) {
      return res.json({
        currentXP: 0,
        nextLevelXP: XP_PER_LEVEL,
        percent: 0,
      });
    }

    const currentXP = stats.points % XP_PER_LEVEL;
    const percent = Math.floor((currentXP / XP_PER_LEVEL) * 100);

    res.json({
      currentXP,
      nextLevelXP: XP_PER_LEVEL,
      percent,
    });
  } catch (err) {
    console.error("getLevelProgress error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/profileController.js
const getRank = async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await UserStats.findOne({ userId });
    if (!stats) return res.json({ topPercent: 100 });

    const totalUsers = await UserStats.countDocuments();
    const higher = await UserStats.countDocuments({
      points: { $gt: stats.points },
    });

    const topPercent = Math.max(
      1,
      Math.ceil(((totalUsers - higher) / totalUsers) * 100),
    );

    res.json({ topPercent });
  } catch (err) {
    console.error("getRank error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const [user, stats, badges] = await Promise.all([
      User.findById(userId).select("name email picture"),
      UserStats.findOne({ userId }),
      UserBadge.find({ userId }).populate("badgeId"),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    const XP_PER_LEVEL = 100;
    const currentXP = stats ? stats.points % XP_PER_LEVEL : 0;

    // recent activity
    const tasks = await Task.find({
      userId,
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(5);

    const recentActivity = tasks.map((t) => ({
      task: t.title,
      points:
        t.awardedPoints > 0 ? `+${t.awardedPoints}` : `${t.awardedPoints}`,
      status: t.completedAt <= t.dueDate ? "Early completion" : "Late",
      date: t.completedAt,
    }));

    // rank
    const totalUsers = await UserStats.countDocuments();
    const higher = await UserStats.countDocuments({
      points: { $gt: stats?.points || 0 },
    });
    const topPercent = Math.max(
      1,
      Math.ceil(((totalUsers - higher) / totalUsers) * 100),
    );

    res.json({
      user,
      stats,
      levelProgress: {
        currentXP,
        nextLevelXP: XP_PER_LEVEL,
        percent: Math.floor((currentXP / XP_PER_LEVEL) * 100),
      },
      badges: badges.map((b) => ({
        _id: b._id,
        awardedAt: b.awardedAt,
        badge: {
          _id: b.badgeId._id,
          name: b.badgeId.name,
          description: b.badgeId.description,
          icon: b.badgeId.icon,
        },
      })),
      recentActivity,
      rank: { topPercent },
    });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/profileController.js
async function updateProfile(req, res) {
  const { name, picture } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (picture) user.picture = picture;

  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
  });
}

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar uploaded" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cloudinary trả về url ở req.file.path
    user.picture = req.file.path;
    await user.save();

    res.json({
      success: true,
      picture: user.picture,
    });
  } catch (err) {
    console.error("updateAvatar error:", err);
    res.status(500).json({ message: "Upload avatar failed" });
  }
};


module.exports = { getRecentActivity, getLevelProgress, getRank, getProfile, updateProfile, updateAvatar };
