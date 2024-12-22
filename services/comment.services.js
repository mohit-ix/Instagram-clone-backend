const Comment = require("../models/comments.model");

const saveComment = async (comment) => {
  const commentToSave = new Comment(comment);
  return commentToSave.save();
}

module.exports = {
  saveComment
}