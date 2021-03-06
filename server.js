const express = require("express");

const dotenv = require("dotenv");
dotenv.config({ path: `./config/config.env` });
const fileupload = require("express-fileupload");
const path = require("path");
const morgan = require("morgan");

const user = require("./route/user");
const uploads = require("./route/uploads");
const follow = require("./route/follow");

const app = express();
app.use(express.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));

app.use("/api/v1/user", user);
app.use("/api/v1/upload", uploads);
app.use("/api/v1/follow", follow);

const PORT = process.env.PORT;

app.listen(PORT);

