"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/login.js";
  "./pages/profile-edit.js";
  "./pages/calendar/calendar.js";
  "./pages/achievement/achievement.js";
  "./pages/points/records.js";
  "./pages/points/ranking.js";
  "./pages/points/shop.js";
  "./pages/task/create.js";
  "./pages/task/detail.js";
  "./pages/checkin/checkin.js";
  "./pages/user/user.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      common_vendor.index.setStorageSync("isGuestMode", true);
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:13", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
