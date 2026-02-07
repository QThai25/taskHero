// scripts/reminderScheduler.js
const Reminder = require("../models/Reminder");
const Task = require("../models/Task");
const nodemailer = require("nodemailer");

// Optional: get io from server if you're using socket.io
let io = null;
function setSocketIo(_io) {
  io = _io;
}

// configure nodemailer transport (example with Gmail SMTP; use env vars in prod)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper send email (returns promise)
async function sendEmail(to, subject, text, html) {
  if (!transporter) return;
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

// runOnce: find due reminders, mark sent (atomically) then send
async function runOnce() {
  const now = new Date();
  // Find due reminders (not sent)
  const due = await Reminder.find({ sent: false, notifyTime: { $lte: now } });
  const results = [];

  for (const r of due) {
    // Atomically mark as sent to avoid duplicate sending by concurrent runners
    const claimed = await Reminder.findOneAndUpdate(
      { _id: r._id, sent: false },
      { $set: { sent: true, updatedAt: new Date() } },
      { new: true }
    );
    if (!claimed) {
      // someone else handled it
      continue;
    }

    // Load task for context
    const task = await Task.findById(r.taskId).select("title dueDate");

    try {
      if (r.method === "email") {
        // Need user's email — you may store user email in Reminder or fetch from User model
        // For demo: assume Reminder has userEmail (or fetch User by r.userId)
        let userEmail = r.userEmail;
        if (!userEmail && r.userId) {
          const User = require("../models/User");
          const user = await User.findById(r.userId).select("email");
          userEmail = user?.email || process.env.DEV_NOTIFICATION_EMAIL;
        }
        if (userEmail) {
          await sendEmail(
            userEmail,
            `Reminder: ${task ? task.title : "Task"}`,
            `Reminder for task "${task ? task.title : ""}" scheduled at ${
              r.notifyTime
            }`,
            `<p>Reminder for task <b>${
              task ? task.title : ""
            }</b> scheduled at ${r.notifyTime}</p>`
          );
        } else {
          console.warn("No email available for reminder", r._id);
        }
      } else if (r.method === "browser") {
        // Option A: send via socket.io if available
        if (io) {
          io.to(r.userId.toString()).emit("reminder", {
            id: r._id,
            taskId: r.taskId,
            title: task ? task.title : null,
            notifyTime: r.notifyTime,
          });
        } else {
          // Option B: nothing server-side — client must poll GET /api/reminders
          // We already marked sent=true so client polling won't see it;
          // Alternative: do NOT mark sent here if you rely on polling to show then mark from client.
          // For now, we emitted via socket if possible.
        }
      }
      results.push({ id: r._id, status: "sent" });
    } catch (err) {
      console.error("Failed to send reminder", r._id, err);
      // If send failed, consider rolling back 'sent' flag or set 'error' field. For now keep sent=true to avoid retry storms.
      results.push({
        id: r._id,
        status: "error",
        error: err.message || String(err),
      });
    }
  }

  return results;
}

// start cron job (optional): run every minute
function startCron() {
  const intervalMs =
    (process.env.REMINDER_POLL_INTERVAL_SECONDS
      ? parseInt(process.env.REMINDER_POLL_INTERVAL_SECONDS)
      : 60) * 1000;
  setInterval(() => {
    runOnce().catch((err) => console.error("reminder runOnce error", err));
  }, intervalMs);
}

module.exports = { runOnce, startCron, setSocketIo };
