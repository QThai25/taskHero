const buffers = new Map();

export function bufferMessage(userId, message, callback) {
  if (!buffers.has(userId)) {
    buffers.set(userId, { messages: [], timer: null });
  }

  const entry = buffers.get(userId);
  entry.messages.push(message);

  if (entry.timer) clearTimeout(entry.timer);

  entry.timer = setTimeout(() => {
    const finalMessage = entry.messages.join(" ");
    buffers.delete(userId);
    callback(finalMessage);
  }, 2500);
}
