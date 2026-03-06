const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-lite";

async function chatWithGemini(message) {
  try {
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

  } catch (err) {
    console.log("❌ GEMINI ERROR:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { chatWithGemini };