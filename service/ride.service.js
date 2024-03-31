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

    ConfirmedRideCollection

  } = require("../firestore/collection");
exports.handleGetConfirmedRideById = async (id) => {
    try {
      const docRef = doc(ConfirmedRideCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log(`ConfirmedRide with id ${id} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching ConfirmedRide:", error);
      throw new Error("Error fetching ConfirmedRide");
    }
  };