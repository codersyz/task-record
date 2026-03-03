const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// 记录订阅
router.post('/record', auth, subscriptionController.recordSubscription);

// 获取提醒设置
router.get('/settings', auth, subscriptionController.getReminderSettings);

// 更新提醒设置
router.put('/settings', auth, subscriptionController.updateReminderSettings);

// 获取订阅状态
router.get('/status', auth, subscriptionController.getSubscriptionStatus);

module.exports = router;
