// collection.js
const { getFirestore, collection } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");
const app = require("../config");

// Get Firestore instance
const db = getFirestore(app);
const auth = getAuth(app);

// Export your collections
const UserCollection = collection(db, "Users");
const ConversationCollection = collection(db, "Conversations");
const DriverCollection = collection(db, "Drivers");
const ShiftCollection = collection(db, "Shifts");
const MessageCollection = collection(db, "Messages");
const RideCollection = collection(db, "Ride");
const FeedbackCollection = collection(db, "Feedbacks");
const NotificationCollection = collection(db, "Notifications");
module.exports = {
    UserCollection,
    DriverCollection,
    db,
    ShiftCollection,
    RideCollection,
    FeedbackCollection,
    auth,
    ConversationCollection,
    NotificationCollection,
    MessageCollection,
};
