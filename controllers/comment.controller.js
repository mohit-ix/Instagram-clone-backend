const commentServices = require("../services/comment.services");
const postServices = require("../services/post.services");

const addComment = async (req, res, next) => {
  try {
    const {postId, ...comment} = req.body;
    comment.user = req.user._id;
    const savedComment = await commentServices.saveComment(comment);
    await postServices.addComment(postId, savedComment._id);
    res.status(200).send({
      status: "success",
      message: "Comment has added."
    });
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    })
  }
};

const getByPostId = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await postServices.getPostWithComments(postId);
    if(post) {
      res.status(200).send({
        status: "success",
        comments: post.comment
      });
    } else {
      res.status(400).send({
        status: "failure",
        message: "post does not exist"
    });
    }
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message
    })
  }
}

module.exports = {
  addComment,
  getByPostId
}