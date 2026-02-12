const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 检查今天是否已打卡
router.get('/check/:taskId', checkinController.checkTodayCheckin);

// 打卡
router.post('/', checkinController.checkin);

// 获取打卡记录列表
router.get('/task/:taskId', checkinController.getCheckinList);

// 获取打卡日历
router.get('/calendar/:taskId', checkinController.getCheckinCalendar);

// 获取月度打卡日历数据
router.get('/monthly-calendar', checkinController.getMonthlyCalendar);

// 删除打卡记录
router.delete('/:id', checkinController.deleteCheckin);

module.exports = router;
