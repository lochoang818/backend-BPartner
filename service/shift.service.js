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

    ShiftCollection
 
  } = require("../firestore/collection");
exports.handleGetShiftById = async (id) => {
    try {
      const docRef = await doc(ShiftCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {...docSnap.data(),id:docSnap.id};

     
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Error fetching shift");
    }
  };