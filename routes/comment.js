const path = require('path');

const express = require('express');

const commentController = require('../controllers/comment.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post("/", authController.verify, commentController.addComment);

router.get("/:postId", commentController.getByPostId);

module.exports = router;