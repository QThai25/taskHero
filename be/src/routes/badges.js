const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const UserBadge = require("../models/UserBadge");

router.get("/me", auth, async (req, res) => {
  const badges = await UserBadge.find({ userId: req.user.id })
    .populate("badgeId")
    .sort({ awardedAt: -1 });

  res.json(badges);
});

module.exports = router;
