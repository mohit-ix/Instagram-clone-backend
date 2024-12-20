const Post = require("../models/posts.model");
const User = require("../models/user.model");

const getHomepage = async (req, res, next) => {
  try{
    const userId = req.user._id;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 1;
    console.log(page, limit, req.query.page, req.query.limit);
    const user = await User.findById(userId).select("friends");
    const myPosts = await Post.find({user: userId})
      // .skip(page * limit)
      // .limit(limit)
      .sort({createdAt: "desc"})
      .populate("user", "username profilePicture");
    const friendsArticles = await Promise.all(
      user.friends.map((friendId) => {
        return Post.find({
          user: friendId,
          createdAt: {
            $gte: new Date(new Date().getTime() - 86400000).toISOString(),
          }
        })
          // .skip(page*limit)
          // .limit(limit)
          .sort({createdAt: "desc"})
          .populate("user", "username profilePicture");
      })
    );
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
  // Post.find()
  //   .then((posts) => {
  //     // console.log(posts);
  //     let likedPosts = [];
  //     let dislikedPosts = [];
  //     let flag = 0;
  //     for (let post of posts) {
  //       for (let user of post.likes.users) {
  //         if (user.userId.toString() === req.user._id.toString()) {
  //           flag = 1;
  //           break;
  //         }
  //       }
  //       if (flag) {
  //         likedPosts.push(true);
  //         flag = 0;
  //       } else {
  //         likedPosts.push(false);
  //       }
  //     }
  //     flag = 0;
  //     for (let post of posts) {
  //       for (let user of post.dislikes.users) {
  //         if (user.userId.toString() === req.user._id.toString()) {
  //           flag = 1;
  //           break;
  //         }
  //       }
  //       if (flag) {
  //         dislikedPosts.push(true);
  //         flag = 0;
  //       } else {
  //         dislikedPosts.push(false);
  //       }
  //     }
  //     return res.render("home", {
  //       pageTitle: "HomePage",
  //       posts: posts,
  //       likedPosts: likedPosts,
  //       dislikedPosts: dislikedPosts,
  //       users: []
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

const postLikePost = async (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      return post.likePost(req.user._id);
    })
    .catch((err) => {
      console.log(err);
    });
};

const postDislikePost = async (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      return post.dislikePost(req.user._id);
    })
    .catch((err) => {
      console.log(err);
    });
};

const getSearchUser = async (req, res, next) => {
  const username = req.params.username;
  User.find({username: { '$regex': `(\s+${username}|^${username})`}})
  .then(users => {
    console.log(users);
    res.render("search", {pageTitle: 'Search Results', users: users});
  })
  .catch(err => {
    console.log(err);
  });
}

const getUserpage = async (req, res, next) => {
  const userId = req.params.userId;
  const isFriend = req.session.user.friends.users.find(user => {
    return user.userId.toString() === userId.toString();
  });
  console.log(isFriend);
  User.findById(userId)
  .then(user => {
    if(user._id.toString() === req.user._id.toString()) {
      res.redirect('/admin/userpage')
      // res.render('admin/user_page', {pageTitle: "Profile", user: req.user, posts: posts});
    }
    else {
      res.render('homepage/userpage', {pageTitle: user.username, user: user, isFriend: isFriend});
    }
  })
  .catch(err => {
    console.log(err);
  });
}

module.exports = {
  getHomepage,
  postLikePost,
  postDislikePost,
  getSearchUser,
  getUserpage
}
