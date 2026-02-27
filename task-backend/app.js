const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/uploads', express.static('uploads'));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/points', require('./routes/points'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器 - 绑定到所有网络接口以支持真机调试
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 真机调试地址: http://192.168.202.53:${PORT}`);
  console.log(`📝 API文档: http://localhost:${PORT}/health`);
});

module.exports = app;
