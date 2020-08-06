const express = require("express");
const auth = require("../middleware/auth");

const {
  photoUpload,
  getPhoto,
  updatePhoto,
  deletePost,
  getFriendsPost,
} = require("../control/upload_photo");

const router = express.Router();

router.route("/").post(auth, photoUpload).get(auth, getPhoto);
router.route("/:post_id").put(auth, updatePhoto).delete(auth, deletePost);
router.route("/getFriendPost").get(auth, getFriendsPost);

module.exports = router;
