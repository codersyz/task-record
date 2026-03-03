"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const api_subscription = require("../../api/subscription.js");
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
      isGuestMode: false,
      hasSubscription: false,
      // 示例任务数据（游客模式展示）
      demoTasks: [
        {
          id: "demo1",
          title: "每天阅读30分钟",
          category: "read",
          status: 1,
          current_days: 7,
          total_days: 15,
          target_days: 30
        },
        {
          id: "demo2",
          title: "坚持晨跑",
          category: "sport",
          status: 1,
          current_days: 3,
          total_days: 10,
          target_days: 21
        },
        {
          id: "demo3",
          title: "学习英语单词",
          category: "study",
          status: 1,
          current_days: 12,
          total_days: 25,
          target_days: 100
        }
      ]
    };
  },
  onLoad() {
    const token = common_vendor.index.getStorageSync("token");
    this.isGuestMode = !token;
  },
  onShow() {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.getStorageSync("isGuestMode");
    this.isGuestMode = !token;
    common_vendor.index.__f__("log", "at pages/index/index.vue:147", "=== 首页加载 ===");
    common_vendor.index.__f__("log", "at pages/index/index.vue:148", "Token:", token ? token.substring(0, 20) + "..." : "无");
    common_vendor.index.__f__("log", "at pages/index/index.vue:149", "游客模式:", this.isGuestMode);
    if (token) {
      this.loadTaskList();
      this.checkSubscriptionStatus();
    } else {
      this.taskList = this.demoTasks;
      this.calculateStats();
    }
  },
  methods: {
    async loadTaskList() {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:164", "开始加载任务列表...");
        const res = await api_task.getTaskList();
        common_vendor.index.__f__("log", "at pages/index/index.vue:166", "任务列表响应:", res);
        if (res.code === 200) {
          this.taskList = res.data;
          common_vendor.index.__f__("log", "at pages/index/index.vue:170", "任务列表数据:", this.taskList);
          this.calculateStats();
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:173", "获取任务列表失败:", res);
          common_vendor.index.showToast({
            title: res.message || "获取任务失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:180", "加载任务列表错误:", error);
      }
    },
    // 检查订阅状态
    async checkSubscriptionStatus() {
      try {
        const res = await api_subscription.getSubscriptionStatus("daily_reminder");
        if (res.code === 200) {
          this.hasSubscription = res.data.hasSubscription;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:192", "检查订阅状态失败:", error);
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
      if (this.isGuestMode) {
        common_vendor.index.showModal({
          title: "体验示例",
          content: "这是示例任务，登录后可以创建自己的任务并开始打卡",
          confirmText: "立即登录",
          cancelText: "继续浏览",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/task/detail?id=${id}`
      });
    },
    goToCreate() {
      if (this.isGuestMode) {
        common_vendor.index.showModal({
          title: "需要登录",
          content: "登录后即可创建任务并开始打卡",
          confirmText: "立即登录",
          cancelText: "继续浏览",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/task/create"
      });
    },
    // 跳转到登录页
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    // 跳转到提醒设置
    goToReminderSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/reminder-settings/reminder-settings"
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
    a: !$data.isGuestMode && !$data.hasSubscription
  }, !$data.isGuestMode && !$data.hasSubscription ? {
    b: common_vendor.o((...args) => $options.goToReminderSettings && $options.goToReminderSettings(...args))
  } : {}, {
    c: common_vendor.t($data.taskStats.total),
    d: common_vendor.t($data.taskStats.active),
    e: common_vendor.t($data.taskStats.totalCheckins),
    f: $data.isGuestMode
  }, $data.isGuestMode ? {
    g: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  } : {}, {
    h: $data.taskList.length === 0 && !$data.isGuestMode
  }, $data.taskList.length === 0 && !$data.isGuestMode ? {} : {}, {
    i: common_vendor.f($data.taskList, (task, k0, i0) => {
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
    j: common_vendor.o((...args) => $options.goToCreate && $options.goToCreate(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
