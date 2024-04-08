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
    serverTimestamp,
} = require("firebase/firestore");
const {
    ConversationCollection,
    UserCollection,
} = require("../firestore/collection");
const messageService = require("./message.service");
exports.getConversationsByUserId = async (id) => {
    try {
        let querySnap = await getDocs(
            query(
                ConversationCollection,
                where("participants", "array-contains", id),
                orderBy("lastUpdated", "desc")
            )
        );
        let docs = querySnap.docs;
        let result = [];
        for (const d of docs) {
            let data = d.data();

            let lastMessage =
                await messageService.getLastMessageByConversationId(d.id);
            let other =
                data.participants[0] == id
                    ? data.participants[1]
                    : data.participants[0];

            let user = await getDoc(doc(UserCollection, other));

            if (lastMessage == null) continue;
            data.lastMessage = lastMessage;
            data.phone = user.data().phone;
            data.avatar = user.data().avatar;
            data.name = user.data().name;
            data.receiverId = other;
            if (!data.lastUpdated) {
                data.lastUpdatedString = getLastUpdatedDisplayString(
                    data.lastUpdated.toDate()
                );
            }
            data.id = d.id;
            data.seen = data.seenBy.includes(id);
            result.push(data);
        }
        return result;
    } catch (error) {
        console.log(error);
        throw new Error("Error fetching driver");
    }
};

exports.getConversationByUserIdAndConversationId = async (
    userId,
    conversationId
) => {
    try {
        let conversationDoc = await getDoc(
            doc(ConversationCollection, conversationId)
        );
        let data = conversationDoc.data();

        let lastMessage = await messageService.getLastMessageByConversationId(
            conversationDoc.id
        );
        let other =
            data.participants[0] == userId
                ? data.participants[1]
                : data.participants[0];

        let user = await getDoc(doc(UserCollection, other));

        data.lastMessage = lastMessage;

        data.avatar = user.data().avatar;
        data.name = user.data().name;
        data.receiverId = other;
        console.log(data.lastUpdated);
        if (data.lastUpdated !== undefined) {
            data.lastUpdatedString = getLastUpdatedDisplayString(
                data.lastUpdated.toDate()
            );
        }

        data.phone = user.data().phone;

        data.id = conversationDoc.id;
        data.seen = data.seenBy.includes(userId);
        return data;
    } catch (error) {
        console.log(error);
        throw new Error("Error fetching conversation");
    }
};

exports.createConversationByUserIds = async (id1, id2) => {
    try {
        let conversation = await this.getConversationByParticipants(id1, id2);
        console.log(conversation);
        if (conversation == null) {
            let doc = await addDoc(ConversationCollection, {
                createdAt: serverTimestamp(),
                participants: [id1, id2],
                seenBy: [],
            });
            return doc;
        }
        return conversation.ref;
    } catch (error) {
        console.log(error);
        throw new Error("Error");
    }
};

exports.markConversationAsSeen = async (userId, conversationId) => {
    try {
        let conversationRef = doc(ConversationCollection, conversationId);
        let conversationDoc = await getDoc(conversationRef);

        if (conversationDoc == null) return;

        let seenBy = conversationDoc.data().seenBy;
        if (seenBy.includes(userId)) return;

        let r = await updateDoc(conversationRef, {
            seenBy: [...seenBy, userId],
        });
        return r;
    } catch (error) {
        console.log(error);
        throw new Error("Error");
    }
};

exports.markConversationAsSeenByOne = async (userId, conversationId) => {
    try {
        let conversationRef = doc(ConversationCollection, conversationId);
        let conversationDoc = await getDoc(conversationRef);

        if (conversationDoc == null) return;
        console.log(userId);
        console.log(conversationDoc.id);
        let r = await updateDoc(conversationRef, {
            seenBy: [userId],
        });
        return r;
    } catch (error) {
        console.log(error);
        throw new Error("Error");
    }
};

function getLastUpdatedDisplayString(lastUpdated) {
    let currentDate = new Date();
    let diff = currentDate - lastUpdated;
    if (diff < 1000 * 10) return "Vừa xong";
    else if (diff < 1000 * 60 * 60) {
        let diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
        return diffMins + " phút";
    } else if (diff < 1000 * 60 * 60 * 24) {
        return timeInHHMM(lastUpdated);
    } else {
        let diffDays = Math.floor(diff / 86400000); // days
        return diffDays + " ngày";
    }
}

function timeInHHMM(date) {
    // get time in HH:MM
    return (
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0")
    );
}

exports.getConversationByParticipants = async (id1, id2) => {
    let querySnap1 = await getDocs(
        query(
            ConversationCollection,
            where("participants", "array-contains", id1)
        )
    );
    if (querySnap1.empty) return null;
    let querySnap2 = await getDocs(
        query(
            ConversationCollection,
            where("participants", "array-contains", id2)
        )
    );
    if (querySnap2.empty) return null;

    let list1 = querySnap1.docs.map((e) => e.id);
    let list2 = querySnap2.docs.map((e) => e.id);
    let id = "";
    for (const i of list1) {
        if (list2.includes(i)) id = i;
    }

    if ((id = "")) return null;
    for (const d of querySnap1.docs) {
        if (d.id == id) {
            return d;
        }
    }

    return querySnap1.docs[0];
};
