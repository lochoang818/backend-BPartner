const controller = require('../controllers/Shift.controller')
const express = require('express')
const router = express.Router();

router.route("/").post(controller.createShift)
router.route("/find").post(controller.findAllShifts)

module.exports = router