const Post = require("../models/posts.model");
const User = require("../models/user.model");

const postUploadPost = async (req, res, next) => {
  req.body.user = req.user._id;
  const post = new Post(req.body);
  post
    .save()
    .then((result) => {
      console.log("Created Successfully!!");
      return res.status(200).send({
        status: "success",
        message: "Post added Successfully.",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        status: "failure",
        message: err.message,
      });
    });
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post.user.toString() === req.user._id) {
      await Post.updateOne({$set: req.body});
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
    const post = await Post.findById(req.params.id);
    if(post.user.toString === req.user._id) {
      await Post.findByIdAndDelete(req.params.id);
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
    const user = await User.findById(userId).select("friends");
    console.log(user);
    const myPosts = await Post.find({user: userId})
      // .skip(page * limit)
      // .limit(limit)
      .sort({createdAt: "desc"})
      .populate("user", "username profilePicture");
    const friendsArticles = await Promise.all(
      user.friends.map((friendId) => {
        return Post.find({
          user: friendId,
          // createdAt: {
          //   $gte: new Date(new Date().getTime() - 86400000).toISOString(),
          // }
        })
          // .skip(page*limit)
          // .limit(limit)
          .sort({createdAt: "desc"})
          .populate("user", "username profilePicture");
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
    const post = await Post.findOne({_id: id}).populate(
      "comment"
    );
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

const postLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;
    if(!post.likes.includes(userId)) {
      if(post.dislikes.includes(userId)) {
        await post.updateOne({$pull: {dislikes: userId}});
      }
      post.updateOne({$push: {likes: userId}});
      res.status(200).send({
        status: "success",
        message: "Post Liked."
      });
    } else {
      post.updateOne({$pull: {likes: userId}});
      res.status(200).send({
        status: "success",
        message: "Like removed."
      });
    }
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    });
  }
};

const postDislikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;
    if(!post.dislikes.includes(userId)) {
      if(post.likes.includes(userId)) {
        await post.updateOne({$pull: {likes: userId}});
      }
      post.updateOne({$push: {dislikes: userId}});
      res.status(200).send({
        status: "success",
        message: "Post Disliked."
      });
    } else {
      post.updateOne({$pull: {dislikes: userId}});
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
    const user = await User.findOne({username: username});
    const posts = await Post.find({user: user._id});
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
  postLikePost,
  postDislikePost,
  getPostsByUsername
}
