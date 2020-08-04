const jwt = require("jsonwebtoken");
const connection = require("../mysql_connection");

const auth = async (req, res, next) => {
  let token;

  try {
    token = req.header("Authorization").replace("Bearer ", "");
  } catch (e) {
    res.status(401).json({ error: e, message: "Please authenticate!" });
    return;
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  let user_id = decoded.id;

  let query =
    "select su.id, su.user_name,su.created_at,st.token \
      from sns_token as st \
      join sns_user as su \
      on st.user_id = su.id \
      where st.user_id = ? and st.token = ? ";
  let data = [user_id, token];

  try {
    [rows] = await connection.query(query, data);
    req.user = rows[0];
    next();
  } catch (e) {
    res.status(401).json({ error: "Please authenticate!" });
  }
};

module.exports = auth;
