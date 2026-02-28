const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 配置文件上传
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

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
    let isNewUser = false;
    
    if (users.length === 0) {
      // 新用户，插入数据库
      const [result] = await db.query(
        'INSERT INTO users (openid) VALUES (?)',
        [openid]
      );
      userId = result.insertId;
      isNewUser = true;
    } else {
      userId = users[0].id;
      isNewUser = false;
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
        isNewUser
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

// 上传头像
exports.uploadAvatar = (req, res) => {
  upload.single('avatar')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        code: 400,
        message: '文件上传失败: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        code: 400,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的文件'
      });
    }

    try {
      const userId = req.userId;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // 删除旧头像（如果存在且不是默认头像）
      const [users] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [userId]);
      if (users.length > 0 && users[0].avatar_url && users[0].avatar_url.startsWith('/uploads/')) {
        const oldAvatarPath = path.join(__dirname, '..', users[0].avatar_url);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // 更新数据库
      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);

      res.json({
        code: 200,
        message: '上传成功',
        data: {
          avatarUrl: avatarUrl
        }
      });
    } catch (error) {
      console.error('保存头像信息错误:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误'
      });
    }
  });
};
