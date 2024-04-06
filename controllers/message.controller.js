const messageService = require("../service/message.service");
const conversationService = require("../service/conversation.service");
require("express-async-errors"); // Import thư viện express-async-errors

exports.getMessagesByConversationId = async (req, res) => {
    let id = req.query.conversationId;
    let messages = await messageService.getMessagesByConversationId(id);
    return res.status(200).json(messages);
};



exports.sendTextMessage = async (req, res) => {
    let senderId = req.body.senderId;
    let conversationId = req.body.conversationId;
    let content = req.body.content;
    let receiverId = req.body.receiverId;

    if (!conversationId && !receiverId)
        return res.status(401).json({ message: "Missing data." });
    if (!senderId || !content)
        return res.status(401).json({ message: "Missing data." });
    if (receiverId) {
        await messageService.sendTextMessageByReceiverId(
            receiverId,
            senderId,
            content
        );
        return res.status(200).json({ success: true });
    }

    let message = await messageService.sendTextMessageByConversationId(
        conversationId,
        senderId,
        content
    );
    if (!message) return res.status(401).json({ success: false });

    return res.status(200).json({ success: true });
};
