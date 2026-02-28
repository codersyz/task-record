// 图片处理工具函数

// 获取完整的图片URL
export function getFullImageUrl(imageUrl) {
  if (!imageUrl) {
    return '/static/logo.webp';
  }
  
  // 如果是相对路径（上传到服务器的图片），拼接服务器地址
  if (imageUrl.startsWith('/uploads/')) {
    // 开发环境
    // const baseURL = 'http://localhost:3003'; // 开发者工具
    // const baseURL = 'http://192.168.202.53:3003'; // 真机调试
    
    // 生产环境（发布时取消注释）
    const baseURL = 'https://syztools.cn/task-api';
    
    return baseURL + imageUrl;
  }
  
  // 如果是完整URL、本地路径或临时路径，直接返回
  return imageUrl;
}

// 获取头像URL（别名）
export function getAvatarUrl(avatarUrl) {
  return getFullImageUrl(avatarUrl);
}
