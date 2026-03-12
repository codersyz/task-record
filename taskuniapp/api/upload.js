/**
 * 上传打卡图片到腾讯云COS
 * @param {string} filePath - 本地图片路径
 * @returns {Promise}
 */
export function uploadCheckinImage(filePath) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    
    // API基础地址
    // const BASE_URL = 'http://192.168.202.53:3003/api';
    // const BASE_URL = 'http://localhost:3003/api'; // 开发者工具
    const BASE_URL = 'https://syztools.cn/task-api/api'; // 生产环境
    
    uni.uploadFile({
      url: BASE_URL + '/upload/checkin-image',
      filePath: filePath,
      name: 'image',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (error) {
          reject(new Error('解析响应失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}
