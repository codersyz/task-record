import request from '@/utils/request';

// 创建任务
export const createTask = (data) => {
  return request.post('/tasks', data);
};

// 获取任务列表
export const getTaskList = (status) => {
  // 只有当 status 有值时才传递参数
  const params = {};
  if (status !== undefined && status !== null) {
    params.status = status;
  }
  return request.get('/tasks', params);
};

// 获取任务详情
export const getTaskDetail = (id) => {
  return request.get(`/tasks/${id}`);
};

// 更新任务
export const updateTask = (id, data) => {
  return request.put(`/tasks/${id}`, data);
};

// 删除任务
export const deleteTask = (id) => {
  return request.delete(`/tasks/${id}`);
};

// 打卡
export const checkin = (data) => {
  return request.post('/checkins', data);
};

// 检查今天是否已打卡
export const checkTodayCheckin = (taskId) => {
  return request.get(`/checkins/check/${taskId}`);
};

// 获取打卡记录
export const getCheckinList = (taskId, page = 1, pageSize = 20) => {
  return request.get(`/checkins/task/${taskId}`, { page, pageSize });
};

// 获取打卡日历
export const getCheckinCalendar = (taskId, year, month) => {
  return request.get(`/checkins/calendar/${taskId}`, { year, month });
};

// 删除打卡记录
export const deleteCheckin = (id) => {
  return request.delete(`/checkins/${id}`);
};

// 获取月度打卡日历数据
export const getMonthlyCalendar = (year, month, taskId) => {
  const params = { year, month };
  if (taskId) {
    params.taskId = taskId;
  }
  return request.get('/checkins/monthly-calendar', params);
};
