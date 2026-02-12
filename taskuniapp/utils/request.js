// API请求封装
// 真机调试使用局域网IP，开发者工具使用localhost
const BASE_URL = 'http://192.168.202.53:3000/api'; // 真机调试地址

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
