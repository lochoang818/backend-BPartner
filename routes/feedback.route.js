const FeedbackController = require('../controllers/feedback.controller')
const express = require('express')
const router = express.Router();

// router.route("/driver").post(FeedbackController.createFeedbackDriver)
// router.route("/passenger").post(FeedbackController.createFeedbackPassenger)
router.route("/").post(FeedbackController.createFeedback)
router.route("/:id").get(FeedbackController.getFeedback)

module.exports = router