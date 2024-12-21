const bcrypt = require("bcrypt");

const Post = require("../models/posts.model");
const User = require("../models/user.model");

const getFriends = async (req, res, next) => {
  try {
    const username = req.params.username;
    const userfriends = await User.findOne({ username: username });
    if (!userfriends) {
      throw new Error("user does not exist");
    }
    const friends = await Promise.all(
      userfriends.friends.map((friend) => {
        return User.findById(friend, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      friends: friends,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

const getUserByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
      throw new Error("User does not exist");
    }
    const { password, jwtToken, __v, ...otherInfo } = user._doc;
    return res.status(200).send({
      status: "success",
      message: "user info",
      user: otherInfo,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
};

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new Error("User does not exist");
    }
    const { password, jwtToken, __v, ...otherInfo } = user._doc;
    return res.status(200).send({
      status: "success",
      message: "user info",
      user: otherInfo,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
};

const updateUser = async (req, res, next) => {
  if (req.body._id == req.params.id) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        res.status(500).send({
          status: "failure",
          message: err.message,
        });
      }
    }
  }
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!user) {
      return res.status(400).send({
        status: "failure",
        message: "Thiis user can't be updated",
      });
    }
    const { jwtToken, password, ...otherInfo } = user._doc;
    return res.status(200).send({
      status: "success",
      user: otherInfo,
      message: "User Updated",
    });
  } catch (err) {
    res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
};

const addFriend = async (req, res, next) => {
  try {
    const currentUser = await User.findById({ _id: req.user._id });
    if (currentUser.username !== req.params.username) {
      const userToAdd = await User.findOne({ username: req.params.username });
      if (!userToAdd) {
        throw new Error("User does not exist");
      }
      if (!currentUser.friends.includes(userToAdd._id)) {
        await currentUser.updateOne({
          $push: { friends: userToAdd._id },
        });
        await userToAdd.updateOne({
          $push: { friends: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "A new friend is added.",
        });
      } else {
        res.status(400).send({
          status: "failure",
          message: "You are already friend with this user.",
        });
      }
    } else {
      throw new Error("Can't add yourself.");
    }
  } catch (err) {
    res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
};

const removeFriend = async (req, res, next) => {
  try {
    const currentUser = await User.findById({ _id: req.user._id });
    if (currentUser.username !== req.params.username) {
      const userToRemove = await User.findOne({
        username: req.params.username,
      });
      if (!userToRemove) {
        throw new Error("This user does not exist");
      }
      if (currentUser.friends.includes(userToRemove._id)) {
        await currentUser.updateOne({
          $pull: { friends: userToRemove._id },
        });
        await userToRemove.updateOne({
          $pull: { friends: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "A friend is lost.",
        });
      } else {
        res.status(400).send({
          status: "failure",
          message: "This user is not a friend.",
        });
      }
    } else {
      throw new Error("Can't remove yourself");
    }
  } catch (err) {
    res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
};

const getSearchUser = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const users = await User.find({ username: {$regex: search, $options: "i"} }).select(
      "_id username profilePicture"
    );
    const totalUsers = users.length;
    res.status(200).send({
      status: "success",
      users: users,
      length: totalUsers,
    })
  } catch(err) {
    console.log(err)
    res.status(500).send({
      status: "failure",
      message: err.message
    });
  }
};

module.exports = {
  getFriends,
  getUserByUsername,
  getUser,
  updateUser,
  addFriend,
  removeFriend,
  getSearchUser,
};
