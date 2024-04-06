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
exports.autoMatching = async (req, res, next) => {
  const userId = req.params.userId;
  const { gender, faculty, shiftNumber, date, type } = req.body;
  const q = query(
    ShiftCollection,
    where("type", "==", type.toString()),
    where("available", "==", true),
    where("auto", "==", true),
    where("shiftNumber", "==", shiftNumber.toString()),
    where("date", "==", date.toString())
  );

  const querySnapshot = await getDocs(q);
  let highestCredit = 0;
  let shiftWithHighestCredit = null;

  for (const doc of querySnapshot.docs) {
    const shiftData = doc.data();
    shiftData.driver = await driverService.handleGetDriverById(shiftData.driverId);
    
    if (
      gender === shiftData.condition.gender &&
      userId !== shiftData.driver.userId &&
      (faculty === "" || faculty === shiftData.faculty)
    ) {
      if (shiftData.driver.credit > highestCredit) {
        highestCredit = shiftData.driver.credit;
        shiftWithHighestCredit = shiftData;
      }
    }
  }
  if(shiftWithHighestCredit!=null){
    
  }
  // Kết quả chứa shift có driver có credit cao nhất
  console.log("Shift with highest credit:", shiftWithHighestCredit);
}

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
    if (driverUser.token !== null) {
      const message = {
        notification: {
          title: "Đi học với mình nhé!",
          body: `${passenger.name} đã gửi cho bạn lời mời đi học cùng`,
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          screen: "search",
          messageId: "123456",
        },
        token: driverUser.token,
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
  const shiftId = req.body.shiftId;

  const check = await rideService.checkAvailableConfirm(rideId,passengerId)
  if(check===false){
    return   res.status(401).json({ message: "Error" });

  }
  await updateDoc(doc(ShiftCollection, shiftId), {
    available:false
});
  const ride = await rideService.updateStatus(rideId,"Confirm");
  // console.log(ride.shiftId)
  res.status(200).json({ message: "updated" });
};

exports.startRide = async (req, res, next) => {
  const driverName = req.body.driverName;
  const rideId = req.body.rideId;
  const passengerId = req.body.passengerId;
  const passenger = await userService.handleGetUserById(passengerId)
  console.log(passenger.token)
  const message = {
    notification: {
      title: `${driverName} đang trên đường đến bạn!`,
      body: `${passenger.name} Hãy chuẩn bị sẵn sàng để cùng đi học nhé!`,
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      screen: "feedbackDriver",
      messageId: "123456",
    },
    token: passenger.token,
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
  const ride = await rideService.updateStatus(rideId,"Start");
  // console.log(ride.shiftId)
  res.status(200).json({ message: "start ride" });
};
exports.completedRide = async (req, res, next) => {
  const{rideId,passengerId,driverName,driverId} = req.body;
  const passenger = await userService.handleGetUserById(passengerId)
  const driverUser = await userService.handleGetUserById(driverId)
  if(passenger.token!=null){
    const message = {
      notification: {
        title: `${driverName} đang trên đường đến bạn!`,
        body: `${passenger.name} Hãy chuẩn bị sẵn sàng để cùng đi học nhé!`,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        screen: "feedbackDriver",
        messageId: "123456",
      },
      token: passenger.token,
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
  if(driverUser.token!=null){
    const message = {
      notification: {
        title: `${driverName} đang trên đường đến bạn!`,
        body: `${passenger.name} Hãy chuẩn bị sẵn sàng để cùng đi học nhé!`,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        screen: "feedbackPassenger",
        messageId: "123456",
      },
      token: passenger.token,
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
  const ride = await rideService.updateStatus(rideId,"Completed");
  // console.log(ride.shiftId)
  res.status(200).json({ message: "start ride" });
};
exports.findPendingRide = async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(RideCollection);
    const driverId = req.params.driverId;

    // Tạo mảng để lưu trữ kết quả
    const confirmedRides = [];
    // Lặp qua từng document trong kết quả truy vấn
    for (const doc of querySnapshot.docs) {
      const ride = doc.data();
      ride.id = doc.id;
      const shiftData = await shiftService.handleGetShiftById(ride.shiftId);
      const passenger = await userService.handleGetUserById(ride.passengerId);
      if (shiftData !== null && passenger !== null ) {
        const formattedDate = moment(shiftData.date, "DD/MM/YYYY");
        const today = moment();
        if (formattedDate.isAfter(today) && ride.status === "Pending" && shiftData.driverId ==driverId ) {
          const schoolShiftQuery = query(
            RideCollection,
            where("shiftId", "==", shiftData.id),
           
          );
          const querySnapshot = await getDocs(schoolShiftQuery);
          const count = querySnapshot.size;
          // ride.shift = shiftData;
          ride.passenger = passenger;
          confirmedRides.push({ride:ride,total:count,shiftNumber:shiftData.shiftNumber,weekDay:shiftData.weekDay,date:shiftData.date});
        }
      }
    }

    res.status(200).json({ rides: confirmedRides});
  } catch (error) {
    console.error("Error finding Confirmed Rides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
