const express = require("express");
const router = express.Router();
const controller = require("../controllers/taskController");

router.get("/", controller.getTasks);
router.get("/expired", controller.getExpiredTasks); 
router.get("/:id", controller.getTask);
router.post("/", controller.createTask);
router.put("/:id", controller.updateTask);
router.patch("/:id/status", controller.updateStatus);
router.delete("/:id", controller.deleteTask);

module.exports = router;
