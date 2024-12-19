const mongoose = require('mongoose');
const { post } = require('../routes/home');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    max: 50,
    default: ""
  },
  profilePicture: {
    type: String,
    default: "https://as1.ftcdn.net/v2/jpg/08/05/28/22/1000_F_805282248_LHUxw7t2pnQ7x8lFEsS2IZgK8IGFXePS.jpg"
  },
  friends: {
    type: Array,
    default: []
    // users: [
    //   {
    //     userId: {
    //       type: Schema.Types.ObjectId,
    //       ref: 'User',
    //       required: true,
    //     }
    //   }
    // ]
  },
  jwtToken: {
    type: String,
  }
  // uploads: {
  //   posts: [
  //     {
  //       postId: {
  //         type: Schema.Types.ObjectId,
  //         ref: 'Post',
  //         required: true,
  //       },
  //       imageUrl: {
  //         type: String,
  //         required: true,
  //       },
  //       likeCount: {
  //         type: Number,
  //         required: true,
  //       },
  //       dislikeCount: {
  //         type: Number,
  //         required: true
  //       }
  //     }
  //   ]
  // },
});

userSchema.methods.addPosts = function(post) {
  this.uploads.posts.push({
    postId: post._id,
    imageUrl: post.imageUrl,
    likeCount: post.likes.users.length,
    dislikeCount: post.dislikes.users.length,
  });

  return this.save();
};

userSchema.methods.addAndRemoveFriend = function(userId) {
  let updatedFriends = [...this.friends.users];
  
  const isFriend = updatedFriends.find(user => {
    return user.userId.toString() === userId.toString();
  });

  console.log(isFriend);

  if(isFriend) {
    updatedFriends = updatedFriends.filter(user => {
      return user !== isFriend;
    });
  }
  else {
    console.log("adding friend");
    updatedFriends.push({
      userId: userId,
    });
  }

  const updatedFriendsList = {
    users: updatedFriends
  }

  this.friends = updatedFriendsList;

  console.log(this);
  console.log("saving");

  return this.save();
}

module.exports = mongoose.model('User', userSchema);