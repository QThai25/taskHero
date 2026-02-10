const buffers = new Map();

function bufferMessage(userId, message, callback) {
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

module.exports = { bufferMessage };
