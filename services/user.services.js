const bcrypt = require("bcrypt");

const User = require("../models/user.model");

const createUser = async (email, username, password) => {
  hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    email: email,
    username: username,
    password: hashedPassword,
  });

  user.save();
}

const getUserByEmail = async (email) => {
  return User.findOne({email : email});
}

const getUserByUsername = async (username) => {
  return User.findOne({username: username});
}

const getUserById = async (userId, params) => {
  return User.findById(userId, params);
}

const updateUser = async (userId, body) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { $set: body },
    { new: true }
  );
}

const searchUsers = async (search) => {
  return User.find({ username: {$regex: search, $options: "i"} }).select(
    "_id username profilePicture"
  );
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  updateUser,
  searchUsers
}