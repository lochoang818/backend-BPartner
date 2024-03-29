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
const userService = require('../service/user.service')
const driverService = require('../service/driver.service')

exports.createShift = async (req, res, next) => {
  try {
    const shiftData = req.body;
    const { driverId, shiftNumber, date } = req.body;

    const q = query(
      ShiftCollection,
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
    const { gender, faculty, shiftNumber, date } = req.body;
    const q = query(
      ShiftCollection,
      where("shiftNumber", "==", shiftNumber.toString()),
      where("date", "==", date.toString())
    );
   

    const querySnapshot = await getDocs(q);
    const shifts = [];
    for (const doc of querySnapshot.docs) {
      const shiftData = doc.data(); // Truy cập dữ liệu của tài liệu
      shiftData.driver = await driverService.handleGetDriverById(shiftData.driverId);
      shiftData.driver.user = await userService.handleGetUserById(shiftData.driver.userId)
      console.log(shiftData.driver.user.gender);
      if (
        gender === shiftData.driver.user.gender
        // (faculty==="" || faculty === shiftData.driver.user.faculty)
      ) {

        shifts.push(shiftData)
      }
    }

    // Trả về danh sách tất cả các ca
    res.status(201).json({ shifts: shifts });
  } catch (error) {
    return res.status(401).json({ message: "Bad request" });
    // next(error); // Xử lý lỗi nếu có
  }
};


