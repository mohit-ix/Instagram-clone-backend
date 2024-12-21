const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.get("/friends/:username", adminController.getFriends);

router.get("/u/:username", adminController.getUserByUsername);

router.get('/searchUser', adminController.getSearchUser);

router.get("/:id", adminController.getUser);

router.put("/:id", authController.verify, adminController.updateUser);

router.put("/:username/add", authController.verify, adminController.addFriend);

router.put("/:username/remove", authController.verify, adminController.removeFriend);

module.exports = router;