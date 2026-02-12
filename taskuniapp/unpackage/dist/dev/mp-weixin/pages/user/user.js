"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const api_task = require("../../api/task.js");
const customTabbar = () => "../../components/custom-tabbar/custom-tabbar.js";
const _sfc_main = {
  components: {
    customTabbar
  },
  data() {
    return {
      userInfo: {},
      stats: {
        totalTasks: 0,
        totalCheckins: 0,
        maxStreak: 0
      }
    };
  },
  onShow() {
    this.loadUserInfo();
    this.loadStats();
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await api_auth.getUserInfo();
        if (res.code === 200) {
          this.userInfo = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:85", "加载用户信息失败:", error);
      }
    },
    async loadStats() {
      try {
        const res = await api_task.getTaskList();
        if (res.code === 200) {
          const tasks = res.data;
          this.stats.totalTasks = tasks.length;
          this.stats.totalCheckins = tasks.reduce((sum, t) => sum + t.total_days, 0);
          this.stats.maxStreak = Math.max(...tasks.map((t) => t.current_days), 0);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:99", "加载统计信息失败:", error);
      }
    },
    // 编辑个人信息
    editProfile() {
      common_vendor.index.navigateTo({
        url: "/pages/profile-edit"
      });
    },
    // 跳转到打卡日历
    goToCalendar() {
      common_vendor.index.navigateTo({
        url: "/pages/calendar/calendar"
      });
    },
    // 跳转到成就中心
    goToAchievement() {
      common_vendor.index.navigateTo({
        url: "/pages/achievement/achievement"
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userId");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_custom_tabbar2 = common_vendor.resolveComponent("custom-tabbar");
  _easycom_custom_tabbar2();
}
const _easycom_custom_tabbar = () => "../../components/custom-tabbar/custom-tabbar.js";
if (!Math) {
  _easycom_custom_tabbar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar_url || "/static/logo.webp",
    b: common_vendor.t($data.userInfo.nickname || "未设置昵称"),
    c: common_vendor.t($data.stats.totalTasks),
    d: common_vendor.t($data.stats.totalCheckins),
    e: common_vendor.t($data.stats.maxStreak),
    f: common_vendor.o((...args) => $options.goToCalendar && $options.goToCalendar(...args)),
    g: common_vendor.o((...args) => $options.goToAchievement && $options.goToAchievement(...args)),
    h: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args)),
    i: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
