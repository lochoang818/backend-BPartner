const confirmedRide = require("../controllers/ride.controller");
const express = require("express");
const router = express.Router();

router.route("/").post(confirmedRide.createRide);
router.route("/find/:userId").post(confirmedRide.findIncommingRide);
router.route("/confirm").post(confirmedRide.confirmRide);
router.route("/start").post(confirmedRide.startRide);
router.route("/findPending/:driverId").post(confirmedRide.findPendingRide);

module.exports = router;
