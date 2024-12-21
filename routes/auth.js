const path = require('path');

const express = require('express');

const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authController.postLogIn);

router.post('/signup', authController.postSignUp);

router.post('/logout', authController.postLogOut);

router.post('/refresh', authController.refresh);

module.exports = router;