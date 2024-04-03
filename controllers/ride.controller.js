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
  updateDoc,
} = require("firebase/firestore");
const {
  ShiftCollection,
  DriverCollection,
  RideCollection,
} = require("../firestore/collection");
const { get } = require("../utils/emailSender.util");
const userService = require("../service/user.service");
const shiftService = require("../service/shift.service");
const driverService = require("../service/driver.service");
const rideService = require("../service/ride.service");

const admin = require("firebase-admin");

// const serviceAccount = require("../bpartner-664d2-firebase-adminsdk-xx44p-1fd9407f5d.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
const moment = require("moment");

exports.createRide = async (req, res, next) => {
  try {
    const confirmData = req.body;
    const check = await rideService.checkAvailablePassenger(
      confirmData.shiftId,
      confirmData.passengerId
    );
    if (!check) {
      return res
        .status(400)
        .json({ message: "This passenger is not available" });
    }
    // driverData.user= await handleGetUserById(req.body.userId)
    const shiftData = await shiftService.handleGetShiftById(
      confirmData.shiftId
    );

    const passenger = await userService.handleGetUserById(
      confirmData.passengerId
    ); // await addDoc(RideCollection, confirmData);
    //check passenger
    const driver = await driverService.handleGetDriverById(shiftData.driverId);
    const driverUser = await userService.handleGetUserById(driver.userId);
    if (driverUser.deviceId !== null) {
      const message = {
        notification: {
          title: "Đi học với mình nhé!",
          body: `${passenger.name} đã gửi cho bạn lời mời đi học cùng`,
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          screen: "/search",
          messageId: "123456",
        },
        token: driverUser.deviceId,
      };
      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Successfully sent message");
          // res.status(200).json({ message: "Successfully sent message" });
        })
        .catch((error) => {
          console.log("Error sending message:");

          // res.status(500).json({ error: "Error sending message:" + error });
        });
    }
    await addDoc(RideCollection, confirmData);
    res.status(201).json({ message: "Ride added" });
  } catch (error) {
    throw new Error("Bad request");
  }
};
exports.findIncommingRide = async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(RideCollection);
    const passengerId = req.params.userId;
    const { status } = req.body;
    // Tạo mảng để lưu trữ kết quả
    const confirmedRides = [];

    // Lặp qua từng document trong kết quả truy vấn
    for (const doc of querySnapshot.docs) {
      const ride = doc.data();
      ride.id = doc.id;
      const shiftData = await shiftService.handleGetShiftById(ride.shiftId);
      const passenger = await userService.handleGetUserById(passengerId);
      if (shiftData !== null && passenger !== null) {
        const formattedDate = moment(shiftData.date, "DD/MM/YYYY");
        const today = moment();

        if (formattedDate.isAfter(today) && ride.status === status) {
          ride.shift = shiftData;
          ride.passenger = passenger;
          shiftData.driver = await driverService.handleGetDriverById(
            shiftData.driverId
          );
          shiftData.driver.user = await userService.handleGetUserById(
            shiftData.driver.userId
          );
          confirmedRides.push(ride);
        }
      }
    }

    res.status(200).json({ ride: confirmedRides });
  } catch (error) {
    console.error("Error finding Confirmed Rides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.confirmRide = async (req, res, next) => {
  const rideId = req.body.rideId;
  const passengerId = req.body.passengerId;

  const check = await rideService.checkAvailableConfirm(rideId,passengerId)
  if(check===false){
    return   res.status(401).json({ message: "Error" });

  }
  const ride = await rideService.updateConfirmStatus(rideId);
  // console.log(ride.shiftId)
  res.status(200).json({ message: "updated" });
};


