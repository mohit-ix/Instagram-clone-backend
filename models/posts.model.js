const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

postSchema.methods.likePost = function (userId) {
  let updatedLikeUsers = [...this.likes.users];
  let updatedDislikeUsers = [...this.dislikes.users];

  const isLiked = updatedLikeUsers.find((user) => {
    return user.userId.toString() === userId.toString();
  });

  const isDisliked = updatedDislikeUsers.find((user) => {
    return user.userId.toString() === userId.toString();
  });

  if (isDisliked) {
    updatedDislikeUsers = updatedDislikeUsers.filter((user) => {
      return user !== isDisliked;
    });
  }

  if (isLiked) {
    updatedLikeUsers = updatedLikeUsers.filter((user) => {
      return user !== isLiked;
    });
  } else {
    updatedLikeUsers.push({
      userId: userId,
    });
  }

  const updatedLikes = {
    users: updatedLikeUsers,
  };
  const updatedDislikes = {
    users: updatedDislikeUsers,
  };

  this.likes = updatedLikes;
  this.dislikes = updatedDislikes;

  return this.save();
};

postSchema.methods.dislikePost = function (userId) {
  let updatedLikeUsers = [...this.likes.users];
  let updatedDislikeUsers = [...this.dislikes.users];

  const isLiked = updatedLikeUsers.find((user) => {
    return user.userId.toString() === userId.toString();
  });

  const isDisliked = updatedDislikeUsers.find((user) => {
    return user.userId.toString() === userId.toString();
  });

  if (isLiked) {
    updatedLikeUsers = updatedLikeUsers.filter((user) => {
      return user !== isLiked;
    });
  }

  if (isDisliked) {
    updatedDislikeUsers = updatedDislikeUsers.filter((user) => {
      return user !== isDisliked;
    });
  } else {
    updatedDislikeUsers.push({
      userId: userId,
    });
  }

  const updatedLikes = {
    users: updatedLikeUsers,
  };
  const updatedDislikes = {
    users: updatedDislikeUsers,
  };

  this.likes = updatedLikes;
  this.dislikes = updatedDislikes;

  return this.save();
};

postSchema.methods.isLiked = function (userId) {
  const liked = this.likes.users.find((user) => {
    return user.userId.toString() === userId.toString();
  });

  return liked ? true : false;
};

module.exports = mongoose.model("Post", postSchema);
