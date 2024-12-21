const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const cors = require('cors');

const postRouter = require("./routes/post");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");
const errorController = require("./controllers/error.controller");

const User = require("./models/user.model");

const MONGODB_URI =
  "mongodb+srv://mkbhagat50mb:tGzUDAovvEg4iqHl@cluster0.j16lq.mongodb.net/social?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const store = MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(cors());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replaceAll(":", "").replace(".", "") +
        "-" +
        file.originalname
    );
  },
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({storage: fileStorage});

app.post("/upload", upload.single('file'), (req, res) => {
  try{
    if(req.file) {
      console.log('Uploaded Image: ', req.file.filename);
      const imageUrl = `http://localhost:8000/images/${req.file.filename}`;
      res.status(200).send({
        status: "Successful",
        imageUrl: imageUrl
      });
    } else {
      res.status(401).send({
        status: "Failure",
        message: "Image not found"
      });
    }
  } catch(err) {
    console.log(err);
    res.status(500).send({
      status: "Failure",
      message: err.message,
    })
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use(postRouter);

app.use(errorController.getError404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });
