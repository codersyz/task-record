"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const _sfc_main = {
  data() {
    return {
      taskId: 0,
      note: "",
      loading: false,
      hasCheckedToday: false
    };
  },
  onLoad(options) {
    this.taskId = options.taskId;
    this.hasCheckedToday = options.hasChecked === "true";
    if (this.hasCheckedToday) {
      common_vendor.index.showModal({
        title: "提示",
        content: "今天已经打卡过了",
        showCancel: false,
        success: () => {
          common_vendor.index.navigateBack();
        }
      });
    }
  },
  methods: {
    async handleCheckin() {
      this.loading = true;
      try {
        const res = await api_task.checkin({
          taskId: this.taskId,
          note: this.note
        });
        if (res.code === 200) {
          if (res.data.isCompleted) {
            common_vendor.index.showModal({
              title: "🎉 恭喜",
              content: "打卡成功！你已完成目标任务！",
              showCancel: false,
              success: () => {
                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                  this.showNewAchievements(res.data.newAchievements);
                } else {
                  common_vendor.index.navigateBack();
                }
              }
            });
          } else {
            common_vendor.index.showToast({
              title: `打卡成功！连续${res.data.currentDays}天`,
              icon: "success"
            });
            setTimeout(() => {
              if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                this.showNewAchievements(res.data.newAchievements);
              } else {
                common_vendor.index.navigateBack();
              }
            }, 1500);
          }
        } else if (res.code === 1001) {
          common_vendor.index.showModal({
            title: "提示",
            content: res.message,
            showCancel: false,
            success: () => {
              common_vendor.index.navigateBack();
            }
          });
        } else {
          common_vendor.index.showToast({
            title: res.message || "打卡失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:104", "打卡失败:", error);
        common_vendor.index.showToast({
          title: "打卡失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 显示新解锁的成就
    showNewAchievements(achievements) {
      const achievementNames = achievements.map((a) => `${a.icon} ${a.name}`).join("\n");
      common_vendor.index.showModal({
        title: "🎉 解锁新成就",
        content: achievementNames,
        confirmText: "查看成就",
        cancelText: "稍后查看",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.redirectTo({
              url: "/pages/achievement/achievement"
            });
          } else {
            common_vendor.index.navigateBack();
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.note,
    b: common_vendor.o(($event) => $data.note = $event.detail.value),
    c: common_vendor.o((...args) => $options.handleCheckin && $options.handleCheckin(...args)),
    d: $data.loading
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-63c01bdb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkin/checkin.js.map
