"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      currentIndex: 0,
      color: "#999999",
      selectedColor: "#667eea",
      tabList: [
        {
          pagePath: "/pages/index/index",
          text: "任务",
          icon: "icon-H5-renwuTAB"
        },
        {
          pagePath: "/pages/user/user",
          text: "我的",
          icon: "icon-wodeTAB"
        }
      ]
    };
  },
  mounted() {
    this.updateCurrentIndex();
  },
  methods: {
    updateCurrentIndex() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route = "/" + currentPage.route;
      this.currentIndex = this.tabList.findIndex((item) => item.pagePath === route);
    },
    switchTab(index) {
      if (this.currentIndex === index)
        return;
      const path = this.tabList[index].pagePath;
      common_vendor.index.switchTab({
        url: path
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.tabList, (item, index, i0) => {
      return {
        a: common_vendor.n(item.icon),
        b: $data.currentIndex === index ? $data.selectedColor : $data.color,
        c: common_vendor.t(item.text),
        d: $data.currentIndex === index ? $data.selectedColor : $data.color,
        e: index,
        f: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51c48e3c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/custom-tabbar/custom-tabbar.js.map
