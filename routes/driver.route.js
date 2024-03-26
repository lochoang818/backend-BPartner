const {createDriver,findByIdUser} = require('../controllers/driver.controller')
const express = require('express')
const router = express.Router();

router.route("/").post(createDriver)
router.route("/:userId").get(findByIdUser)
module.exports = router