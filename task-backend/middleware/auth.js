const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT认证中间件
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.openid = decoded.openid;
    
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'token无效或已过期'
    });
  }
};

module.exports = authMiddleware;
