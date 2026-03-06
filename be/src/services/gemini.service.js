const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.1-flash-lite";

async function chatWithGemini(message) {
  if (!message) throw new Error("Message is required");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(url, {
    contents: [
      {
        role: "user",
        parts: [{ text: message }]
      }
    ]
  });

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

module.exports = { chatWithGemini };