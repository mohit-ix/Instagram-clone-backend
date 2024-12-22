const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  },
  jwtToken: {
    type: String,
  }
});

// userSchema.statics.isEmailTaken = async (email) => {
//   const user = await .findOne({email: email});
//   return !!user;
// }

userSchema.methods.isPasswordMatch = async function(password) {
  const user = this;
  return bcrypt.compare(password, user.password);
}

module.exports = mongoose.model('User', userSchema);