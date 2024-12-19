const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin.controller');
const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get("/upload-post", authController.verify, adminController.getUploadPost);

router.post("/upload-post", authController.verify, adminController.postUploadPost);

router.get("/userpage", authController.verify, adminController.getProfile);

router.post("/add-friend/:userId", authController.verify, adminController.postAddFriend);

module.exports = router;