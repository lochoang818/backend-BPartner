const express = require("express");
const cors = require("cors");
const asyncErrors = require("express-async-errors"); // Import thư viện express-async-errors
const { getFirestore, collection, addDoc } = require("firebase/firestore/lite");
const authRoute = require("./routes/auth.route");
const UserRoute = require("./routes/user.route");
const DriverRoute = require("./routes/driver.route");
const shiftRoute = require("./routes/shift.route");
const ride = require("./routes/Ride.route");
const feedbackRoute = require("./routes/feedback.route");

const notFound = require("./middleware/notfound");
const handleError = require("./middleware/handleError");
const serviceAccount = require("./bpartner-664d2-firebase-adminsdk-xx44p-1fd9407f5d.json");

const app = express();
const admin = require("firebase-admin");

const moment = require("moment");
moment.locale('vi') 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/send", (req, res) => {
  const message = {
    notification: {
      title: "Test Notification",
      body: "This is a test notification from Firebase!",
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      screen: "/search", // Đường dẫn đến màn hình mong muốn
      messageId: "123456",
    },
    token:
      "csSocyp1RJ2sVgPehtUcAP:APA91bFXXdEY0mv-DwOx8jn43c-UPlHmUf9Z2k-6CLr-Hy_sff2IVUazL9im7avmQNeSA3cCPf6RpXXvj5rMG7AyipZMBCKfme30MV275Kp3Shnysq7eIDaJyS_ZxTrnnMIL_Pj9NTSQ",
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      res.status(200).json({ message: "Successfully sent message" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Error sending message:" + error });
    });
});

app.get("/test", (req, res) => {
//   const startDate = moment("03/04/2024", "DD/MM/YYYY");
//   const endDate = moment("10/04/2024", "DD/MM/YYYY");

//   // Tạo danh sách ngày
//   const dateList = [];
//   let currentDate = startDate.clone();

//   while (currentDate.isSameOrBefore(endDate)) {
//     dateList.push(currentDate.format("DD/MM/YYYY"));
//     currentDate.add(1, "days");
//   }

//   // In danh sách ngày
//   console.log(dateList.join("\n"));
const dateString = '03/04/2024'; // Ngày cần parse
const formattedDate = moment(dateString, 'DD/MM/YYYY');

const dayOfWeek = formattedDate.format('dddd'); // Lấy thứ
  res.status(200).json({ message: dayOfWeek });

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
app.use("/feedback", feedbackRoute);

app.use(notFound);
app.use(handleError);

app.listen(4000, () => console.log("Server is running on port 4000"));
