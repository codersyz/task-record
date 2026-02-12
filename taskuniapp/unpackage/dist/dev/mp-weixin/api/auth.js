"use strict";
const utils_request = require("../utils/request.js");
const wechatLogin = (code) => {
  return utils_request.request.post("/auth/login", { code });
};
const testLogin = () => {
  return utils_request.request.post("/auth/test-login", {});
};
const updateUserInfo = (data) => {
  return utils_request.request.put("/auth/user", data);
};
const getUserInfo = () => {
  return utils_request.request.get("/auth/user");
};
exports.getUserInfo = getUserInfo;
exports.testLogin = testLogin;
exports.updateUserInfo = updateUserInfo;
exports.wechatLogin = wechatLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
