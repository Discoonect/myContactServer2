const express = require("express");

const dotenv = require("dotenv");
dotenv.config({ path: `./config/config.env` });

const user = require("./route/user");

const app = express();
app.use(express.json());

app.use("/api/v1/user", user);

const PORT = process.env.PORT;

app.listen(PORT);
