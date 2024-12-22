const User = require("../models/user.model");

const userServices = require("../services/user.services");
const postServices = require("../services/post.services");

const postUploadPost = async (req, res, next) => {
  req.body.user = req.user._id;
  try{
    await postServices.createPost(req.body);
    return res.status(200).send({
      status: "success",
      message: "Post added Successfully.",
    });
  } catch(err) {
    return res.status(500).send({
      status: "failure",
      message: err.message,
    });
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await postServices(req.params.id);
    if(post.user.toString() === req.user._id) {
      await postServices.updatePost(req.body);
      res.status(200).send({
        status: "success",
        message: "Post is updated."
      });
    } else {
      res.status(401).send({
        status: "failure",
        message: "You are not authorized."
      });
    }
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    })
  }
}

const deletePost = async (req, res, next) => {
  try {
    const post = await postServices.getPostById(req.params.id);
    if(post.user.toString() === req.user._id) {
      await postServices.deletePost(req.params.id);
      res.status(200).send({
        status: "success",
        message: "Post has been Deleted."
      });
    } else {
      res.status(401).send({
        statsus: "failure",
        message: "You are not authorized."
      });
    }
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    });
  }
}

const getHomepage = async (req, res, next) => {
  try{
    const userId = req.user._id;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 1;
    // const user = await User.findById(userId).select("friends");
    const user = await userServices.getUserById(userId, {friends: true});
    const myPosts = await postServices.getPostsByUserId(userId);
    const friendsArticles = await Promise.all(
      user.friends.map((friendId) => {
        return postServices.getPostsByUserId(friendId);
      })
    );
    // console.log(friendsArticles);
    allPosts = myPosts.concat(...friendsArticles);
    res.status(200).send({
      status: "success",
      Posts: allPosts,
      limit: allPosts.length,
    });
  } catch(e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    })
  }
};

const getPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await postServices.getPostWithComments(id);
    if(!post) {
      return res.status(400).send({
        status: "failure",
        message: "Post does not exist."
      });
    }
    return res.status(200).send({
      status: "success",
      post: post
    });
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    })
  }
}

const likePost = async (req, res, next) => {
  try {
    const post = await postServices.getPostById(req.params.id);
    const userId = req.user._id;
    if(!post.likes.includes(userId)) {
      if(post.dislikes.includes(userId)) {
        await post.updateOne({$pull: {dislikes: userId}});
      }
      await post.updateOne({ $push: { likes: req.user._id } })
      
      res.status(200).send({
        status: "success",
        message: "Post Liked."
      });
    } else {
      await post.updateOne({$pull: {likes: userId}});
      res.status(200).send({
        status: "success",
        message: "Like removed."
      });
    }
  } catch(err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: err.message
    });
  }
};

const dislikePost = async (req, res, next) => {
  try {
    const post = await postServices.getPostById(req.params.id);
    const userId = req.user._id;
    if(!post.dislikes.includes(userId)) {
      if(post.likes.includes(userId)) {
        await post.updateOne({$pull: {likes: userId}});
      }
      await post.updateOne({$push: {dislikes: userId}});
      res.status(200).send({
        status: "success",
        message: "Post Disliked."
      });
    } else {
      await post.updateOne({$pull: {dislikes: userId}});
      res.status(200).send({
        status: "success",
        message: "Dislike removed."
      });
    }
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    });
  }
};

const getPostsByUsername = async (req, res, next) => {
  try{
    const username = req.params.username;
    const user = await userServices.getUserByUsername(username);
    const posts = await postServices.getPosts(user);
    return res.status(200).json(posts);
  } catch(err) {
    console.log(err);
    return res.status(500).send({
      status: "failure",
      message: err.message
    })
  }
}

module.exports = {
  postUploadPost,
  updatePost,
  deletePost,
  getHomepage,
  getPost,
  likePost,
  dislikePost,
  getPostsByUsername
}
