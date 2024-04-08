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
const notificationService = require("../service/notification.service");

const admin = require("firebase-admin");

// const serviceAccount = require("../bpartner-664d2-firebase-adminsdk-xx44p-1fd9407f5d.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

const moment = require("moment");
const { json } = require("express");
exports.getAllRidePassenger = async (req, res, next) => {
  const { passengerId } = req.body;

  try {
      const ridesQuerySnapshot = await getDocs(
          query(RideCollection, where("passengerId", "==", passengerId))
      );

      const rides = [];

      ridesQuerySnapshot.forEach((rideDoc) => {
          const rideData = rideDoc.data();
          rides.push(rideData);
      });

      res.status(200).json(rides);
  } catch (error) {
      console.error("Error fetching rides:", error);
      res.status(500).send("Internal Server Error");
  }
};

exports.getAllRideDriver = async (req, res, next) => {
  const { driverId } = req.body;

  try {
    // Lấy tất cả các chuyến đi
    const ridesQuerySnapshot = await getDocs(
      query(RideCollectiond)
  );
    const rides = [];

    // Lặp qua mỗi chuyến đi
    for (const rideDoc of ridesQuerySnapshot.docs) {
      const rideData = rideDoc.data();
      const shiftId = rideData.shiftId;

      // Lấy thông tin của shift dựa trên shiftId
      const shiftData = await handleGetShiftById(shiftId);
      
      // Nếu shift tồn tại và driverId trùng khớp, thêm chuyến đi vào mảng rides
      if (shiftData && shiftData.driverId === driverId) {
        rides.push(rideData);
      }
    }

    res.status(200).json(rides);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching rides:", error);
    res.status(500).send("Internal Server Error");
  }
};
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

        const driver = await driverService.handleGetDriverById(
            shiftData.driverId
        );
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
        confirmData.status = "Pending";
        let ref = await addDoc(RideCollection, confirmData);
        let rideDoc = await getDoc(ref);
        await notificationService.sendNotification(driver.userId, "request", {
            rideId: rideDoc.id,
            status: "sending",
        });
        res.status(201).json({ message: "Ride added" });
    } catch (error) {
        console.log(error);
        throw new Error("Bad request");
    }
};
exports.autoConfirm = async (req, res, next) => {
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

        const driver = await driverService.handleGetDriverById(
            shiftData.driverId
        );
        const driverUser = await userService.handleGetUserById(driver.userId);
        if (driverUser.token !== null) {
            await notificationService.sendNotification(
                rideTemp.passengerId,
                "request",
                {
                    rideId: rideId,
                    status: "accepting",
                }
            );
            const message = {
                notification: {
                    title: `Hãy chuẩn bị đi học với nhau nào!`,
                    body: `Hệ thống đã xếp cặp bạn với ${passenger.name}!`,
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
        await updateDoc(doc(ShiftCollection, confirmData.shiftId), {
            available: false,
        });
        confirmData.status = "Confirm";

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
            const shiftData = await shiftService.handleGetShiftById(
                ride.shiftId
            );
            const passenger = await userService.handleGetUserById(passengerId);
            if (shiftData !== null && passenger !== null) {
                const formattedDate = moment(shiftData.date, "DD/MM/YYYY");
                const today = moment();

                if (
                    formattedDate.isAfter(today) &&
                    ride.status === status &&
                    passengerId === ride.passengerId
                ) {
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
    const driverId = req.body.driverId;
    const rideTemp = await rideService.handleGetRideById(rideId);

    const passenger = await userService.handleGetUserById(rideTemp.passengerId);
    const driver = await userService.handleGetUserById(driverId);
    const check = await rideService.checkAvailableConfirm(
        rideId,
        rideTemp.passengerId
    );
    if (check === false) {
        return res.status(401).json({ message: "Bạn đã có chuyến" });
    }
    await updateDoc(doc(ShiftCollection, rideTemp.shiftId), {
        available: false,
    });
    if (passenger.token != null) {
        await notificationService.sendNotification(
            rideTemp.passengerId,
            "request",
            {
                rideId: rideId,
                status: "accepting",
            }
        );
        const message = {
            notification: {
                title: `${driver.name} đã xác nhận chuyến của bạn!`,
                body: `${passenger.name} hãy chuẩn bị sẵn sàng để cùng đi học nhé!`,
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

    const ride = await rideService.updateStatus(rideId, "Confirm");
    // console.log(ride.shiftId)
    res.status(200).json({ message: "updated" });
};

exports.startRide = async (req, res, next) => {
    const driverName = req.body.driverName;
    const rideId = req.body.rideId;
    const passengerId = req.body.passengerId;
    const passenger = await userService.handleGetUserById(passengerId);
    console.log(passenger.token);
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
            // res.status(200).json({ message: "Successfuzlly sent message" });
        })
        .catch((error) => {
            console.log("Error sending message:");

            // res.status(500).json({ error: "Error sending message:" + error });
        });
    const ride = await rideService.startRide(rideId);

    await notificationService.sendNotification(passengerId, "startingRide", {
        rideId: rideId,
    });
    // console.log(ride.shiftId)
    res.status(200).json({ message: "start ride" });
};
exports.completedRide = async (req, res, next) => {
    const { rideId, passengerId, driverName, driverId } = req.body;
    const passenger = await userService.handleGetUserById(passengerId);
    const driverUser = await userService.handleGetUserById(driverId);
    if (passenger.token != null) {
        await notificationService.sendNotification(passengerId, "completedRide", {
            rideId: rideId, 
        });
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
    if (driverUser.token != null) {
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
    const ride = await rideService.updateStatus(rideId, "Completed");
    // console.log(ride.shiftId)
    res.status(200).json({ message: "start ride" });
};
exports.findPendingRide = async (req, res, next) => {
    try {
        const querySnapshot = await getDocs(RideCollection);
        const driverId = req.params.driverId;

        // Tạo một Map để lưu trữ các chuyến đi theo shiftId
        const rideMap = new Map();

        // Lặp qua từng document trong kết quả truy vấn
        for (const doc of querySnapshot.docs) {
            const ride = doc.data();
            ride.id = doc.id;
            const shiftData = await shiftService.handleGetShiftById(
                ride.shiftId
            );
            const passenger = await userService.handleGetUserById(
                ride.passengerId
            );
            if (shiftData !== null && passenger !== null) {
                const formattedDate = moment(shiftData.date, "DD/MM/YYYY");
                const today = moment();
                if (
                    formattedDate.isAfter(today) &&
                    ride.status === "Pending" &&
                    shiftData.driverId == driverId
                ) {
                    // Tạo key từ shiftId
                    const key = shiftData.id;
                    // Kiểm tra xem key đã tồn tại trong Map chưa
                    if (!rideMap.has(key)) {
                        // Nếu chưa tồn tại, tạo một mảng mới và thêm vào Map
                        rideMap.set(key, {
                            rides: [],
                            total: 0,
                            shiftNumber: shiftData.shiftNumber,
                            weekDay: shiftData.weekDay,
                            date: shiftData.date,
                        });
                    }

                    // Thêm chuyến đi vào mảng tương ứng trong Map và tăng số lượng
                    const rideGroup = rideMap.get(key);
                    ride.passenger = passenger;
                    ride.shift = shiftData;
                    rideGroup.rides.push(ride);
                    rideGroup.total++;
                }
            }
        }

        // Chuyển Map thành mảng và trả về
        const confirmedRides = Array.from(rideMap.values());
        res.status(200).json({ rides: confirmedRides });
    } catch (error) {
        console.error("Error finding Confirmed Rides:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.findIncommingRideDriver = async (req, res, next) => {
    try {
        const querySnapshot = await getDocs(RideCollection);
        const driverId = req.params.driverId;
        const { status } = req.body;
        // Tạo mảng để lưu trữ kết quả
        const confirmedRides = [];

        // Lặp qua từng document trong kết quả truy vấn
        for (const doc of querySnapshot.docs) {
            const ride = doc.data();
            ride.id = doc.id;
            const shiftData = await shiftService.handleGetShiftById(
                ride.shiftId
            );
            const passenger = await userService.handleGetUserById(
                ride.passengerId
            );
            const formattedDate = moment(shiftData.date, "DD/MM/YYYY");
            const today = moment();

            if (
                formattedDate.isAfter(today) &&
                ride.status === status &&
                driverId == shiftData.driverId
            ) {
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

        res.status(200).json({ ride: confirmedRides });
    } catch (error) {
        console.error("Error finding Confirmed Rides:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.checkStartingRide = async (req, res, next) => {
    const rideId = req.params.rideId;
    const ride = await rideService.handleGetRideById(rideId);
    if (ride.isStart == true) {
        return res.status(200).json({ message: "Chuyến đã bắt đầu" });
    } else {
        res.status(400).json({ message: "Chuyến chưa bắt đầu" });
    }
};
exports.passengerCancelRide = async (req, res, next) => {
    const rideId = req.params.rideId;
    await rideService.updateStatus(rideId, "Cancel");
    const ride = await rideService.handleGetRideById(rideId);
    await updateDoc(doc(ShiftCollection, ride.shiftId), {
        available: true,
    });
    const passenger = await userService.handleGetUserById(ride.passengerId);
    const message = {
        notification: {
            title: `${rideId.name} đã hủy chuyến!`,
            body: `Xin lỗi nhé, mong bạn thông cảm!`,
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
};
