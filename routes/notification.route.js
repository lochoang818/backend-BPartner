const controller = require("../controllers/notification.controller");
const express = require("express");
const router = express.Router();

router.get("/", controller.getNotificationsByReceiverId);
router.post("/", controller.sendNotification);
router.put("/confirm/:id", controller.confirmNotification);

module.exports = router;
