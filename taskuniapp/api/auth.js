import request from '@/utils/request';

// 微信登录
export const wechatLogin = (code) => {
  return request.post('/auth/login', { code });
};

// 测试登录（仅开发环境）
export const testLogin = () => {
  return request.post('/auth/test-login', {});
};

// 更新用户信息
export const updateUserInfo = (data) => {
  return request.put('/auth/user', data);
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/auth/user');
};
