const express = require("express");
const cors = require("cors");
const asyncErrors = require("express-async-errors"); // Import thư viện express-async-errors
const { getFirestore, collection, addDoc } = require("firebase/firestore/lite");
const authRoute = require("./routes/auth.route");
const UserRoute = require("./routes/user.route");
const DriverRoute = require("./routes/driver.route");
const shiftRoute = require("./routes/shift.route");
const ride = require("./routes/Ride.route");

const notFound = require("./middleware/notfound");
const handleError = require("./middleware/handleError");
const serviceAccount = require('./bpartner-664d2-firebase-adminsdk-xx44p-1fd9407f5d.json');

const app = express();
const admin = require('firebase-admin');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
app.post("/send", (req, res) => {
    const message = {
        notification: {
            title: 'Test Notification',
            body: 'This is a test notification from Firebase!'
        },
        data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            screen: '/search', // Đường dẫn đến màn hình mong muốn
            messageId: '123456'
          },
        token: 'e5Rf5xI-RkmlfUiKqhC5IT:APA91bEfxHLMGS3E0znq_RZ1aU2GIFWhQclD0fiSpPqxAhljrzkAhIMoU3wHB7I9qa_nfWG5Sjekqz4g0wQpn2x6Cd76NAN9xW2hW6rn1m63wCyPXESdyNJ8CJZ6tTmtntCp_iaxtc7S'
    };
    admin.messaging().send(message)
        .then((response) => {
            res.status(200).json({ message: 'Successfully sent message' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error sending message:'+error });
        });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//route
app.use("/user", UserRoute);
app.use("/auth", authRoute);
app.use("/driver", DriverRoute);
app.use("/shift", shiftRoute);
app.use("/ride", ride);

app.use(notFound);
app.use(handleError);

app.listen(4000, () => console.log("Server is running on port 4000"));
