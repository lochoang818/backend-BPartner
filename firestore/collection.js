// collection.js
const { getFirestore, collection } = require("firebase/firestore");
const app = require("../config");

// Get Firestore instance
const db = getFirestore(app);

// Export your collections
const UserCollection = collection(db, "Users");
const ConversationCollection = collection(db, "Conversations");
const DriverCollection = collection(db, "Drivers");
const ShiftCollection = collection(db, "Shifts");
const MessageCollection = collection(db, "Messages");
const RideCollection = collection(db, "Ride");
const FeedbackCollection = collection(db, "Feedbacks");
module.exports = {
    UserCollection,
    DriverCollection,
    db,
    ShiftCollection,
    RideCollection,
    FeedbackCollection,

    ConversationCollection,
    MessageCollection,
};
