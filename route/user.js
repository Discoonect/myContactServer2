const express = require("express");
const auth = require("../middleware/auth");

const { createUser } = require("../control/user");

const router = express.Router();

router.route("/").post(createUser);

module.exports = router;
