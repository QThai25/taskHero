const Task = require("../models/Task");

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, date } = req.query;
    const userId = req.userId; // Use userId from auth middleware

    const filter = { userId };
    if (status) filter.status = status;
    if (date) {
      // return tasks for that date (ignore time)
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.dueDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const userId = req.userId; // Use userId from auth middleware

    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      tags = [],
    } = req.body;
    const userId = req.userId;
    if (!title || !dueDate)
      return res.status(400).json({ message: "title and dueDate required" });

    // map priority -> points (server-controlled)
    const priorityPoints = { low: 4, medium: 6, high: 8 };

    const normalizedPriority =
      priority && typeof priority === "string"
        ? priority.toString().toLowerCase()
        : null;

    const assignedPoints =
      normalizedPriority && priorityPoints[normalizedPriority] !== undefined
        ? priorityPoints[normalizedPriority]
        : 0;

    // chuẩn hóa dueDate về cuối ngày
    const rawDue = new Date(dueDate);
    const dueEnd = new Date(rawDue);
    dueEnd.setHours(23, 59, 59, 999);

    const task = new Task({
      title,
      description,
      dueDate: dueEnd,
      priority: normalizedPriority || null,
      status,
      tags,
      points: assignedPoints,
      userId,
    });

    await task.save();

    // tạo reminders (nếu có)
    try {
      const Reminder = require("../models/Reminder");
      const reminders = req.body.reminders || [];
      for (const r of reminders) {
        let notifyTime;
        let method = "browser";

        if (r && typeof r === "object" && r.notifyTime) {
          notifyTime = new Date(r.notifyTime);
          method = r.method || "browser";
        } else if (typeof r === "number") {
          notifyTime = new Date(new Date(dueDate).getTime() - r * 60 * 1000);
        }

        if (notifyTime && !isNaN(notifyTime.getTime())) {
          const rem = new Reminder({
            taskId: task._id,
            userId,
            notifyTime,
            method,
            sent: false,
          });
          await rem.save();
        }
      }
    } catch (er) {
      console.warn("Failed to create reminders", er.message || er);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const userId = req.userId; // lấy từ auth middleware
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const updates = { ...req.body };
    // Xóa các field không được phép sửa
    delete updates._id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const allowed = [
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "tags",
    ];
    const payload = {};
    for (const k of allowed) if (k in updates) payload[k] = updates[k];

    // Nếu có dueDate → convert thành cuối ngày (23:59:59)
    if (payload.dueDate) {
      const rawDue = new Date(payload.dueDate);
      const dueEnd = new Date(rawDue);
      dueEnd.setHours(23, 59, 59, 999);
      payload.dueDate = dueEnd;
    }

    // Nếu priority được thay đổi → tính lại điểm
    if ("priority" in payload) {
      const priorityPoints = {
        low: 4,
        medium: 6,
        high: 8,
      };
      const pr = payload.priority;
      const normalized =
        pr && typeof pr === "string" ? pr.toString().toLowerCase() : null;
      payload.priority = normalized; // lưu priority dạng chuẩn hóa
      payload.points =
        normalized && priorityPoints[normalized] !== undefined
          ? priorityPoints[normalized]
          : 0;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      payload,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Nếu có reminders mới → xóa cũ, thêm mới
    if (req.body.reminders) {
      try {
        const Reminder = require("../models/Reminder");
        await Reminder.deleteMany({ taskId: task._id });

        const reminders = req.body.reminders || [];
        for (const r of reminders) {
          let notifyTime = null;
          let method = "browser";

          if (typeof r === "number") {
            notifyTime = new Date(
              new Date(task.dueDate).getTime() - r * 60 * 1000
            );
          } else if (typeof r === "object" && r.notifyTime) {
            notifyTime = new Date(r.notifyTime);
            method = r.method || "browser";
          } else {
            notifyTime = new Date(r);
          }

          if (!isNaN(notifyTime.getTime())) {
            const rem = new Reminder({
              taskId: task._id,
              userId,
              notifyTime,
              method,
            });
            await rem.save();
          }
        }
      } catch (er) {
        console.warn("Failed to update reminders", er.message || er);
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/tasks/:id/status
// PATCH /api/tasks/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.userId;
    if (!status) return res.status(400).json({ message: "status is required" });
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    // Nếu frontend dùng 'completed' thay vì 'done'
    const updates = { status };
    if (status === "completed") {
      updates.completedAt = new Date();
    } else {
      updates.completedAt = null; // optional: clear completedAt if un-completing
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (status === "completed") {
      try {
        const { updateUserPoints } = require("../services/pointsService");
        const result = await updateUserPoints(task, userId);
        return res.json({
          task,
          pointsAwarded: result.points,
          awardedBadges: result.awarded,
        });
      } catch (err) {
        console.error("pointsService error", err);
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    try {
      const Reminder = require("../models/Reminder");
      await Reminder.deleteMany({ taskId: task._id });
    } catch (er) {
      console.warn("Failed to delete reminders for task", er.message || er);
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getExpiredTasks = async (req, res) => {
  try {
    const daysMax = parseInt(req.query.daysMax) || 3;
    const now = new Date();
    const past = new Date(now.getTime() - daysMax * 24 * 60 * 60 * 1000);

    console.log(">>> [getExpiredTasks]", { now, past, daysMax });

    const expiredTasks = await Task.find({
      dueDate: { $lt: now, $gt: past },
      status: { $ne: "completed" },
    });

    console.log(">>> expiredTasks found:", expiredTasks.length);
    res.json(expiredTasks);
  } catch (err) {
    console.error("❌ getExpiredTasks error:", err);
    res.status(500).json({
      message: "Failed to fetch expired tasks",
      error: err.message,
    });
  }
};



module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
  getExpiredTasks,
};
