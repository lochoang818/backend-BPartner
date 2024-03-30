const express = require("express");
const cors = require("cors");
const asyncErrors = require("express-async-errors"); // Import thư viện express-async-errors
const { getFirestore, collection, addDoc } = require("firebase/firestore/lite");
const authRoute = require("./routes/auth.route");
const UserRoute = require("./routes/user.route");
const DriverRoute = require("./routes/driver.route");
const shiftRoute = require("./routes/shift.route");
const confirm = require("./routes/confirmedRide.route");

const notFound = require("./middleware/notfound");
const handleError = require("./middleware/handleError");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//route
app.use("/user", UserRoute);
app.use("/auth", authRoute);
app.use("/driver", DriverRoute);
app.use("/shift", shiftRoute);
app.use("/confirm", confirm);

app.use(notFound);
app.use(handleError);

app.listen(4000, () => console.log("Server is running on port 4000"));
