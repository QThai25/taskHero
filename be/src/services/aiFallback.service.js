const Task = require("../models/Task");

async function aiFallback({ userId, message }) {
  const msg = message.toLowerCase();

  // ===== CASE 1: KHÔNG CÓ TASK =====
  const tasks = await Task.find({
    userId,
    status: { $ne: "completed" },
  }).sort({ dueDate: 1 });

  if (tasks.length === 0) {
    return "📭 Bạn chưa có task nào. Thử tạo task mới nhé ✍️";
  }

  // ===== CASE 2: HỎI NÊN LÀM GÌ =====
  if (
    msg.includes("nên làm gì") ||
    msg.includes("làm gì trước") ||
    msg.includes("làm gì tiếp")
  ) {
    return `📌 Gợi ý nhanh: bạn nên làm "${tasks[0].title}" trước nhé`;
  }

  // ===== CASE 3: HỎI TASK HÔM NAY =====
  if (msg.includes("hôm nay")) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter((t) => t.dueDate && t.dueDate >= today);

    if (todayTasks.length === 0) {
      return "✅ Hôm nay bạn không có task gấp nào";
    }

    return (
      "📅 Task hôm nay:\n" +
      todayTasks
        .slice(0, 3)
        .map((t, i) => `${i + 1}. ${t.title}`)
        .join("\n")
    );
  }

  // ===== CASE 4: TASK QUÁ HẠN =====
  const now = new Date();
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < now);

  if (overdue.length > 0) {
    return `⏰ Bạn đang có task trễ hạn: "${overdue[0].title}"`;
  }
  if (msg.includes("deadline") || msg.includes("gần nhất")) {
    return `⏳ Deadline gần nhất của bạn là "${tasks[0].title}"`;
  }
  const highPriority = tasks.find((t) => t.priority === "high");
  if (msg.includes("ưu tiên") && highPriority) {
    return `🔥 Task ưu tiên cao: "${highPriority.title}"`;
  }
  // ===== DEFAULT =====
  return `🤖 Hôm nay mình hơi mệt 😅  
Bạn thử dùng /help hoặc nhập rõ hơn nhé`;
}

module.exports = { aiFallback };
