const {createUser,getUser} = require('../controllers/UserController')
const express = require('express')
const router = express.Router();
// router.get("/getUser",getAllStudent)

router.route("/").post(createUser).get(getUser)

module.exports = router