import request from '@/utils/request';

// 记录订阅
export function recordSubscription(data) {
  return request.post('/subscription/record', data);
}

// 获取提醒设置
export function getReminderSettings() {
  return request.get('/subscription/settings');
}

// 更新提醒设置
export function updateReminderSettings(data) {
  return request.put('/subscription/settings', data);
}

// 获取订阅状态
export function getSubscriptionStatus(templateType) {
  return request.get('/subscription/status', { templateType });
}
