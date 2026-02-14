"use strict";
const common_vendor = require("../../common/vendor.js");
const api_achievement = require("../../api/achievement.js");
const _sfc_main = {
  data() {
    return {
      achievements: [],
      unlockedCount: 0,
      totalCount: 0,
      completionRate: 0
    };
  },
  onLoad() {
    this.loadAchievements();
  },
  onShow() {
    this.loadAchievements();
  },
  methods: {
    async loadAchievements() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_achievement.getAchievements();
        if (res.code === 200) {
          this.achievements = res.data.achievements.sort((a, b) => {
            if (a.unlocked && !b.unlocked)
              return -1;
            if (!a.unlocked && b.unlocked)
              return 1;
            return 0;
          });
          this.unlockedCount = res.data.unlockedCount;
          this.totalCount = res.data.totalCount;
          this.completionRate = Math.round(this.unlockedCount / this.totalCount * 100);
        }
        common_vendor.index.hideLoading();
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/achievement/achievement.vue:91", "加载成就失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    },
    formatDate(dateStr) {
      if (!dateStr)
        return "";
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日解锁`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.unlockedCount),
    b: common_vendor.t($data.totalCount),
    c: common_vendor.t($data.completionRate),
    d: common_vendor.f($data.achievements, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon),
        b: item.unlocked
      }, item.unlocked ? {} : {}, {
        c: common_vendor.t(item.name),
        d: item.unlocked
      }, item.unlocked ? {
        e: common_vendor.t($options.formatDate(item.unlockedAt))
      } : {}, {
        f: common_vendor.t(item.desc),
        g: !item.unlocked
      }, !item.unlocked ? {
        h: item.progress.percentage + "%"
      } : {}, {
        i: !item.unlocked
      }, !item.unlocked ? {
        j: common_vendor.t(item.progress.current),
        k: common_vendor.t(item.progress.target)
      } : {}, {
        l: index,
        m: item.unlocked ? 1 : ""
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-127b3c96"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/achievement/achievement.js.map
