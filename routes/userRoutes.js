const express = require("express");
const {
  getAllUsers, registerUser, authUser
} = require("../controllers/userController");
const { verification } = require("../auth/verifyToken");

const userRoutes = express.Router();

userRoutes.route("/").get(verification, getAllUsers);
userRoutes.route("/").post(registerUser);
userRoutes.post("/signin", authUser);

module.exports = userRoutes;