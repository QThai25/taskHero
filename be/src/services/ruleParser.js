export function parseByRule(message) {
  const text = message.toLowerCase();

  // CREATE TASK
  if (/nhắc tôi|tạo task|thêm việc|create task/.test(text)) {
    return { intent: "CREATE_TASK" };
  }

  // COMPLETE
  if (/hoàn thành|xong rồi|done/.test(text)) {
    return { intent: "COMPLETE_TASK" };
  }

  // LIST
  if (/danh sách|list task|việc hôm nay/.test(text)) {
    return { intent: "LIST_TASK" };
  }

  // UPDATE
  if (/đổi|update|sửa task/.test(text)) {
    return { intent: "UPDATE_TASK" };
  }

  return null;
}
