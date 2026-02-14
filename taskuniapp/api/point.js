import request from '@/utils/request';

// 获取用户积分信息
export function getUserPoints() {
  return request.get('/points');
}

// 获取积分记录
export function getPointRecords(params) {
  return request.get('/points/records', params);
}

// 获取积分排行榜
export function getPointsRanking(params) {
  return request.get('/points/ranking', params);
}
