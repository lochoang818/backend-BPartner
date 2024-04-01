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
const { get } = require("../utils/emailSender.util");
const userService = require("../service/user.service");
const driverService = require("../service/driver.service");
const shiftService = require("../service/shift.service");

exports.createShift = async (req, res, next) => {
  try {
    const shiftData = req.body;
    const { driverId, shiftNumber, date } = req.body;

    const q = query(
      ShiftCollection,
      where("trip", "==", shiftData.trip.toString()),

      where("driverId", "==", shiftData.driverId.toString()),
      where("shiftNumber", "==", shiftData.shiftNumber.toString()),
      where("date", "==", shiftData.date.toString())
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return res.status(400).json({ message: "You cannot add a same shift" });
    }
    // shiftData.driver = await getDriverById(driverId);
    await addDoc(ShiftCollection, shiftData);
    res.status(201).json({ message: "Shift added" });
  } catch (error) {
    throw new Error("Bad request");
  }
};
exports.findAllShifts = async (req, res, next) => {
  try {
    console.log("aaa")
    const userId = req.params.userId;
    const { gender, faculty, shiftNumber, date,trip } = req.body;
    const q = query(
      ShiftCollection,
      where("trip", "==", trip.toString()),

      where("shiftNumber", "==", shiftNumber.toString()),
      where("date", "==", date.toString())
    );

    const querySnapshot = await getDocs(q);
    const shifts = [];
    for (const doc of querySnapshot.docs) {
      const shiftData = doc.data(); // Truy cập dữ liệu của tài liệu
      shiftData.driver = await driverService.handleGetDriverById(
        shiftData.driverId
      );
      shiftData.driver.user = await userService.handleGetUserById(
        shiftData.driver.userId
      );

      if (
        gender === shiftData.driver.user.gender &&
        userId !== shiftData.driver.userId
        // (faculty==="" || faculty === shiftData.driver.user.faculty)
      ) {
        shiftData.id = doc.id;
        shifts.push(shiftData);
      }
    }

    // Trả về danh sách tất cả các ca
    res.status(201).json({ shifts: shifts });
  } catch (error) {
    return res.status(401).json({ message: "Bad request" });
    // next(error); // Xử lý lỗi nếu có
  }
};
exports.detailShift = async (req, res, next) => {
  const id = req.params.shiftId;
  const shiftData = await shiftService.handleGetShiftById(id);
  if (shiftData) {
    shiftData.driver = await driverService.handleGetDriverById(
      shiftData.driverId
    );
    shiftData.driver.user = await userService.handleGetUserById(
      shiftData.driver.userId
    );
    res.status(200).json({ shift:shiftData });
  } else {
    res.status(400).json({ message: "Failed to fetch shift by id" });
  }
};
