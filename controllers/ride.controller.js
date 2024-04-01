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
  ConfirmedRideCollection,
} = require("../firestore/collection");
const { get } = require("../utils/emailSender.util");
const userService = require("../service/user.service");
const shiftService = require("../service/shift.service");
const driverService = require("../service/driver.service");
const admin = require('firebase-admin');

const serviceAccount = require('../bpartner-664d2-firebase-adminsdk-xx44p-1fd9407f5d.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
const moment = require("moment");

exports.createConfirmedRide = async (req, res, next) => {
  try {
    const confirmData = req.body;
    // driverData.user= await handleGetUserById(req.body.userId)
    await addDoc(ConfirmedRideCollection, confirmData);
    
    res.status(201).json({ message: "ConfirmedRide added" });
  } catch (error) {
    throw new Error("Bad request");
  }
};
exports.findIncommingRide = async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(ConfirmedRideCollection);
    const passengerId = req.params.userId;
    const {status }= req.body
    // Tạo mảng để lưu trữ kết quả
    const confirmedRides = [];

    // Lặp qua từng document trong kết quả truy vấn
    for (const doc of querySnapshot.docs) {
      const confirmRide = doc.data();
      
      const shiftData = await shiftService.handleGetShiftById(
        confirmRide.shiftId
      );
      const passenger = await userService.handleGetUserById(passengerId);
      if (shiftData !== null && passenger !== null) {
     
        const formattedDate = moment(shiftData.date, "DD/MM/YYYY");
        const today = moment();

        if (formattedDate.isAfter(today) && confirmRide.status===status) {
          confirmRide.shift = shiftData;
          confirmRide.passenger = passenger;
          shiftData.driver = await driverService.handleGetDriverById(
            shiftData.driverId
          );
          shiftData.driver.user = await userService.handleGetUserById(
            shiftData.driver.userId
          );
          confirmedRides.push(confirmRide);
        }
      }
    }

    res.status(200).json({ ride: confirmedRides });
  } catch (error) {
    console.error("Error finding Confirmed Rides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
