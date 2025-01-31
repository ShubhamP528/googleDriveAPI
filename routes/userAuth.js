const express = require("express");
const {
  loginController,
  signupController,
} = require("../controller/authConroller");

const route = express.Router();

route.post("/login", loginController);
route.post("/signup", signupController);

module.exports = route;
