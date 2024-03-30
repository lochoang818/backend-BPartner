const controller = require('../controllers/Shift.controller')
const express = require('express')
const router = express.Router();

router.route("/").post(controller.createShift)
router.route("/find/:userId").post(controller.findAllShifts)
router.route("/detail/:shiftId").get(controller.detailShift)
module.exports = router