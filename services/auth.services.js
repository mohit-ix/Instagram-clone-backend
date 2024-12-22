const generateToken = require("../utils/generateToken");

const User = require("../models/user.model");

const userServices = require("./user.services");

const logInUser = async (email, password) => {
  const user = await userServices.getUserByEmail(email);
  if(!user) {
    return false;
  }
  if(await user.isPasswordMatch(password)) {
    const accessToken = generateToken.generateAccessToken(user);
    const refreshToken = generateToken.generateRefreshToken(user);
    User.findByIdAndUpdate(user._id, {
      jwtToken: refreshToken
    });
    const result = {};
    result.user = user;
    result.accessToken = accessToken;
    result.refreshToken = refreshToken;
    return result;
  } else {
    return false;
  }
}

const logOutUser = async (refreshToken) => {
  await User.updateOne({jwtToken: refreshToken}, [
    {$unset: ['jwtToken']}
  ]);
}

const getToken = async (refreshToken) => {
  const token = await User.findOne(
    { jwtToken: refreshToken },
    { jwtToken: true }
  );
  return token
}

const updateToken = async (user, refreshToken) => {
  const newAccessToken = generateToken.generateAccessToken(user);
  const newRefreshToken = generateToken.generateRefreshToken(user);
  await User.updateOne(
    { jwtToken: refreshToken },
    { $set: { jwtToken: newRefreshToken } }
  );
  return newAccessToken, newRefreshToken;
}

module.exports = {
  logInUser,
  logOutUser,
  getToken,
  updateToken
}