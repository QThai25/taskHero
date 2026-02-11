function shouldCallAI(message) {
  if (!message) return false;

  const text = message.trim().toLowerCase();

  if (text.length < 6) return false;
  if (/^(hi|hello|ok|thanks|thx|:)$/i.test(text)) return false;
  if (/^[\p{Emoji}\s]+$/u.test(text)) return false;

  return true;
}

function aiGatekeeper(req, res, next) {
  const { message } = req.body;

  if (!shouldCallAI(message)) {
    return res.json({
      reply: "👋 Mình đang nghe đây, bạn nói rõ hơn chút nha",
    });
  }

  next();
}

module.exports = aiGatekeeper;
