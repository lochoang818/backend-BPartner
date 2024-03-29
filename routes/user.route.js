const {createUser,getUser,getUserById} = require('../controllers/user.controller')
const express = require('express')
const router = express.Router();
// router.get("/getUser",getAllStudent)

router.route("/").post(createUser).get(getUser)
router.route("/:id").get(getUserById)
module.exports = router