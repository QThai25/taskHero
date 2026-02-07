const mongoose = require("mongoose");
const Reminder = require("../models/Reminder.js");
const Task = require("../models/Task.js");
const { runOnce } = require("../scripts/reminderScheduler.js");
const { send } = require("node:process");

// GET /api/reminders?windowMinutes=60
const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const days = 3; // lấy trong 3 ngày tới
    const now = new Date();
    const windowEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Build user match: try ObjectId if possible, fallback to string
    const orUserMatches = [];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      orUserMatches.push({ userId: new mongoose.Types.ObjectId(userId) });
    }
    orUserMatches.push({ userId: String(userId) }); // match string-stored userId

    // Choose sent filter: frontend usually wants reminders not sent yet
    // Nếu bạn muốn *upcoming* (chưa gửi), dùng sent: false.
    // Nếu bạn muốn cả đã gửi lẫn chưa, bỏ sent khỏi query.

    const reminders = await Reminder.find({
      $and: [
        { notifyTime: { $gte: now, $lte: windowEnd } },
        { $or: orUserMatches },
      ],
    }).sort({ notifyTime: 1 });

    const payload = [];
    for (const r of reminders) {
      const task = await Task.findById(r.taskId).select("title dueDate");
      payload.push({
        id: r._id,
        taskId: r.taskId,
        taskTitle: task ? task.title : null,
        notifyTime: r.notifyTime,
        method: r.method,
        sent: r.sent,
      });
    }

    console.log(">>> getUpcomingReminders:", {
      userId,
      days,
      found: payload.length,
    });

    return res.json(payload);
  } catch (err) {
    console.error("❌ getUpcomingReminders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ POST /api/reminders/run-once
const runOnceHandler = async (req, res) => {
  try {
    await runOnce();
    return res.json({ success: true, message: "Triggered reminder runOnce" });
  } catch (err) {
    console.error("runOnce handler error", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to run scheduler" });
  }
};

module.exports = { getUpcomingReminders, runOnceHandler };
