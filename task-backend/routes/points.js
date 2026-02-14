const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pointController = require('../controllers/pointController');

// 获取用户积分信息
router.get('/', auth, pointController.getUserPoints);

// 获取积分记录
router.get('/records', auth, pointController.getPointRecords);

// 获取积分排行榜
router.get('/ranking', auth, pointController.getPointsRanking);

module.exports = router;
