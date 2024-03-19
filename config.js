// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore, collection } = require("firebase/firestore/lite");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-GM1GKDNPcNn0lmL1UnyMsVMTmk7lwZE",
  authDomain: "bpartner-664d2.firebaseapp.com",
  projectId: "bpartner-664d2",
  storageBucket: "bpartner-664d2.appspot.com",
  messagingSenderId: "326047568744",
  appId: "1:326047568744:web:0a1e0edf04498745cf3cdd",
  measurementId: "G-ZMHEWN3Q5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// const UserCollection = collection(db, 'Users');
module.exports = app;
