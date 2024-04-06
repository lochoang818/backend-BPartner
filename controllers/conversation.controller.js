const {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
} = require("firebase/firestore");
const { ConversationCollection } = require("../firestore/collection");
const conversationService = require("../service/conversation.service");
require("express-async-errors"); // Import thư viện express-async-errors

exports.getConversationsByUserId = async (req, res) => {
    let id = req.query.userId;
    if (id == null) return res.status(401).json({ message: "Missing data." });
    let conversations = await conversationService.getConversationsByUserId(id);
    return res.json(conversations);
};

exports.getConversationByUserIdAndConversationId = async (req, res) => {
    let conversationId = req.params.id;
    let userId = req.query.userId;
    if (!conversationId || !userId)
        return res.status(401).json({ message: "Missing data." });

    let conversation =
        await conversationService.getConversationByUserIdAndConversationId(
            userId,
            conversationId
        );
    return res.status(200).json(conversation);
};

exports.createConversationsByUserIds = async (req, res) => {
    let id1 = req.body.id1;
    let id2 = req.body.id2;
    let conversation = await conversationService.createConversationByUserIds(
        id1,
        id2
    );
    return res.status(200).json({ success: true });
};

exports.markConversationAsSeen = async (req, res) => {
    let userId = req.query.userId;
    let conversationId = req.params.id;
    if (!userId || !conversationId)
        return res.status(401).json({ message: "Missing data." });
    let result = await conversationService.markConversationAsSeen(
        userId,
        conversationId
    );
    return res.status(200).json({ success: true });
};
