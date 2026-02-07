// src/routes/reminders.js
const express = require("express");
const router = express.Router();

// lưu ý: require trỏ tới tên file controllers hiện có (remindersController.js)
const { getUpcomingReminders, runOnceHandler } = require("../controllers/remindersController");

router.get("/", getUpcomingReminders);
router.post("/run-once", runOnceHandler);

module.exports = router;
