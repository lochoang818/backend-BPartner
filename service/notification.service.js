const {
    getFirestore,
    collection,
    addDoc,
    query,
    getDocs,
    where,
    getDoc,
    documentId,
    updateDoc,
    doc,
    orderBy,
    Timestamp,
    serverTimestamp,
    limit,
} = require("firebase/firestore");
const {
    NotificationCollection,
    ShiftCollection,
    UserCollection,
    DriverCollection,
    RideCollection,
} = require("../firestore/collection");

exports.getNotificationsByReceiverId = async (receiverId) => {
    let querySnap = await getDocs(
        query(
            NotificationCollection,
            where("receiverId", "==", receiverId),
            orderBy("createdAt", "desc")
        )
    );
    console.log(">?>??");
    console.log(querySnap.docs.length);
    let result = [];
    for (const d of querySnap.docs) {
        let notification = d.data();
        let ride = await getDoc(doc(RideCollection, notification.data.rideId));
        let shift = await getDoc(doc(ShiftCollection, ride.data().shiftId));
        notification.data.shift = shift.data();
        let driver = await getDoc(doc(DriverCollection, shift.data().driverId));
        driver = await getDoc(doc(UserCollection, driver.data().userId));
        let passenger = await getDoc(
            doc(UserCollection, ride.data().passengerId)
        );
        notification.data.driver = driver.data();
        notification.data.driver.id = driver.id;
        notification.data.ride = ride.data();
        notification.data.passenger = passenger.data();
        notification.data.passenger.id = passenger.id;
        notification.id = d.id;
        result.push(notification);
    }

    return result;
};

exports.getNotificationById = async (id) => {
    let notificationDoc = await getDoc(doc(NotificationCollection, id));
    let notification = notificationDoc.data();
    let ride = await getDoc(doc(RideCollection, notification.data.rideId));
    let shift = await getDoc(doc(ShiftCollection, ride.data().shiftId));
    notification.data.shift = shift.data();
    let driver = await getDoc(doc(DriverCollection, shift.data().driverId));
    driver = await getDoc(doc(UserCollection, driver.data().userId));
    let passenger = await getDoc(doc(UserCollection, ride.data().passengerId));
    notification.data.passenger = passenger.data();
    notification.data.driver = driver.data();
    notification.data.ride = ride.data();
    notification.id = notificationDoc.id;
    return notification;
};

exports.sendNotification = async (receiverId, type, data) => {
    try {
        let notification = {
            receiverId: receiverId,
            type: type,
            data: data,
            createdAt: Timestamp.now(),
        };
        let ref = await addDoc(NotificationCollection, notification);
        let doc = await getDoc(ref);
        let updated = await this.getNotificationById(doc.id);
        global.io
            .to(global.userConnections[receiverId])
            .emit("notification", updated);
        return updated;
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.confirmNotification = async (id) => {
    let ref = doc(NotificationCollection, id);
    let d = await getDoc(ref);
    let data = d.data().data;
    if (!d.data().type.startsWith("confirm")) return false;
    data.status = "confirmed";
    await updateDoc(ref, { data: data });
    return true;
};
