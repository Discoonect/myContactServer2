const connection = require("../mysql_connection");
const path = require("path");

exports.photoUpload = async (req, res, next) => {
  let user_id = req.user.id;

  if (!user_id || !req.files) {
    res.status(400).json({ message: "로그인 또는 사진을 업로드 해주세요." });
    return;
  }

  const photo = req.files.photo;

  if (photo.mimetype.startsWith("image") == false) {
    res.status(401).json();
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(403).json({ message: "파일이 너무 커" });
    return;
  }

  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  let query = `insert into sns_photo(photo,user_id) values(?,?)`;
  let data = [photo.name, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
