const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const uploadAvatar = require("../middleware/upload");

const {
  getProfile,
  getRecentActivity,
  getLevelProgress,
  getRank,
  updateProfile,
  updateAvatar, // ✅ THÊM DÒNG NÀY
} = require("../controllers/profileController");

router.get("/", auth, getProfile);
router.get("/activity", auth, getRecentActivity);
router.get("/level-progress", auth, getLevelProgress);
router.get("/rank", auth, getRank);

router.put("/", auth, updateProfile);
router.put("/avatar", auth, uploadAvatar.single("avatar"), updateAvatar);

module.exports = router;
