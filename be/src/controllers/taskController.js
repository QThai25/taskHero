const Task = require("../models/Task");
const User = require("../models/User");
const Reminder = require("../models/Reminder");
const {
  awardUserPoints,
  undoUserPoints,
} = require("../services/pointsService");

// ================== GET /api/tasks ==================
const getTasks = async (req, res) => {
  try {
    const { status, date } = req.query;
    const userId = req.userId;

    const filter = { userId };
    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.dueDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/tasks/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.userId;

    const task = await Task.findOne({
      _id: req.params.id,
      userId,
    });

    console.log("UPDATE STATUS:", {
      reqStatus: status,
      taskStatus: task.status,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ COMPLETE
    if (status === "completed" && task.status !== "completed") {
      task.status = "completed";
      await task.save(); // 🔥 BẮT BUỘC

      const result = await awardUserPoints(task, userId);

      return res.json({
        task,
        points: result.points,
        stats: result.stats,
        awarded: result.awarded,
      });
    }

    // 🔁 UNDO
    if (status !== "completed" && task.status === "completed") {
      task.status = status;
      await task.save(); // 🔥 BẮT BUỘC

      const result = await undoUserPoints(task, userId);

      return res.json({
        task,
        points: result.points,
        stats: result.stats,
      });
    }

    task.status = status;
    await task.save();
    res.json({ task });
  } catch (err) {
    console.error("updateStatus error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== GET /api/tasks/:id ==================
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================== GET /api/tasks/expired ==================
const getExpiredTasks = async (req, res) => {
  try {
    const daysMax = parseInt(req.query.daysMax || "3");
    const userId = req.userId;

    const now = new Date();
    const past = new Date(now.getTime() - daysMax * 24 * 60 * 60 * 1000);

    const expiredTasks = await Task.find({
      userId,
      dueDate: { $lt: now, $gt: past },
      status: { $ne: "completed" },
    }).sort({ dueDate: -1 });

    res.json(expiredTasks);
  } catch (err) {
    console.error("getExpiredTasks error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== POST /api/tasks ==================
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      tags = [],
      reminders = [],
    } = req.body;
    console.log(">>> createTask payload:", req.body);
    const userId = req.userId;
    if (!title || !dueDate) {
      return res.status(400).json({ message: "title and dueDate required" });
    }

    const priorityPoints = { low: 4, medium: 6, high: 8 };
    const normalizedPriority = priority?.toLowerCase() || null;
    const points = priorityPoints[normalizedPriority] || 0;

    const dueAt = new Date(dueDate);

    const task = await Task.create({
      title,
      description,
      dueDate: dueAt,
      priority: normalizedPriority,
      status,
      tags,
      points,
      userId,
    });

    const user = await User.findById(userId).select("email");
    const userEmail = user?.email;

    // ===== CREATE REMINDERS =====
    for (const r of reminders) {
      let notifyTime;
      let methods = ["browser"];

      if (Array.isArray(r.methods)) {
        methods = r.methods;
      }
      if (typeof r === "number") {
        notifyTime = new Date(dueAt.getTime() - r * 60 * 1000);
      } else if (typeof r === "object" && r.notifyTime) {
        notifyTime = new Date(r.notifyTime);
        methods = r.methods || methods;
      }

      if (notifyTime && !isNaN(notifyTime.getTime())) {
        await Reminder.create({
          taskId: task._id,
          userId,
          notifyTime,
          methods,
          sent: false,
        });
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== PUT /api/tasks/:id ==================
const updateTask = async (req, res) => {
  try {
    const userId = req.userId;
    const allowed = [
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "tags",
    ];
    const payload = {};

    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    if (payload.dueDate) {
      payload.dueDate = new Date(payload.dueDate);
    }

    if (payload.priority) {
      const p = payload.priority.toLowerCase();
      const map = { low: 4, medium: 6, high: 8 };
      payload.priority = p;
      payload.points = map[p] || 0;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      payload,
      { new: true },
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    // ===== UPDATE REMINDERS =====
    if (req.body.reminders) {
      await Reminder.deleteMany({ taskId: task._id });

      const user = await User.findById(userId).select("email");

      for (const r of req.body.reminders) {
        let notifyTime;
        let methods = ["browser"];

        if (Array.isArray(r.methods)) {
          methods = r.methods;
        }
        if (typeof r === "number") {
          notifyTime = new Date(task.dueDate.getTime() - r * 60 * 1000);
        } else if (typeof r === "object" && r.notifyTime) {
          notifyTime = new Date(r.notifyTime);
          methods = r.methods || methods;
        }

        if (!isNaN(notifyTime?.getTime())) {
          await Reminder.create({
            taskId: task._id,
            userId,
            userEmail: user?.email,
            notifyTime,
            methods,
            sent: false,
          });
        }
      }
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================== DELETE /api/tasks/:id ==================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Reminder.deleteMany({ taskId: task._id });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTasks,
  getTask,
  getExpiredTasks,
  createTask,
  updateTask,
  deleteTask,
  updateStatus,
};
