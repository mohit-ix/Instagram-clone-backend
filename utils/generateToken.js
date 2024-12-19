const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      _id: user._id,
    },
    "averysecretnewtoken",
    { expires: "2s" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      _id: user._id,
    },
    "averysecretrefreshtoken",
    { expires: "2s" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
}
