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
} = require("firebase/firestore");
const { UserCollection } = require("../firestore/collection");
exports.handleGetUserById = async (id) => {
    try {
        const docRef = await doc(UserCollection, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Error fetching driver");
    }
};

exports.updateUserInfoById = async (id, data) => {
    try {
        const docRef = await doc(UserCollection, id);
        let res = await updateDoc(docRef, data);
        return res;
    } catch (error) {
        throw new Error("Error fetching driver");
    }
};
