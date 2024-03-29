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

    DriverCollection,

  } = require("../firestore/collection");
exports.handleGetDriverById = async (id) => {
    try {
      const docRef = doc(DriverCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log(`Driver with id ${id} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching driver:", error);
      throw new Error("Error fetching driver");
    }
  };