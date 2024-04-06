const {
    sendTextMessage,
    getMessagesByConversationId
} = require("../controllers/message.controller");
const express = require("express");
const router = express.Router();

router.route("/").post(sendTextMessage);
router.route("/").get(getMessagesByConversationId);
module.exports = router;
