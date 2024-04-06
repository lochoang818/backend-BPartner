const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const asyncErrors = require("express-async-errors"); // Import thư viện express-async-errors
const { getFirestore, collection, addDoc } = require("firebase/firestore/lite");
const authRoute = require("./routes/auth.route");
const UserRoute = require("./routes/user.route");
const DriverRoute = require("./routes/driver.route");
const shiftRoute = require("./routes/shift.route");
<<<<<<< HEAD
const conversationRoute = require("./routes/conversation.route");
const confirm = require("./routes/confirmedRide.route");
const messageService = require("./service/message.service");
=======
const ride = require("./routes/Ride.route");
const feedbackRoute = require("./routes/feedback.route");

>>>>>>> 8d660699a96d2f8018bab2aec734a7fcc19e116d
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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//route
app.use("/static", express.static("public"));
app.use("/user", UserRoute);
app.use("/auth", authRoute);
app.use("/driver", DriverRoute);
app.use("/shift", shiftRoute);
app.use("/conversation", conversationRoute);
app.use("/confirm", confirm);
app.use("/ride", ride);
app.use("/feedback", feedbackRoute);

app.use(notFound);
app.use(handleError);
const httpServer = createServer(app);
const io = require("socket.io")(httpServer, {});
global.userConnections = {};
io.on("connection", (socket) => {
    let userId = socket.handshake.auth.userId;
    userConnections[userId] = socket.id;
    socket.on("message", async (receiverId, conversationId, type, content) => {
        // let senderId = socket.handshake.auth.userId;
        // if (type == "text")
        //     await messageService.sendTextMessageByConversationId(
        //         conversationId,
        //         senderId,
        //         content
        //     );
    });
});
global.io = io;
httpServer.listen(4000, () => console.log("Server is running on port 4000"));
