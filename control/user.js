const connection = require("../mysql_connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// @desc  회원가입
// @route POST/api/v1/movie/
// @parameters   name, password
exports.createUser = async (req, res, next) => {
  let name = req.body.name;
  let password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 8);

  let query = `insert into movie_user(user_name,user_password) values ?`;
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

  query = `insert into movie_token (token, user_id) values(?,?)`;
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "성공" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};
