const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const createChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("Provide userId in request");
    return res.sendStatus(400);
  }

  let findChat = await Chat.find({
    group: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("currentMessage");

  findChat = await User.populate(findChat, {
    path: "currentMessage.sender",
    select: "name pic email",
  });

  if (findChat.length > 0) {
    res.send(findChat[0]);
  } else {
    let chatData = {
      chatName: "footballer",
      group: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const detailedChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(detailedChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};


const getChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("currentMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "currentMessage.sender",
          select: "name photo email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};


const createGroup = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  let users = JSON.parse(req.body.users);

  // 2 or more users to form a group
  if (users.length < 2) {
    return res
      .status(400)
      .send("Two users or more required");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      group: true,
      groupAdmin: req.user,
    });

    const detailedGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(detailedGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
};


const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;


  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

 

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};

module.exports = {
  createChat,
  getChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
};