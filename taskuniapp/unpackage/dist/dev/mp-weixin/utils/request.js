"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://192.168.202.53:3000/api";
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.reLaunch({
            url: "/pages/login/login"
          });
          reject(res.data);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "请求失败",
            icon: "none"
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
        reject(err);
      }
    });
  });
};
const request$1 = {
  get(url, data) {
    return request({ url, method: "GET", data });
  },
  post(url, data) {
    return request({ url, method: "POST", data });
  },
  put(url, data) {
    return request({ url, method: "PUT", data });
  },
  delete(url, data) {
    return request({ url, method: "DELETE", data });
  }
};
exports.request = request$1;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
