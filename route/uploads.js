const express = require("express");
const auth = require("../middleware/auth");

const { photoUpload } = require("../control/upload_photo");

const router = express.Router();

router.route("/").post(auth, photoUpload);

module.exports = router;
