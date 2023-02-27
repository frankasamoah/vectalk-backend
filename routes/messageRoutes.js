const express = require("express");
const {
  getAllMessages, sendMessages
} = require("../controllers/messageController");
const { verification } = require("../auth/verifyToken");

const messageRoutes = express.Router();

messageRoutes.route("/").post(verification, sendMessages);
messageRoutes.route("/:chatId").get(verification, getAllMessages);

module.exports = messageRoutes;