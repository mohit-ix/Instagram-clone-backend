const path = require('path');

const express = require('express');

const postController = require('../controllers/post.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post("/upload-post", authController.verify, postController.postUploadPost);

router.get('/home', authController.verify, postController.getHomepage);

router.get("/:id", authController.verify, postController.getPost);

router.put("/:id", authController.verify, postController.updatePost);

router.delete("/:id", authController.verify, postController.deletePost);

router.get('/:id/like', authController.verify, postController.likePost);

router.get('/:id/dislike', authController.verify, postController.dislikePost);

router.get("/u/:username", postController.getPostsByUsername)

module.exports = router;