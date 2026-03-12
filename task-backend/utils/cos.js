const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

// 初始化COS实例
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
});

/**
 * 上传文件到腾讯云COS
 * @param {string} filePath - 本地文件路径
 * @param {string} key - COS中的文件路径（如：checkin-images/2024/03/xxx.jpg）
 * @returns {Promise<string>} - 返回文件的访问URL
 */
exports.uploadToCOS = (filePath, key) => {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentLength: fs.statSync(filePath).size
    }, (err, data) => {
      if (err) {
        console.error('上传到COS失败:', err);
        reject(err);
      } else {
        // 构建访问URL
        const url = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${key}`;
        resolve(url);
      }
    });
  });
};

/**
 * 删除COS中的文件
 * @param {string} key - COS中的文件路径
 * @returns {Promise<void>}
 */
exports.deleteFromCOS = (key) => {
  return new Promise((resolve, reject) => {
    cos.deleteObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: key
    }, (err, data) => {
      if (err) {
        console.error('从COS删除失败:', err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * 从URL中提取COS的Key
 * @param {string} url - COS文件的完整URL
 * @returns {string} - 文件的Key
 */
exports.extractKeyFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // 去掉开头的 /
  } catch (error) {
    console.error('解析URL失败:', error);
    return null;
  }
};
