const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 创建任务
router.post('/', taskController.createTask);

// 获取任务列表
router.get('/', taskController.getTaskList);

// 获取任务详情
router.get('/:id', taskController.getTaskDetail);

// 更新任务
router.put('/:id', taskController.updateTask);

// 删除任务
router.delete('/:id', taskController.deleteTask);

module.exports = router;
