function parseDueDate(due) {
  if (!due) return null;

  const now = new Date();
  let date;

  switch (due.type) {
    case "today":
      date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        due.hour ?? 23,
        due.minute ?? 59,
        0
      );
      break;

    case "tomorrow":
      date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        due.hour ?? 23,
        due.minute ?? 59,
        0
      );
      break;

    case "days_from_now":
      date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (due.days ?? 1),
        due.hour ?? 23,
        due.minute ?? 59,
        0
      );
      break;

    case "date":
      const [y, m, d] = due.date.split("-").map(Number);
      date = new Date(
        y,
        m - 1,
        d,
        due.hour ?? 23,
        due.minute ?? 59,
        0
      );
      break;

    default:
      return null;
  }

  return date;
}

module.exports = { parseDueDate };
