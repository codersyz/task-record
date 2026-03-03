"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const api_subscription = require("../../api/subscription.js");
const _sfc_main = {
  data() {
    return {
      taskId: 0,
      note: "",
      loading: false,
      hasCheckedToday: false,
      // 模板ID - 需要在微信公众平台配置后替换
      templateId: "ezyMyEq365A0q4W9oja0NWXIssOZxxUVkO38m_FyM_g"
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
          let successMsg = `打卡成功！连续${res.data.currentDays}天`;
          if (res.data.points && res.data.points.total > 0) {
            const points = res.data.points;
            let pointsMsg = `

💎 获得 ${points.total} 积分`;
            if (points.daily > 0) {
              pointsMsg += `
✨ 每日首次打卡 +${points.daily}`;
            }
            if (points.streak7 > 0) {
              pointsMsg += `
🔥 连续${points.consecutiveDays}天奖励 +${points.streak7}`;
            }
            if (points.streak30 > 0) {
              pointsMsg += `
⭐ 连续${points.consecutiveDays}天奖励 +${points.streak30}`;
            }
            successMsg += pointsMsg;
          }
          if (res.data.isCompleted) {
            common_vendor.index.showModal({
              title: "🎉 恭喜",
              content: "打卡成功！你已完成目标任务！" + (res.data.points && res.data.points.total > 0 ? `

💎 获得 ${res.data.points.total} 积分` : ""),
              showCancel: false,
              success: () => {
                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                  this.showNewAchievements(res.data.newAchievements);
                } else {
                  this.promptSubscribe();
                }
              }
            });
          } else {
            if (res.data.points && res.data.points.total > 0) {
              common_vendor.index.showModal({
                title: "✅ 打卡成功",
                content: successMsg,
                showCancel: false,
                success: () => {
                  if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                    this.showNewAchievements(res.data.newAchievements);
                  } else {
                    this.promptSubscribe();
                  }
                }
              });
            } else {
              common_vendor.index.showToast({
                title: successMsg,
                icon: "success"
              });
              setTimeout(() => {
                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                  this.showNewAchievements(res.data.newAchievements);
                } else {
                  this.promptSubscribe();
                }
              }, 1500);
            }
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
        common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:148", "打卡失败:", error);
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
            this.promptSubscribe();
          }
        }
      });
    },
    // 提示订阅消息
    async promptSubscribe() {
      try {
        const statusRes = await api_subscription.getSubscriptionStatus("daily_reminder");
        if (statusRes.code === 200 && statusRes.data.hasSubscription) {
          common_vendor.index.__f__("log", "at pages/checkin/checkin.vue:186", "用户已订阅，跳过提示");
          common_vendor.index.navigateBack();
          return;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:191", "检查订阅状态失败:", error);
      }
      common_vendor.index.showModal({
        title: "💡 温馨提示",
        content: "订阅消息提醒，每天准时打卡不遗漏",
        confirmText: "立即订阅",
        cancelText: "下次再说",
        success: async (res) => {
          if (res.confirm) {
            await this.requestSubscribe();
          }
          common_vendor.index.navigateBack();
        }
      });
    },
    // 请求订阅
    async requestSubscribe() {
      try {
        const res = await common_vendor.index.requestSubscribeMessage({
          tmplIds: [this.templateId]
        });
        common_vendor.index.__f__("log", "at pages/checkin/checkin.vue:216", "订阅结果:", res);
        if (res[this.templateId] === "accept") {
          await api_subscription.recordSubscription({
            templateId: this.templateId,
            templateType: "daily_reminder"
          });
          common_vendor.index.showToast({
            title: "订阅成功",
            icon: "success"
          });
        } else if (res[this.templateId] === "reject") {
          common_vendor.index.showToast({
            title: "您拒绝了订阅",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkin/checkin.vue:236", "订阅失败:", error);
      }
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
