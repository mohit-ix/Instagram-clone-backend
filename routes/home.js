const path = require('path');

const express = require('express');

const homeController = require('../controllers/home.controller');
const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/home', authController.verify, homeController.getHomepage);

router.post('/like-post/:postId', authController.verify, homeController.postLikePost);

router.post('/dislike-post/:postId', authController.verify, homeController.postDislikePost);

router.get('/search/:username', authController.verify, homeController.getSearchUser);

router.get('/users/:userId', authController.verify, homeController.getUserpage);

module.exports = router;