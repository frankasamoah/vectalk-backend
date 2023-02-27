const User = require("../models/userModel");
const generateToken = require("../auth/generateToken");


const getAllUsers = async (req, res) => {
  const query = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(query).find({ _id: { $ne: req.user._id } });
  res.send(users);
};


const registerUser = async (req, res) => {
  const { name, email, password, photo } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Enter all the Feilds");
  }

  const ExistingUser = await User.findOne({ email });

  if (ExistingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    photo,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      photo: user.photo,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
};


const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      photo: user.photo,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
};

module.exports = { getAllUsers, registerUser, authUser };