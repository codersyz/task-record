"use strict";
const utils_request = require("../utils/request.js");
const createTask = (data) => {
  return utils_request.request.post("/tasks", data);
};
const getTaskList = (status) => {
  const params = {};
  if (status !== void 0 && status !== null) {
    params.status = status;
  }
  return utils_request.request.get("/tasks", params);
};
const getTaskDetail = (id) => {
  return utils_request.request.get(`/tasks/${id}`);
};
const deleteTask = (id) => {
  return utils_request.request.delete(`/tasks/${id}`);
};
const checkin = (data) => {
  return utils_request.request.post("/checkins", data);
};
const checkTodayCheckin = (taskId) => {
  return utils_request.request.get(`/checkins/check/${taskId}`);
};
const getCheckinList = (taskId, page = 1, pageSize = 20) => {
  return utils_request.request.get(`/checkins/task/${taskId}`, { page, pageSize });
};
const getMonthlyCalendar = (year, month, taskId) => {
  const params = { year, month };
  if (taskId) {
    params.taskId = taskId;
  }
  return utils_request.request.get("/checkins/monthly-calendar", params);
};
exports.checkTodayCheckin = checkTodayCheckin;
exports.checkin = checkin;
exports.createTask = createTask;
exports.deleteTask = deleteTask;
exports.getCheckinList = getCheckinList;
exports.getMonthlyCalendar = getMonthlyCalendar;
exports.getTaskDetail = getTaskDetail;
exports.getTaskList = getTaskList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/task.js.map
