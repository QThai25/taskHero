const GREETINGS = [
  "hi", "hello", "hey", "chào", "thanks", "thank", "ok", "oke", "👍", "❤️"
];

export function shouldCallAI(message = "") {
  const text = message.trim().toLowerCase();

  if (!text) return false;
  if (text.length < 6) return false;

  if (GREETINGS.some(g => text === g)) return false;

  // chỉ emoji
  if (/^[\p{Emoji}\s]+$/u.test(text)) return false;

  // phải có động từ hành động
  const ACTION_VERBS = [
    "tạo", "thêm", "nhắc", "làm", "hoàn thành",
    "update", "create", "remind", "complete", "list"
  ];

  if (!ACTION_VERBS.some(v => text.includes(v))) return false;

  return true;
}
