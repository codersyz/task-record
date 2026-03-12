const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCOS } = require('../utils/cos');
const authMiddleware = require('../middleware/auth');

// 配置multer临时存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'checkin-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片格式：jpg, jpeg, png, gif, webp'));
    }
  }
});

// 上传打卡图片到腾讯云COS
router.post('/checkin-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      });
    }

    const localFilePath = req.file.path;
    const fileName = req.file.filename;
    
    // 构建COS中的文件路径：checkin-images/年/月/文件名
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const cosKey = `checkin-images/${year}/${month}/${fileName}`;

    // 上传到COS
    const cosUrl = await uploadToCOS(localFilePath, cosKey);

    // 删除本地临时文件
    fs.unlinkSync(localFilePath);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: cosUrl,
        key: cosKey
      }
    });

  } catch (error) {
    console.error('上传图片失败:', error);
    
    // 清理临时文件
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('清理临时文件失败:', e);
      }
    }

    res.status(500).json({
      code: 500,
      message: '上传失败：' + error.message
    });
  }
});

module.exports = router;
