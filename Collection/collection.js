// collection.js
const { getFirestore, collection } = require("firebase/firestore/lite");
const app = require("../config");

// Get Firestore instance
const db = getFirestore(app);

// Export your collections
const UserCollection = collection(db, 'Users');


module.exports = {
  UserCollection,

};
