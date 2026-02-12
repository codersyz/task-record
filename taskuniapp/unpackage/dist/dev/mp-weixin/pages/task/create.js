"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const _sfc_main = {
  data() {
    return {
      form: {
        title: "",
        description: "",
        targetDays: "",
        category: "other"
      },
      categories: [
        { value: "study", label: "学习", icon: "📚" },
        { value: "sport", label: "运动", icon: "🏃" },
        { value: "read", label: "阅读", icon: "📖" },
        { value: "health", label: "健康", icon: "💪" },
        { value: "work", label: "工作", icon: "💼" },
        { value: "other", label: "其他", icon: "📝" }
      ]
    };
  },
  methods: {
    selectCategory(value) {
      this.form.category = value;
    },
    async handleSubmit() {
      if (!this.form.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入任务名称",
          icon: "none"
        });
        return;
      }
      try {
        const res = await api_task.createTask({
          title: this.form.title,
          description: this.form.description,
          targetDays: this.form.targetDays || 0,
          category: this.form.category
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "创建成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1e3);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/task/create.vue:92", "创建任务失败:", error);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.title,
    b: common_vendor.o(($event) => $data.form.title = $event.detail.value),
    c: common_vendor.f($data.categories, (cat, k0, i0) => {
      return {
        a: common_vendor.t(cat.icon),
        b: common_vendor.t(cat.label),
        c: cat.value,
        d: $data.form.category === cat.value ? 1 : "",
        e: common_vendor.o(($event) => $options.selectCategory(cat.value), cat.value)
      };
    }),
    d: $data.form.description,
    e: common_vendor.o(($event) => $data.form.description = $event.detail.value),
    f: $data.form.targetDays,
    g: common_vendor.o(common_vendor.m(($event) => $data.form.targetDays = $event.detail.value, {
      number: true
    })),
    h: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9ce79d2e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/task/create.js.map
