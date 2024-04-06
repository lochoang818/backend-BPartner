const {
    getFirestore,
    collection,
    addDoc,
    query,
    getDocs,
    where,
    getDoc,
    documentId,
    updateDoc,
    doc,
    orderBy,
    Timestamp,
    serverTimestamp,
    limit,
} = require("firebase/firestore");
const {
    MessageCollection,
    UserCollection,
    ConversationCollection,
} = require("../firestore/collection");
const conversationService = require("../service/conversation.service");

exports.getMessagesByConversationId = async (id) => {
    let querySnap = await getDocs(
        query(
            MessageCollection,
            where("conversationId", "==", id),
            orderBy("createdAt", "desc")
        )
    );

    return querySnap.docs.map((doc) => doc.data());
};

exports.getLastMessageByConversationId = async (id) => {
    let querySnap = await getDocs(
        query(
            MessageCollection,
            where("conversationId", "==", id),
            orderBy("createdAt", "desc"),
            limit(1)
        )
    );
    if (querySnap.empty) return null;
    return querySnap.docs[0].data();
};

exports.sendTextMessageByReceiverId = async (receiverId, senderId, content) => {
    let conversationRef = await conversationService.createConversationByUserIds(
        senderId,
        receiverId
    );
    let conversationDoc = await getDoc(conversationRef);
    let conversationId = conversationDoc.id;

    let doc = await this.sendTextMessageByConversationId(
        conversationId,
        senderId,
        content
    );

    await updateDoc(conversationRef, { lastUpdated: serverTimestamp() });
    global.io.to(global.userConnections[receiverId]).emit("message", {
        senderId: senderId,
        conversationId: conversationId,
        type: "text",
        content: content,
    });

    return doc;
};

exports.sendTextMessageByConversationId = async (
    conversationId,
    senderId,
    content
) => {
    let doc = await this.saveTextMessageByConversationId(
        conversationId,
        senderId,
        content
    );

    return doc;
};

exports.saveTextMessageByConversationId = async (
    conversationId,
    senderId,
    content
) => {
    let newMessage = {
        conversationId: conversationId,
        senderId: senderId,
        createdAt: Timestamp.now(),
        type: "text",
        content: content,
        seenBy: [senderId],
    };
    let doc = await addDoc(MessageCollection, newMessage);
    console.log("ASD");
    await conversationService.markConversationAsSeenByOne(
        senderId,
        conversationId
    );
    return doc;
};
