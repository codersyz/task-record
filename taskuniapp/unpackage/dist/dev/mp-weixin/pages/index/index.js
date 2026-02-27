"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const customTabbar = () => "../../components/custom-tabbar/custom-tabbar.js";
const _sfc_main = {
  components: {
    customTabbar
  },
  data() {
    return {
      taskList: [],
      taskStats: {
        total: 0,
        active: 0,
        totalCheckins: 0
      },
      isGuestMode: false
    };
  },
  onLoad() {
    const token = common_vendor.index.getStorageSync("token");
    this.isGuestMode = !token;
  },
  onShow() {
    const token = common_vendor.index.getStorageSync("token");
    const isGuestMode = common_vendor.index.getStorageSync("isGuestMode");
    common_vendor.index.__f__("log", "at pages/index/index.vue:97", "=== 首页加载 ===");
    common_vendor.index.__f__("log", "at pages/index/index.vue:98", "Token:", token ? token.substring(0, 20) + "..." : "无");
    common_vendor.index.__f__("log", "at pages/index/index.vue:99", "游客模式:", isGuestMode);
    if (token) {
      this.loadTaskList();
    } else {
      this.taskList = [];
      this.calculateStats();
    }
  },
  methods: {
    async loadTaskList() {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:113", "开始加载任务列表...");
        const res = await api_task.getTaskList();
        common_vendor.index.__f__("log", "at pages/index/index.vue:115", "任务列表响应:", res);
        if (res.code === 200) {
          this.taskList = res.data;
          common_vendor.index.__f__("log", "at pages/index/index.vue:119", "任务列表数据:", this.taskList);
          this.calculateStats();
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:122", "获取任务列表失败:", res);
          common_vendor.index.showToast({
            title: res.message || "获取任务失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:129", "加载任务列表错误:", error);
      }
    },
    calculateStats() {
      this.taskStats.total = this.taskList.length;
      this.taskStats.active = this.taskList.filter((t) => t.status === 1).length;
      this.taskStats.totalCheckins = this.taskList.reduce((sum, t) => sum + t.total_days, 0);
    },
    getProgress(task) {
      if (task.target_days === 0)
        return 0;
      return Math.min(task.total_days / task.target_days * 100, 100);
    },
    goToDetail(id) {
      if (this.checkGuestMode())
        return;
      common_vendor.index.navigateTo({
        url: `/pages/task/detail?id=${id}`
      });
    },
    goToCreate() {
      if (this.checkGuestMode())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/task/create"
      });
    },
    // 检查游客模式
    checkGuestMode() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后使用此功能",
          confirmText: "去登录",
          cancelText: "继续浏览",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return true;
      }
      return false;
    },
    // 跳转到登录页
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    getCategoryName(category) {
      const names = {
        study: "学习",
        sport: "运动",
        read: "阅读",
        health: "健康",
        work: "工作",
        other: "其他"
      };
      return names[category] || "其他";
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
  return common_vendor.e({
    a: common_vendor.t($data.taskStats.total),
    b: common_vendor.t($data.taskStats.active),
    c: common_vendor.t($data.taskStats.totalCheckins),
    d: $data.taskList.length === 0
  }, $data.taskList.length === 0 ? common_vendor.e({
    e: !$data.isGuestMode
  }, !$data.isGuestMode ? {} : {
    f: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  }) : {}, {
    g: common_vendor.f($data.taskList, (task, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getCategoryName(task.category)),
        b: common_vendor.n("category-" + task.category),
        c: common_vendor.t(task.title),
        d: common_vendor.t(task.status === 1 ? "进行中" : "已完成"),
        e: common_vendor.n(task.status === 1 ? "active" : "completed"),
        f: common_vendor.t(task.current_days),
        g: common_vendor.t(task.total_days),
        h: task.target_days > 0
      }, task.target_days > 0 ? {
        i: common_vendor.t(task.target_days),
        j: $options.getProgress(task) + "%"
      } : {}, {
        k: task.id,
        l: common_vendor.o(($event) => $options.goToDetail(task.id), task.id)
      });
    }),
    h: common_vendor.o((...args) => $options.goToCreate && $options.goToCreate(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
