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
    FeedbackCollection, DriverCollection, UserCollection
  } = require("../firestore/collection");
  const { get } = require("../utils/emailSender.util");
  const userService = require("../service/user.service");
  const shiftService = require("../service/shift.service");
  const driverService = require("../service/driver.service");
  const feedbackService = require("../service/feedback.service");
  
  const admin = require("firebase-admin");
  exports.createFeedbackDriver = async (req, res, next) => {
    const { userId, driverId, rate, content } = req.body;

    try {
        // Lấy thông tin của tài xế
        const driver = await driverService.handleGetDriverById(driverId);
        const user = await userService.handleGetUserById(userId)
        // Tính tổng số điểm từ các phản hồi trước đó
        let totalPoints = 0;
        let numberOfFeedbacks = 0;

        // Lấy danh sách các phản hồi trước đó từ tài xế
        const feedbacks = driver.feedbacks || [];

        // Tính tổng số điểm từ các phản hồi trước đó
        feedbacks.forEach(feedback => {
            totalPoints += parseFloat(feedback.rate);
            numberOfFeedbacks++;
        });

        // Thêm phản hồi mới vào mảng feedbacks
        feedbacks.push({ content, rate  ,           name: user.name,
        });

        // Tính điểm trung bình
        const averageRating = ((totalPoints + parseFloat(rate)) / (numberOfFeedbacks + 1)).toFixed(1);

        // Cập nhật điểm trung bình của tài xế trong cơ sở dữ liệu
        await updateDoc(doc(DriverCollection, driverId), {
            credit: averageRating,
            feedbacks: feedbacks ,// Cập nhật lại mảng feedbacks trong tài xế
        });

        res.status(201).json({ message: "Feedback added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.createFeedbackPassenger = async (req, res, next) => {
    const { passengerId, rate, content,driverId } = req.body;

    try {
        // Lấy thông tin của tài xế
        const passenger = await userService.handleGetUserById(passengerId);
        const driverUser = await userService.handleGetUserById(driverId);

        // Tính tổng số điểm từ các phản hồi trước đó
        let totalPoints = 0;
        let numberOfFeedbacks = 0;

        // Lấy danh sách các phản hồi trước đó từ tài xế
        const feedbacks = passenger.feedbacks || [];

        // Tính tổng số điểm từ các phản hồi trước đó
        feedbacks.forEach(feedback => {
            totalPoints += parseFloat(feedback.rate);
            numberOfFeedbacks++;
        });

        // Thêm phản hồi mới vào mảng feedbacks
        feedbacks.push({ content, rate,name: driverUser.name});

        // Tính điểm trung bình
        const averageRating = ((totalPoints + parseFloat(rate)) / (numberOfFeedbacks + 1)).toFixed(1);

        // Cập nhật điểm trung bình của tài xế trong cơ sở dữ liệu
        await updateDoc(doc(UserCollection, passengerId), {
            credit: averageRating??0,
            feedbacks: feedbacks // Cập nhật lại mảng feedbacks trong tài xế
        });

        res.status(201).json({ message: "Feedback added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

