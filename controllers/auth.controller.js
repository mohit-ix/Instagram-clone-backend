const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = require('../utils/generateToken')

const User = require('../models/user.model');

const postLogIn = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // const body = req.body;
  // console.log(email, password);
  User.findOne({email: email})
  .then(user => {
    if(!user) {
      return res.status(401).send({
        status: 'failure',
        message: "user does not exist"
      })
    }
    bcrypt.compare(password, user.password)
    .then(doMatch => {
      if(doMatch) {
        // req.session.isLoggedIn = true;
        // req.session.user = user;
        const accessToken = generateToken.generateAccessToken(user);
        const refreshToken = generateToken.generateRefreshToken(user);
        User.findByIdAndUpdate(user._id, {
          jwtToken: refreshToken
        });
        const {jwtToken, password: newpass, ...other} = user._doc;
        return res.status(200).send({
          status: "success",
          message: "log in successful",
          data: other,
          accessToken,
          refreshToken
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        status: "failure",
        message: err.message,
      })
    })
  })
  .catch(err => {
    console.log(err);
  })
}

const postSignUp = async (req, res, next) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  console.log(email, username, password);
  User.findOne({email: email, username: username})
  .then(userDoc => {
    if(userDoc) {
      console.log('Found user');
      return res.status(401).send({
        status: "failure",
        message: "User already exists."
      });
    }
    return bcrypt.hash(password, 12);
  })
  .then(hashedPassword => {
    console.log('User Not Found')
    const user = new User({
      email: email,
      username: username,
      password: hashedPassword,
      // uploads: {posts: []},
      // friends: {users: []}
    });

    return user.save();
  })
  .then(result => {
    console.log('User Created');
    return res.status(200).send({
      status: "success",
      message: "User Created Successfully."
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).send({
      status: "failure",
      message: err.message
    })
  })
}

const postLogOut = async (req, res, next) => {
  try{
    const {refreshToken} = req.body;
    if(refreshToken) {
      await User.updateOne({jwtToken: refreshToken}, [
        {$unset: ['jwtToken']}
      ]);
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
    const token = await User.findOne(
      { jwtToken: refreshToken },
      { jwtToken: true }
    );
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
        const newAccessToken = generateToken.generateAccessToken(user);
        const newRefreshToken = generateToken.generateRefreshToken(user);
        await User.updateOne(
          { jwtToken: refreshToken },
          { $set: { jwtToken: newRefreshToken } }
        );
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