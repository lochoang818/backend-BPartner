const confirmedRide= require('../controllers/ride.controller')
const express = require('express')
const router = express.Router();

router.route("/").post(confirmedRide.createConfirmedRide)
router.route("/:userId").get(confirmedRide.findIncommingRide)
module.exports = router