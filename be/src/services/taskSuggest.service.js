const Task = require("../models/Task");

async function handleSuggestNextTask(userId) {
  const now = new Date();

  // ✅ CHỈ LẤY TASK:
  // - chưa completed
  // - chưa quá hạn
  const tasks = await Task.find({
    userId,
    status: { $ne: "completed" },
    dueDate: { $gte: now },
  }).sort({ dueDate: 1 }); // gần deadline nhất trước

  console.log(">>> handleSuggestNextTask:", {
    userId,
    found: tasks.length,
  });
  if (tasks.length === 0) {
    return "🎉 Hiện tại bạn không có task nào cần làm gấp cả";
  }

  // (optional) ưu tiên HIGH trước
  const highPriority = tasks.find((t) => t.priority === "high");
  if (highPriority) {
    return `🔥 Bạn nên làm task ưu tiên cao "${highPriority.title}" trước nhé`;
  }

  return `👉 Bạn nên làm task "${tasks[0].title}" trước vì sắp tới hạn`;
}

module.exports = { handleSuggestNextTask };
