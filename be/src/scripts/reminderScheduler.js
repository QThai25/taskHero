// scripts/reminderScheduler.js
const Reminder = require("../models/Reminder");
const Task = require("../models/Task");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ================= SOCKET.IO =================
let io = null;
function setSocketIo(_io) {
  io = _io;
}

// ================= DEBUG ENV =================
console.log("SMTP ENV CHECK:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_APP_PASSWORD ? "OK" : "MISSING",
});

// ================= NODEMAILER =================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify SMTP once
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP config error:", err.message);
  } else {
    console.log("✅ SMTP Gmail ready");
  }
});

// ================= SEND EMAIL =================
async function sendEmail({ to, subject, text, html }) {
  if (!to) return;
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}

// ================= MAIN JOB =================
async function runOnce() {
  const now = new Date();

  // lấy reminder đến hạn & chưa gửi
  const reminders = await Reminder.find({
    sent: false,
    notifyTime: { $lte: now },
  });

  if (reminders.length === 0) {
    console.log("⏭ No reminders to send at", now.toISOString());
    return;
  }

  for (const r of reminders) {
    // 🔒 lock để tránh gửi trùng
    const locked = await Reminder.findOneAndUpdate(
      { _id: r._id, sent: false },
      { $set: { sent: true, updatedAt: new Date() } },
      { new: true },
    );

    if (!locked) continue;

    try {
      const task = await Task.findById(r.taskId).select("title dueDate");

      // 🔥 QUAN TRỌNG: methods là ARRAY
      const methods = Array.isArray(r.methods)
        ? r.methods
        : ["browser"];

      // ================= EMAIL =================
      if (methods.includes("email")) {
        let email = r.userEmail;

        if (!email && r.userId) {
          const user = await User.findById(r.userId).select("email");
          email = user?.email;
        }

        if (!email) {
          console.warn("⚠️ No email found for reminder:", r._id);
        } else {
          await sendEmail({
            to: email,
            subject: `⏰ Reminder: ${task?.title || "Your task"}`,
            text: `Reminder for task "${task?.title || ""}" at ${r.notifyTime}`,
            html: `
              <h3>⏰ Task Reminder</h3>
              <p><b>Task:</b> ${task?.title || ""}</p>
              <p><b>Notify time:</b> ${r.notifyTime}</p>
            `,
          });

          console.log("📧 Reminder email sent:", email);
        }
      }

      // ================= BROWSER / SOCKET =================
      if (methods.includes("browser") && io) {
        io.to(r.userId.toString()).emit("reminder", {
          id: r._id,
          taskId: r.taskId,
          title: task?.title || null,
          notifyTime: r.notifyTime,
        });

        console.log("🔔 Browser reminder emitted:", r._id);
      }
    } catch (err) {
      console.error("❌ Reminder failed:", r._id, err.message);
      // không rollback sent=true để tránh spam
    }
  }
}

// ================= CRON =================
function startCron() {
  const interval =
    (parseInt(process.env.REMINDER_POLL_INTERVAL_SECONDS) || 60) * 1000;

  console.log("⏱ Reminder cron started:", interval / 1000, "seconds");

  setInterval(() => {
    runOnce().catch((err) =>
      console.error("❌ Reminder cron error:", err),
    );
  }, interval);
}

module.exports = {
  runOnce,
  startCron,
  setSocketIo,
};
