const jwt = require('jsonwebtoken');

const userServices = require("../services/user.services");
const authServices = require("../services/auth.services");

const postLogIn = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const {accessToken, refreshToken, user} = await authServices.logInUser(email, password);
    if(user) {
      const {jwtToken, password: newpass, ...other} = user._doc;
      return res.status(200).send({
        status: "success",
        message: "log in successful",
        data: other,
        accessToken,
        refreshToken
      });
    } else {
      return res.status(401).send({
        status: 'failure',
        message: "user or password did not match"
      })
    }
  } catch(err) {
    res.status(500).send({
      status: "failure",
      message: err.message,
    })
  }
}

const postSignUp = async (req, res, next) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  try {
    if(await userServices.getUserByEmail(email)) {
      return res.status(401).send({
        status: 'failure',
        message: "user already exists."
      })
    } else {
      await userServices.createUser(email, username, password);
      return res.status(200).send({
        status: "success",
        message: "User Created Successfully.",
        data: {
          user: username
        }
      });
    }
  } catch(err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: err.message
    });
  }
  
}

const postLogOut = async (req, res, next) => {
  try{
    const {refreshToken} = req.body;
    if(refreshToken) {
      await authServices.logOutUser(refreshToken);
      res.status(200).send({
        status: "success",
        message: "log out successful"
      });
    } else {
      res.status(400).send({
        status: "failure",
        message: "logout error"
      });
    }
  } catch(err) {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: err.message,
    })
  }
}

const verify = async (req, res, next) => {
  try {
    const authHead = req.headers.authorization;
    if(!authHead) {
      res.status(403).json("You are not authorized");
    }
    const token = authHead.split(" ")[1];
    if(authHead) {
      jwt.verify(token, "averysecretnewtoken", (err, user) => {
        if(err) {
          throw new Error("token is not valid");
        }
        req.user = user;
        next();
      })
    }
  } catch(err) {
    res.status(500).send({
      status: "success",
      message: err.message
    })
  }
};

const refresh = async (req, res, next) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    res.status(401).send({
      status: "failure",
      message: "You are not authenticated!",
    });
  }
  try {
    const token = await authServices.getToken(refreshToken);
    if (!token) {
      res.status(200).send({
        status: "failure",
        message: "Refresh token is not valid!",
      });
    }
    jwt.verify(
      refreshToken,
      "averysecretrefreshtoken",
      async (err, user) => {
        if (err) {
          console.log(err)
          throw new Error("token is not valid!");
        }
        const {newAccessToken, newRefreshToken} = authServices.updateToken(user, refreshToken);
        res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }
    );
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

module.exports = {
  postLogIn,
  postSignUp,
  postLogOut,
  verify,
  refresh
}