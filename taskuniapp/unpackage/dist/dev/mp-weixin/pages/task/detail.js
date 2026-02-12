"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const _sfc_main = {
  data() {
    return {
      taskId: 0,
      task: {},
      checkinList: [],
      hasCheckedToday: false
    };
  },
  onLoad(options) {
    this.taskId = options.id;
    this.loadData();
  },
  onShow() {
    if (this.taskId) {
      this.loadData();
    }
  },
  methods: {
    async loadData() {
      await this.loadTaskDetail();
      await this.checkTodayStatus();
      await this.loadCheckinList();
    },
    async loadTaskDetail() {
      try {
        const res = await api_task.getTaskDetail(this.taskId);
        if (res.code === 200) {
          this.task = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/detail.vue:104", "加载任务详情失败:", error);
      }
    },
    // 调用接口检查今天是否已打卡
    async checkTodayStatus() {
      try {
        common_vendor.index.__f__("log", "at pages/task/detail.vue:111", "检查今日打卡状态 - taskId:", this.taskId);
        const res = await api_task.checkTodayCheckin(this.taskId);
        common_vendor.index.__f__("log", "at pages/task/detail.vue:114", "打卡状态响应:", res);
        if (res.code === 200) {
          this.hasCheckedToday = res.data.hasChecked;
          common_vendor.index.__f__("log", "at pages/task/detail.vue:118", "今日是否已打卡:", this.hasCheckedToday);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/detail.vue:121", "检查打卡状态失败:", error);
      }
    },
    async loadCheckinList() {
      try {
        const res = await api_task.getCheckinList(this.taskId, 1, 20);
        if (res.code === 200) {
          this.checkinList = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/detail.vue:132", "加载打卡记录错误:", error);
      }
    },
    goToCheckin() {
      if (this.hasCheckedToday) {
        common_vendor.index.showToast({
          title: "今天已经打卡过了",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/checkin/checkin?taskId=${this.taskId}`
      });
    },
    // 显示操作菜单
    showActionSheet() {
      common_vendor.index.showActionSheet({
        itemList: ["编辑任务", "删除任务"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editTask();
          } else if (res.tapIndex === 1) {
            this.confirmDelete();
          }
        }
      });
    },
    // 编辑任务（暂未实现）
    editTask() {
      common_vendor.index.showToast({
        title: "编辑功能开发中",
        icon: "none"
      });
    },
    // 确认删除
    confirmDelete() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "删除后将无法恢复，确定要删除这个任务吗？",
        confirmText: "删除",
        confirmColor: "#FF3B30",
        success: async (res) => {
          if (res.confirm) {
            await this.handleDelete();
          }
        }
      });
    },
    // 执行删除
    async handleDelete() {
      try {
        common_vendor.index.showLoading({
          title: "删除中..."
        });
        const res = await api_task.deleteTask(this.taskId);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1e3);
        } else {
          common_vendor.index.showToast({
            title: res.message || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/task/detail.vue:217", "删除任务失败:", error);
        common_vendor.index.showToast({
          title: "删除失败，请重试",
          icon: "none"
        });
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      const weekday = weekdays[date.getDay()];
      return `${month}月${day}日 星期${weekday}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.task.title),
    b: common_vendor.o((...args) => $options.showActionSheet && $options.showActionSheet(...args)),
    c: $data.task.description
  }, $data.task.description ? {
    d: common_vendor.t($data.task.description)
  } : {}, {
    e: common_vendor.t($data.task.current_days),
    f: common_vendor.t($data.task.total_days),
    g: $data.task.target_days > 0
  }, $data.task.target_days > 0 ? {
    h: common_vendor.t($data.task.target_days)
  } : {}, {
    i: $data.task.status === 0
  }, $data.task.status === 0 ? {} : $data.hasCheckedToday ? {} : {
    k: common_vendor.o((...args) => $options.goToCheckin && $options.goToCheckin(...args))
  }, {
    j: $data.hasCheckedToday,
    l: $data.task.status === 0
  }, $data.task.status === 0 ? {
    m: common_vendor.t($data.task.target_days)
  } : $data.hasCheckedToday ? {} : {}, {
    n: $data.hasCheckedToday,
    o: $data.checkinList.length === 0
  }, $data.checkinList.length === 0 ? {} : {}, {
    p: common_vendor.f($data.checkinList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.formatDate(item.checkin_date)),
        b: item.note
      }, item.note ? {
        c: common_vendor.t(item.note)
      } : {}, {
        d: item.id
      });
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-43b93a3d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/task/detail.js.map
