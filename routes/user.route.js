const {
    createUser,
    getUser,
    getUserById,
    updateUserInfo,
} = require("../controllers/user.controller");
const express = require("express");
const router = express.Router();
const upload = require("../utils/multer.util");

// router.get("/getUser",getAllStudent)

router.route("/").post(createUser).get(getUser);
router.route("/:id").get(getUserById);
router.put("/:id", upload.single("avatar"), updateUserInfo);
module.exports = router;
