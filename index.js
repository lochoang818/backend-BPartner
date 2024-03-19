const express = require("express");
const cors = require("cors");
const asyncErrors = require('express-async-errors'); // Import thư viện express-async-errors
const { getFirestore, collection, addDoc } = require("firebase/firestore/lite");
const UserRoute = require('./route/UserRoute')
const notFound = require('./middleware/notfound')
const handleError = require('./middleware/handleError')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());


app.use("/user",UserRoute)
app.use(notFound)
app.use(handleError)

app.listen(4000, () => console.log("Server is running on port 4000"));
