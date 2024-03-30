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
    ShiftCollection,
    DriverCollection,
    UserCollection,
    db,
  } = require("../firestore/collection");
require("express-async-errors"); // Import thư viện express-async-errors
const userService = require('../service/user.service')
const createDriver = async (req, res, next) => {
  try {
    const driverData = req.body;
    // driverData.user= await handleGetUserById(req.body.userId)
    await addDoc(DriverCollection, driverData);
    res.status(201).json({ message: "Driver added" });
  } catch (error) {
    throw new Error("Bad request");
  }
};
const findByIdUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const q = query(DriverCollection, where("userId", "==", userId.toString()));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      res.status(400).json({ message: "Cannot get Driver by id: " + userId });
    }
    const drivers = [];
    querySnapshot.forEach((doc) => {
      drivers.push(doc.data());
    });

    res.status(200).json({ driver: drivers, message: "Get driver by User ID" });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createDriver,
  findByIdUser,
};
