const confirmedRide= require('../controllers/confirmedRide.controller')
const express = require('express')
const router = express.Router();

router.route("/").post(confirmedRide.createConfirmedRide)
router.route("/:userId").get(confirmedRide.findConfirmedRide)
module.exports = router