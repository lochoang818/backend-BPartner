const confirmedRide = require("../controllers/ride.controller");
const express = require("express");
const router = express.Router();

router.route("/").post(confirmedRide.createRide);
router.route("/:userId").get(confirmedRide.findIncommingRide);
router.route("/confirm").post(confirmedRide.confirmRide);

module.exports = router;
