const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 微信登录
router.post('/login', authController.wechatLogin);

// 开发环境：测试登录（生产环境禁用）
if (process.env.NODE_ENV !== 'production') {
  router.post('/test-login', async (req, res) => {
    try {
      const jwt = require('jsonwebtoken');
      const db = require('../config/db');
      
      // 创建或获取测试用户
      let [users] = await db.query('SELECT * FROM users WHERE openid = ?', ['test-openid']);
      
      let userId;
      let isNewUser = false;
      
      if (users.length === 0) {
        const [result] = await db.query(
          'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
          ['test-openid', '测试用户', '/static/logo.webp']
        );
        userId = result.insertId;
        isNewUser = true;
      } else {
        userId = users[0].id;
        isNewUser = false;
      }
      
      // 生成token
      const token = jwt.sign(
        { userId, openid: 'test-openid' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        code: 200,
        message: '测试登录成功',
        data: {
          token,
          userId,
          isNewUser
        }
      });
    } catch (error) {
      console.error('测试登录错误:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  });
}

// 更新用户信息（需要认证）
router.put('/user', authMiddleware, authController.updateUserInfo);

// 获取用户信息（需要认证）
router.get('/user', authMiddleware, authController.getUserInfo);

// 上传头像（需要认证）
router.post('/upload-avatar', authMiddleware, authController.uploadAvatar);

module.exports = router;
