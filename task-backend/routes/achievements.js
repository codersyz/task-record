const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

// 获取用户成就列表
router.get('/', auth, achievementController.getUserAchievements);

module.exports = router;
