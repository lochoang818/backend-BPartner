const confirmedRide = require("../controllers/ride.controller");
const express = require("express");
const router = express.Router();

router.route("/").post(confirmedRide.createRide);
router.route("/find/:userId").post(confirmedRide.findIncommingRide);
router.route("/confirm").post(confirmedRide.confirmRide);
router.route("/start").post(confirmedRide.startRide);
router.route("/findPending/:driverId").post(confirmedRide.findPendingRide);
router.route("/find/:driverId").patch(confirmedRide.findIncommingRideDriver);
router.route("/autoConfirm").post(confirmedRide.autoConfirm);
router.route("/check/:rideId").get(confirmedRide.checkStartingRide);
router.route("/complete").post(confirmedRide.completedRide);
router.route("/history/user").post(confirmedRide.getAllRidePassenger);
router.route("/history/driver").post(confirmedRide.getAllRidePassenger);

module.exports = router;
