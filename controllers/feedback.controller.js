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
  FeedbackCollection,
  DriverCollection,
  UserCollection,
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
    const user = await userService.handleGetUserById(userId);
    // Tính tổng số điểm từ các phản hồi trước đó
    let totalPoints = 0;
    let numberOfFeedbacks = 0;

    // Lấy danh sách các phản hồi trước đó từ tài xế
    const feedbacks = driver.feedbacks || [];

    // Tính tổng số điểm từ các phản hồi trước đó
    feedbacks.forEach((feedback) => {
      totalPoints += parseFloat(feedback.rate);
      numberOfFeedbacks++;
    });

    // Thêm phản hồi mới vào mảng feedbacks
    feedbacks.push({ content, rate, name: user.name, avatar: user.avatar });

    // Tính điểm trung bình
    const averageRating = (
      (totalPoints + parseFloat(rate)) /
      (numberOfFeedbacks + 1)
    ).toFixed(1);

    // Cập nhật điểm trung bình của tài xế trong cơ sở dữ liệu
    await updateDoc(doc(DriverCollection, driverId), {
      credit: averageRating,
      feedbacks: feedbacks, // Cập nhật lại mảng feedbacks trong tài xế
    });

    res.status(201).json({ message: "Feedback added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createFeedbackPassenger = async (req, res, next) => {
  const { passengerId, rate, content, driverId } = req.body;

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
    feedbacks.forEach((feedback) => {
      totalPoints += parseFloat(feedback.rate);
      numberOfFeedbacks++;
    });

    // Thêm phản hồi mới vào mảng feedbacks
    feedbacks.push({
      content,
      rate,
      name: driverUser.name,
      avatar: driverUser.avatar,
    });

    // Tính điểm trung bình
    const averageRating = (
      (totalPoints + parseFloat(rate)) /
      (numberOfFeedbacks + 1)
    ).toFixed(1);

    // Cập nhật điểm trung bình của tài xế trong cơ sở dữ liệu
    await updateDoc(doc(UserCollection, passengerId), {
      credit: averageRating ?? 0,
      feedbacks: feedbacks, // Cập nhật lại mảng feedbacks trong tài xế
    });

    res.status(201).json({ message: "Feedback added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createFeedback = async (req, res, next) => {
  const { feedbackerId, recipientId, rate, content, rideId } = req.body;

  try {
    // Lấy thông tin của hành khách và tài xế
    const feedbacker = await userService.handleGetUserById(feedbackerId);
    const recipient = await userService.handleGetUserById(recipientId);

    // Lấy tất cả các phản hồi của hành khách từ collectionFeedback
    const feedbackDocs = await getDocs(
      query(FeedbackCollection, where("userId", "==", recipientId))
    );

    let totalPoints = 0;
    let numberOfFeedbacks = 0;

    feedbackDocs.forEach((doc) => {
      const data = doc.data();
      totalPoints += parseFloat(data.rate);
      numberOfFeedbacks++;
    });

    // Thêm phản hồi mới vào mảng feedbacks

    // Tính điểm trung bình
    const averageRating = (
      (totalPoints + parseFloat(rate)) /
      (numberOfFeedbacks + 1)
    ).toFixed(1);
    await addDoc(FeedbackCollection, {
      content,
      rate,
      name: feedbacker.name,
      avatar: feedbacker.avatar,
      userId: recipientId,
      rideId: rideId,
    });

    // Cập nhật điểm trung bình của hành khách trong cơ sở dữ liệu
    await updateDoc(doc(UserCollection, recipientId), {
      credit: averageRating ?? 0,
    });

    res.status(201).json({ message: "Feedback added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getFeedback = async (req, res, next) => {
  const id = req.params.id;
  try {
    // Lấy thông tin của hành khách và tài xế

    // Lấy tất cả các phản hồi của hành khách từ collectionFeedback
    const feedbackDocs = await getDocs(
      query(FeedbackCollection, where("userId", "==", id))
    );

    const feedbacks = [];
    feedbackDocs.forEach((doc) => {
      const data = doc.data();
      feedbacks.push(data);
    });

    res
      .status(201)
      .json({ message: "Get Feedback successfully", feedbacks: feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
