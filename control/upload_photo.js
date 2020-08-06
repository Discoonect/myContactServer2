const connection = require("../mysql_connection");
const path = require("path");

// 사진올리기
// req.files.사진
exports.photoUpload = async (req, res, next) => {
  let user_id = req.user.id;
  let comment = req.body.comment;

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

  photo.name = `photo_${user_id}_${Date.now()}_${path.parse(photo.name).ext}`;
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  let query = `insert into sns_photo(photo,user_id,comment) values(?,?,?)`;
  let data = [photo.name, user_id, comment];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 내가 쓴 게시글
exports.getPhoto = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json({ message: "잘못된 파라미터 입니다", error: error });
    return;
  }

  let query = `select * from sns_photo where user_id =? limit ?,?`;
  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// 포스팅 업데이트
// PUT  /api/v1/upload:post_id
exports.updatePhoto = async (req, res, next) => {
  let post_id = req.params.post_id;
  let user_id = req.user.id;
  let photo = req.files.photo;
  let comment = req.body.comment;

  // 이 사람의 포스팅을 변경하는것인지, 확인한다.
  let query = "select * from sns_photo where id = ?";
  let data = [post_id];

  try {
    [rows] = await connection.query(query, data);
    console.log(rows);
    // 다른사람이 쓴 글을, 이 사람이 바꾸려고 하면, 401로 보낸다.
    if (rows[0].user_id != user_id) {
      req.status(401).json();
      return;
    }
  } catch (e) {
    res.status(502).json({ message: "1" });
    return;
  }

  if (photo.mimetype.startsWith("image") == false) {
    res.stats(400).json({ message: "사진 파일 아닙니다." });
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.stats(400).json({ message: "파일 크기가 너무 큽니다." });
    return;
  }

  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  query = "update sns_photo set photo = ? , comment = ? where id = ? ";
  data = [photo.name, comment, post_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, result: result });
    return;
  } catch (e) {
    res.status(501).json({ error: e });
    return;
  }
};

// @desc    내 포스팅 삭제하기 (1개)
// @route   DELETE /api/v1/posts/:post_id
// @request post_id, user_id(auth)
// @response  success
exports.deletePost = async (req, res, next) => {
  let post_id = req.params.post_id;
  let user_id = req.user.id;

  if (!post_id || !user_id) {
    res.status(400).json({ message: "파라미터가 잘못 되었습니다." });
    return;
  }

  // 이 사람의 포스팅이 맞는지 확인하는 코드 // 시작
  let query = "select * from sns_photo where id = ? ";
  let data = [post_id];

  let photo_url;
  try {
    [rows] = await connection.query(query, data);
    // 다른사람 포스팅이면, 401로 보낸다.
    if (rows[0].user_id != user_id) {
      req.status(401).json();
      return;
    }
    photo_url = rows[0].photo;
  } catch (e) {
    res.status(500).json();
    return;
  }
  // 이 사람의 포스팅이 맞는지 확인하는 코드 // 끝.

  query = "delete from sns_photo where id = ? ";
  data = [post_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
    return;
  } catch (e) {
    res.status(500).json();
    return;
  }
};

// @desc    내 친구들의 포스팅 불러오기 (25개씩)
// @route   GET /api/v1/posts?offset=0&limit=25
// @request user_id(auth)
// @response  success, items[], cnt
exports.getFriendsPost = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json();
    return;
  }

  let query =
    "select sp.* \
  from sns_follow as sf \
  join sns_photo as sp \
  on sf.friend_user_id = sp.user_id \
  where sf.user_id = ? \
  order by sp.created_at desc \
  limit ?, ? ";

  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
    return;
  } catch (e) {
    res.status(500).json();
    return;
  }
};
