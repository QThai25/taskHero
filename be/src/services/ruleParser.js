const { normalizeText } = require("../utils/normalizeText");

function parseByRule(message) {
  const text = normalizeText(message);

  if (/nhac toi|tao task|them viec|create task/.test(text)) {
    return { intent: "CREATE_TASK" };
  }

  if (/hoan thanh|xong roi|done/.test(text)) {
    return { intent: "COMPLETE_TASK" };
  }

  if (/danh sach|list task|task list|viec hom nay|task hom nay/.test(text)) {
    return { intent: "LIST_TASK" };
  }

  if (/doi|update|sua task/.test(text)) {
    return { intent: "UPDATE_TASK" };
  }

  if (/nen lam gi|lam gi truoc|uu tien/.test(text)) {
    return { intent: "SUGGEST_NEXT_TASK" };
  }

  return null;
}

module.exports = {
  parseByRule,
};
