const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      _id: user._id,
    },
    "averysecretnewtoken",
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      _id: user._id,
    },
    "averysecretrefreshtoken",
    { expiresIn: "1h" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
}
