const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// 微信登录
exports.wechatLogin = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少code参数'
      });
    }

    // 调用微信接口获取openid和session_key
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wxResponse.data;

    if (errcode) {
      return res.status(400).json({
        code: 400,
        message: `微信登录失败: ${errmsg}`
      });
    }

    // 查询或创建用户
    let [users] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
    
    let userId;
    if (users.length === 0) {
      // 新用户，插入数据库
      const [result] = await db.query(
        'INSERT INTO users (openid) VALUES (?)',
        [openid]
      );
      userId = result.insertId;
    } else {
      userId = users[0].id;
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId, openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userId,
        isNewUser: users.length === 0
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    const { nickname, avatarUrl } = req.body;
    const userId = req.userId;

    await db.query(
      'UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?',
      [nickname, avatarUrl, userId]
    );

    res.json({
      code: 200,
      message: '更新成功'
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.userId;

    const [users] = await db.query(
      'SELECT id, nickname, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      data: users[0]
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};
