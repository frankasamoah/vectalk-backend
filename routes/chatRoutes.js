const express = require("express");
const {
  createChat,
  getChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
const { verification } = require("../auth/verifyToken");

const chatRoutes = express.Router();

chatRoutes.route("/").post(verification, createChat);
chatRoutes.route("/").get(verification, getChats);
chatRoutes.route("/group").post(verification, createGroup);
chatRoutes.route("/rename").put(verification, renameGroup);
chatRoutes.route("/removegroup").put(verification, removeFromGroup);
chatRoutes.route("/addgroup").put(verification, addToGroup);

module.exports = chatRoutes;