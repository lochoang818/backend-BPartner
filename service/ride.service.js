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
} = require("firebase/firestore");
const { RideCollection } = require("../firestore/collection");
const shiftService = require("./shift.service");

exports.handleGetRideById = async (id) => {
  try {
    const docRef = doc(RideCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log(`Ride with id ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Ride:", error);
    throw new Error("Error fetching Ride");
  }
};
exports.updateConfirmStatus = async (id) => {
  try {
    const docRef = await doc(RideCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docSnap.ref, { status: "Confirm" });

      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Error fetching ride");
  }
};
exports.checkAvailablePassenger = async (shiftId, passengerId) => {
  const q = query(
    RideCollection,
    where("shiftId", "==", shiftId),
    where("passengerId", "==", passengerId),
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return true;
  } else {
    return false;
  }
};
exports.checkAvailableConfirm = async (rideId, passengerId) => {
  const q = query(
    RideCollection,
    where("passengerId", "==", passengerId),
    where("status", "==", "Confirm")
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return true;
  } else {
    const ride = await this.handleGetRideById(rideId);
    const driverShift = await shiftService.handleGetShiftById(ride.shiftId);

    for (const doc of querySnapshot.docs) {
      const passengerShift = await shiftService.handleGetShiftById(doc.data().shiftId)
      if(passengerShift.date === driverShift.date && passengerShift.shiftNumber ===driverShift.shiftNumber){
          return false
      }
    }
    return true;
  }
};
