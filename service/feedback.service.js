const {
    getFirestore,
    collection,
    addDoc,
    query,
    getDocs,
    where,
    getDoc,
    documentId,
    doc,
  } = require("firebase/firestore");
  const {

   FeedbackCollection

  } = require("../firestore/collection");
exports.handleGetDriverById = async (id) => {
    try {
      const docRef = doc(FeedbackCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log(`feedback with id ${id} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw new Error("Error fetching feedback");
    }
  };
  