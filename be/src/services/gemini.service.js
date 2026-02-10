const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3-flash-preview";

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

  return response.data.candidates[0].content.parts[0].text;
}

module.exports = { chatWithGemini };
