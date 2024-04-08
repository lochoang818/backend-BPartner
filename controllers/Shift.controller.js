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
const moment = require("moment");
moment.locale("vi");

const { get } = require("../utils/emailSender.util");
const userService = require("../service/user.service");
const driverService = require("../service/driver.service");
const shiftService = require("../service/shift.service");
exports.createShift = async (req, res, next) => {
  try {
    const shiftData = req.body;
    const { driverId, shiftNumber, type } = shiftData;

    if (type === "both") {
      const schoolShiftQuery = query(
        ShiftCollection,
        where("type", "==", "school"),
        where("driverId", "==", driverId.toString()),
        where("shiftNumber", "==", shiftNumber.toString()),
        where("date", "==", shiftData.date.toString())
      );

      const homeShiftQuery = query(
        ShiftCollection,
        where("type", "==", "home"),
        where("driverId", "==", driverId.toString()),
        where("shiftNumber", "==", shiftNumber.toString()),
        where("date", "==", shiftData.date.toString())
      );

      const schoolQuerySnapshot = await getDocs(schoolShiftQuery);
      const homeQuerySnapshot = await getDocs(homeShiftQuery);

      if (schoolQuerySnapshot.empty && homeQuerySnapshot.empty) {
        const formattedDate = moment(shiftData.date.toString(), "DD/MM/YYYY");
        const dayOfWeek = formattedDate.format("dddd"); // Lấy thứ
        shiftData.weekDay = dayOfWeek;
        shiftData.auto
        // Add school shift if not exists
        const schoolShiftData = { ...shiftData, type: "school",available:true };
        await addDoc(ShiftCollection, schoolShiftData);
        const homeShiftData = { ...shiftData, type: "home",available:true };
        await addDoc(ShiftCollection, homeShiftData);
      } else {
        return res
          .status(400)
          .json({ message: "You cannot add the same shift" });
      }
    } else {
      const q = query(
        ShiftCollection,
        where("type", "==", type.toString()),
        where("driverId", "==", driverId.toString()),
        where("shiftNumber", "==", shiftNumber.toString()),
        where("date", "==", shiftData.date.toString())
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return res
          .status(400)
          .json({ message: "You cannot add the same shift" });
      }

      const formattedDate = moment(shiftData.date.toString(), "DD/MM/YYYY");
      const dayOfWeek = formattedDate.format("dddd"); // Lấy thứ
      shiftData.weekDay = dayOfWeek;
      shiftData.available=true
      await addDoc(ShiftCollection, shiftData);
    }

    return res.status(201).json({ message: "Shift added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.autoMatching = async (req, res, next) => {
  const userId = req.params.userId;
  const user = await userService.handleGetUserById(userId)
  const { gender, faculty, shiftNumber, date, type } = req.body;
  console.log( req.body)

  const q = query(
    ShiftCollection,
    where("type", "==", type.toString()),
    where("available", "==", true),
    where("auto", "==", true),
    where("shiftNumber", "==", shiftNumber.toString()),
    where("date", "==", date.toString())
  );

  const querySnapshot = await getDocs(q);

  const shifts = [];

  for (const doc of querySnapshot.docs) {
    const shiftData = doc.data();
    shiftData.driver = await driverService.handleGetDriverById(shiftData.driverId);
    shiftData.driver.user = await userService.handleGetUserById(
      shiftData.driver.userId
    );
    if (
      gender ===shiftData.driver.user.gender &&
      userId !== shiftData.driver.userId &&
      (faculty === "" || faculty === shiftData.driver.user.faculty)
    ) {
      if (  user.gender ===shiftData.condition.gender &&
       
        (user.faculty === "" || user.faculty === shiftData.condition.faculty)) {
          shiftData.id = doc.id;
          shifts.push(shiftData);
      }
    }
   
  }
  if(shifts.length===0){
    return res.status(400).json({ message:"No shift available" });

  }
  return res.status(201).json({ shifts: shifts });

}
exports.findAllShifts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { gender, faculty, shiftNumber, date, type } = req.body;
    console.log(req.body)
    const q = query(
      ShiftCollection,
      where("type", "==", type.toString()),
      where("available", "==", true),
      where("auto", "==", false),

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
        userId !== shiftData.driver.userId  &&
        (faculty==="" || faculty === shiftData.driver.user.faculty)
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
    res.status(200).json({ shift: shiftData });
  } else {
    res.status(400).json({ message: "Failed to fetch shift by id" });
  }
};
exports.createShiftByCalendar = async (req, res, next) => {
  try {
    moment.locale("en"); // Gán locale thành tiếng Anh cho so sánh
    console.log("loc")
    const requestData = req.body;
    const { driverId, start, end, location, data,auto,condition } = requestData;

    const startDate = moment(start, "DD/MM/YYYY");
    const endDate = moment(end, "DD/MM/YYYY"); // Thêm 6 ngày cho đến thứ 7

    const shifts = [];
    const dataObject = JSON.parse(data);

    // Tạo các ca làm việc từ thứ 2 đến thứ 7
    for (
      let currentDate = startDate.clone();
      currentDate.isSameOrBefore(endDate);
      currentDate.add(1, "day")
    ) {
      const dayOfWeek = currentDate.format("dddd").toLowerCase(); // Lấy tên của ngày trong tuần
      
      // Kiểm tra xem ngày hiện tại có trong dữ liệu gửi lên không
      if (dataObject.hasOwnProperty(dayOfWeek)) {
        // const prop =dayOfWeek
        const { start, end } =dataObject[dayOfWeek]
        const formattedDate = currentDate.format("D/M/YYYY"); // Sử dụng "D" và "M" để loại bỏ số 0 phía trước của ngày và tháng
        if (start !== "") {
          const schoolShift = {
            available:true,
            condition:condition,
            auto:auto,
            driverId,
            shiftNumber: start,
            date: currentDate.format("DD/MM/YYYY"),
            location,
            type: "school",
            date:formattedDate,
          };
          shifts.push(schoolShift);
        }

        if (end !== "") {
          const homeShift = {
            available:true,
            auto:auto,
            condition:condition,

            driverId,
            shiftNumber: end,
            date: currentDate.format("DD/MM/YYYY"),
            location,
            type: "home",
            date:formattedDate,

          };
          shifts.push(homeShift);
        }
      }
    }
    moment.locale("vi");

    // Thêm các ca làm việc vào cơ sở dữ liệu
    for (const shift of shifts) {
      // Thêm shift vào cơ sở dữ liệu ở đây
      const formattedDate = currentDate.format("D/M/YYYY"); // Sử dụng "D" và "M" để loại bỏ số 0 phía trước của ngày và tháng
      const dayOfWeek = formattedDate.format("dddd"); // Lấy thứ
      shift.weekDay = dayOfWeek;
      const q = query(
        ShiftCollection,
        where("type", "==", shift.type.toString()),
        where("driverId", "==", shift.driverId.toString()),
        where("shiftNumber", "==", shift.shiftNumber.toString()),
        where("date", "==", shift.date.toString())
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return res
          .status(400)
          .json({ message: "You cannot add the same shift" });
      }
      await addDoc(ShiftCollection, shift);
    }

    return res.status(201).json({ message: "Shifts added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
