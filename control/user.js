const connection = require("../mysql_connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @desc  회원가입
// @route POST/api/v1/user/
// @parameters   name, password
exports.createUser = async (req, res, next) => {
  let name = req.body.name;
  let password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 8);

  let query = `insert into sns_user(user_name,user_password) values (?,?)`;
  let data = [name, hashedPassword];
  let user_id;

  try {
    [rows] = await connection.query(query, data);
    user_id = rows.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      res
        .status(400)
        .json({ success: false, errno: e.errno, message: e.message });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

  query = `insert into sns_token (token, user_id) values(?,?)`;
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "성공" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// 로그인
// POST/api/v1/user/login
// name, password
exports.loginUser = async (req, res, next) => {
  let name = req.body.name;
  let password = req.body.password;

  let query = `select * from sns_user where user_name = ?`;
  let data = [name];

  try {
    [rows] = await connection.query(query, data);
    let storedPassword = rows[0].user_password;

    let match = await bcrypt.compare(password, storedPassword);

    if (!match) {
      res
        .status(400)
        .json({ success: false, result: match, message: "비밀번호 틀림" });
      return;
    }

    let token = jwt.sign({ id: rows[0].id }, process.env.ACCESS_TOKEN_SECRET);
    query = `insert into sns_token(user_id,token) values(?,?)`;
    data = [rows[0].id, token];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true, result: match, token: token });
    } catch (e) {
      res
        .status(502)
        .json({ success: false, error: e, message: "토큰저장실패" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     로그아웃   api : db에서 해당유저의 현재 토큰값을 삭제
// @url      POST /api/v1/user/allLogout
// @request
// @response
exports.allLogout = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from sns_token where user_id = ${user_id}`;

  console.log(user_id);
  try {
    [result] = await connection.query(query);
    console.log(result);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
