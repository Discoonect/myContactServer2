const express = require("express");
const auth = require("../middleware/auth");

const { createUser, loginUser, allLogout } = require("../control/user");

const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(auth, loginUser);
router.route("/logout").post(auth, allLogout);

module.exports = router;
