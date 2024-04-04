const FeedbackController = require('../controllers/feedback.controller')
const express = require('express')
const router = express.Router();

router.route("/driver").post(FeedbackController.createFeedbackDriver)
router.route("/passenger").post(FeedbackController.createFeedbackPassenger)

module.exports = router