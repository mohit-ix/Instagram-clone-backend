const Post = require("../models/posts.model");
const User = require('../models/user.model');

// let posts = [];

// const post = new Post({
//   imageUrl: "https://imgs.search.brave.com/tL4Wty8Rg_sRD5QFKMvMzHgGzROIiYUnJsS5jPLaOsI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvZmVhdHVy/ZWQvZGJ6LXBpY3R1/cmVzLWs1aGh6N2Rn/dTEzNjJzMnYuanBn",
//   caption: "This is a post caption.",
// });

// posts.push(post);

const getUploadPost = async (req, res, next) => {
  // console.log(req.user);
  res.render("admin/upload_post", { pageTitle: "Upload Post" });
};

const postUploadPost = async (req, res, next) => {
  const imageUrl = req.body.imageUrl;
  const caption = req.body.caption;
  // const post = new Post({
  //   imageUrl: imageUrl,
  //   caption: caption,
  //   user: {
  //     username: req.user.username,
  //     userId: req.user,
  //   },
  //   likes: {userId: []},
  //   dislikes: {userId: []},
  //   timestamp: Date.now(),
  // });
  req.body.user = req.user._id;
  const post = new Post(req.body);
  post.save()
  // .then(post => {
  //   return req.user.addPosts(post);
  // })
  .then(result => {
    console.log('Created Successfully!!');
    return res.status(200).send({
      status: "success",
      message: "Post added Successfully."
    });
  })
  .catch(err => {
    console.log(err);
    return res.status(500).send({
      status: "failure",
      message: err.message
    });
  });
};

const getProfile = async (req, res, next) => {
  Post.find({"user.userId": req.user._id})
  .then(posts => {
    res.render('admin/user_page', {pageTitle: "Profile", user: req.user, posts: posts});
  })
  .catch(err => {
    console.log(err);
  })
};

const postAddFriend = async (req, res, next) => {
  const userId = req.params.userId;
  console.log("toogling friend...");
  // req.session.user.addAndRemoveFriend(userId);
  User.findById(userId)
    .then((user) => {
      return user.addAndRemoveFriend(req.session.user._id);
    })
    .then((result) => {
      return res.status(200).send({
        status: "success",
        message: "Friend Added Successfully"
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        status: "failure",
        message: err.message
      })
    });
};

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


module.exports = {
  getUploadPost,
  postUploadPost,
  getProfile,
  postAddFriend,
  getFriends
}