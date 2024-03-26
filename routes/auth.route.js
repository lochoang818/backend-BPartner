const controller = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();

router.post("/register", controller.register);
router.get("/activate", controller.activate);

module.exports = router;