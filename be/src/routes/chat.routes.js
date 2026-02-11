const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const aiGatekeeper = require("../middleware/aiGatekeeper");

router.post("/",  aiGatekeeper, chatController.chat);

module.exports = router;
