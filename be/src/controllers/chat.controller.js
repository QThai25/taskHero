const { chatWithGemini } = require("../services/gemini.service");
const {
  createTask,
  getTasks,
  getExpiredTasks,
  updateStatus,
} = require("./taskController");
const Task = require("../models/Task");
const { parseDueDate } = require("../utils/parseDueDate");
const { aiFallback } = require("../services/aiFallback.service");
const { parseByRule } = require("../services/ruleParser");
const { handleSuggestNextTask } = require("../services/taskSuggest.service");
// ===== helper =====
async function findTaskIdByTitle(title, userId) {
  if (!title) return null;

  const task = await Task.findOne({
    userId,
    title: { $regex: new RegExp(`^${title}$`, "i") },
  });
  if (!task) return null;

  return task._id.toString();
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // =========================
    // 1️⃣ RULE-BASED FIRST
    // =========================
    const ruleResult = parseByRule(message);

    if (ruleResult) {
      switch (ruleResult.intent) {
        case "LIST_TASK": {
          const now = new Date();

          const tasks = await Task.find({
            userId,
            status: { $ne: "completed" },
            dueDate: { $gte: now },
          }).sort({ dueDate: 1 });

          if (tasks.length === 0) {
            return res.json({
              reply: "📭 Bạn không có task nào đang làm cả",
            });
          }

          const text =
            "📋 **Task đang làm**\n\n" +
            tasks
              .slice(0, 5)
              .map((t, i) => `👉 ${i + 1}. ${t.title}`)
              .join("\n");
          return res.json({ reply: text });
        }
        case "COMPLETE_TASK":
          return res.json({
            reply: "✅ Bạn nói rõ tên task mình sẽ hoàn thành giúp nhé",
          });

        case "CREATE_TASK":
          return res.json({
            reply: "⏰ Bạn muốn nhắc việc này khi nào?",
          });
      }
    }

    const prompt = `
You are TaskHero AI.

Your job is to analyze user messages and convert them into JSON instructions
for a task management backend.

Rules:
- ALWAYS respond in JSON
- Do NOT explain
- Do NOT add extra text
- If data is missing, set value to null
- Never include natural language outside JSON

Available intents:
- CREATE_TASK
- UPDATE_TASK_STATUS
- GET_TODAY_TASKS
- GET_EXPIRED_TASKS
- SUGGEST_NEXT_TASK
- UNKNOWN

====================
INTENT DEFINITIONS
====================

Use CREATE_TASK when the user wants to:
- create a task
- remind them to do something
- schedule something
- set a deadline

Use UPDATE_TASK_STATUS when the user wants to:
- mark a task as completed
- change task status

Use GET_TODAY_TASKS when the user asks:
- what tasks today
- tasks for today
- việc hôm nay

Use GET_EXPIRED_TASKS when the user asks:
- overdue tasks
- expired tasks
- task trễ hạn

Use SUGGEST_NEXT_TASK when the user asks:
- what should I do
- what should I do next
- what should I do today or tomorrow
- what to prioritize
- tôi nên làm gì
- làm gì trước
- ưu tiên task nào
- nên làm task nào trước

If the user asks for advice or prioritization, ALWAYS use SUGGEST_NEXT_TASK.

If intent is unclear, use UNKNOWN.

====================
SCHEMAS
====================

CREATE_TASK schema:
{
  "intent": "CREATE_TASK",
  "data": {
    "title": string,
    "description": string | null,
    "due": {
      "type": "today" | "tomorrow" | "date" | "days_from_now",
      "date": "YYYY-MM-DD" | null,
      "days": number | null,
      "hour": number | null,
      "minute": number | null
    },
    "priority": "low" | "medium" | "high" | null,
    "reminders": number[] | []
  }
}

UPDATE_TASK_STATUS schema:
{
  "intent": "UPDATE_TASK_STATUS",
  "data": {
    "taskTitle": string,
    "status": "todo" | "in-progress" | "completed"
  }
}

GET_TODAY_TASKS, GET_EXPIRED_TASKS, and SUGGEST_NEXT_TASK have no data.

====================
EXAMPLES
====================

User: "tôi nên làm gì trước vào ngày mai"
AI:
{
  "intent": "SUGGEST_NEXT_TASK",
  "data": {}
}

User: "Nhắc tôi nộp báo cáo lúc 18h ngày mai"
AI:
{
  "intent": "CREATE_TASK",
  "data": {
    "title": "Nộp báo cáo",
    "description": null,
    "due": {
      "type": "tomorrow",
      "date": null,
      "days": null,
      "hour": 18,
      "minute": 0
    },
    "priority": "medium",
    "reminders": []
  }
}

====================
USER MESSAGE
====================
User: ${message}
`;

    const replyText = await chatWithGemini(prompt);

    let parsed;
    try {
      parsed = JSON.parse(replyText);
    } catch {
      return res.json({
        reply: "Mình chưa hiểu rõ, bạn nói lại giúp mình nhé 🙏",
      });
    }

    const { intent, data } = parsed;

    // =========================
    // 3️⃣ DISPATCH
    // =========================
    switch (intent) {
      case "CREATE_TASK": {
        if (!data?.due) {
          return res.json({ reply: "Bạn muốn làm task này lúc nào vậy? ⏰" });
        }

        const dueDate = parseDueDate(data.due);
        if (!dueDate) {
          return res.json({ reply: "Mình chưa xác định được deadline 🤔" });
        }

        req.body = {
          title: data.title,
          description: data.description,
          dueDate,
          priority: data.priority,
          reminders: data.reminders,
        };

        return createTask(req, res);
      }

      case "UPDATE_TASK_STATUS": {
        const taskId = await findTaskIdByTitle(data.taskTitle, userId);

        if (!taskId) {
          return res.json({
            reply:
              "❌ Mình không tìm thấy task này. Bạn kiểm tra lại tên nhé 👀",
          });
        }

        req.body = { status: data.status };
        req.params.id = taskId;

        return updateStatus(req, res);
      }

      case "GET_TODAY_TASKS":
        req.query.date = new Date().toISOString();
        return getTasks(req, res);

      case "GET_EXPIRED_TASKS":
        return getExpiredTasks(req, res);

      case "SUGGEST_NEXT_TASK": {
        const reply = await handleSuggestNextTask(userId);
        return res.json({ reply });
      }
      default:
        return res.json({ reply: "Mình chưa hiểu yêu cầu này 🤔" });
    }
  } catch (err) {
    if (err.code === "AI_QUOTA_EXCEEDED") {
      const reply = await aiFallback({
        userId: req.userId,
        message: req.body.message,
      });
      return res.json({ reply });
    }

    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
};
