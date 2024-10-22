const { Timestamp } = require("firebase/firestore");
const notificationService = require("../service/notification.service");
require("express-async-errors"); // Import thư viện express-async-errors

exports.getNotificationsByReceiverId = async (req, res) => {
    let receiverId = req.query.receiverId;
    let result = await notificationService.getNotificationsByReceiverId(
        receiverId
    );
    return res.json(result);
};

exports.sendNotification = async (req, res) => {
    let { receiverId, type, rideId, status } = req.body;
    if (!receiverId || !type || !rideId) {
        return res.status(401).json({ message: "Missing data" });
    }

    let data = { rideId: rideId };
    if (status) data.status = status;
    let result = await notificationService.sendNotification(
        receiverId,
        type,
        data
    );
    return res.json(result);
};

exports.confirmNotification = async (req, res) => {
    let id = req.params.id;
    let state = await notificationService.confirmNotification(id);
    if (!state) return res.status(401).json({ success: false });
    res.json({ success: true });
};
