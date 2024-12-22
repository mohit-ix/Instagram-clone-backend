const Post = require("../models/posts.model");

const createPost = async (body) => {
  const post = new Post(body);
  post.save();
}

const getPosts = async (userId) => {
  return Post.find({user: userId});
}

const getPostById = async (postId) => {
  return Post.findById(postId);
}

const updatePost = async (body) => {
  return Post.updateOne({$set: body});
}

const deletePost = async (postId) => {
  return Post.findByIdAndDelete(postId);
}

const getPostsByUserId = async (userId) => {
  return Post.find({user: userId})
    // .skip(page * limit)
    // .limit(limit)
    .sort({createdAt: "desc"})
    .populate("user", "username profilePicture");
}

const getPostWithComments = async (postId) => {
  return Post.findOne({_id: postId}).populate("comment");
}

const addComment = async (postId, commentId) => {
  return Post.findOneAndUpdate(
    {_id: postId},
    {$push: {comment: savedComment._id}}
  );
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUserId,
  getPostWithComments,
  addComment
}