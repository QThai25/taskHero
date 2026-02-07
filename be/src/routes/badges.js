const express = require("express");
const router = express.Router();
const controller = require("../controllers/badgesController");

router.get("/", controller.getUserBadges);

module.exports = router;
