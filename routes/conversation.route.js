const {
    getConversationsByUserId,
    getConversationByUserIdAndConversationId,
    createConversationsByUserIds,
    markConversationAsSeen,
} = require("../controllers/conversation.controller");
const express = require("express");
const router = express.Router();
const messageRouter = require("./message.route.js");

router.use("/message", messageRouter);
router.route("/:id").get(getConversationByUserIdAndConversationId);
router.route("/").get(getConversationsByUserId);
router.route("/").post(createConversationsByUserIds);
router.route("/seen/:id").get(markConversationAsSeen);

module.exports = router;
