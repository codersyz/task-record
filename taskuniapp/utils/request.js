// API请求封装
// 使用主域名 + 子路径方案

// 开发环境：本地或局域网（开发时使用）
// const BASE_URL = 'http://192.168.202.53:3003/api'; // 真机调试地址
// const BASE_URL = 'http://localhost:3003/api'; // 开发者工具地址
// const BASE_URL = 'http://43.142.65.192:3003/api'; // 服务器IP地址（临时测试）

// 生产环境：HTTPS域名（正式发布使用）
const BASE_URL = 'https://syztools.cn/task-api/api'; // 生产服务器地址

// 注意：微信小程序正式发布必须使用HTTPS和已备案的域名

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token');
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // token过期，跳转登录
          uni.removeStorageSync('token');
          uni.reLaunch({
            url: '/pages/login/login'
          });
          reject(res.data);
        } else {
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 导出请求方法
export default {
  get(url, data) {
    return request({ url, method: 'GET', data });
  },
  post(url, data) {
    return request({ url, method: 'POST', data });
  },
  put(url, data) {
    return request({ url, method: 'PUT', data });
  },
  delete(url, data) {
    return request({ url, method: 'DELETE', data });
  }
};
