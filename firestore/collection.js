// collection.js
const { getFirestore, collection } = require("firebase/firestore");
const app = require("../config");

// Get Firestore instance
const db = getFirestore(app);

// Export your collections
const UserCollection = collection(db, "Users");
const DriverCollection = collection(db, "Drivers");
const ShiftCollection = collection(db, "Shifts");
const RideCollection = collection(db, "Ride");

module.exports = {
  UserCollection,
  DriverCollection,
  db,
  ShiftCollection,
  RideCollection,
};
