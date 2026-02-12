import request from '@/utils/request';

// 获取用户成就列表
export function getAchievements() {
    return request.get('/achievements');
}
