"use strict";
const common_vendor = require("../common/vendor.js");
const api_auth = require("../api/auth.js");
const _sfc_main = {
  data() {
    return {
      avatarUrl: "",
      nickname: "",
      fromLogin: false
    };
  },
  computed: {
    canSubmit() {
      return this.nickname.trim().length > 0;
    }
  },
  onLoad(options) {
    this.fromLogin = options.fromLogin === "true";
  },
  methods: {
    // 选择头像
    onChooseAvatar(e) {
      common_vendor.index.__f__("log", "at pages/profile-edit.vue:60", "选择头像:", e);
      const { avatarUrl } = e.detail;
      this.avatarUrl = avatarUrl;
      common_vendor.index.__f__("log", "at pages/profile-edit.vue:63", "头像URL:", avatarUrl);
    },
    // 昵称输入完成
    onNicknameBlur(e) {
      common_vendor.index.__f__("log", "at pages/profile-edit.vue:68", "昵称输入:", e.detail.value);
      this.nickname = e.detail.value;
    },
    // 提交
    async handleSubmit() {
      if (!this.canSubmit) {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        common_vendor.index.__f__("log", "at pages/profile-edit.vue:87", "准备上传:", {
          nickname: this.nickname,
          avatarUrl: this.avatarUrl
        });
        let finalAvatarUrl = this.avatarUrl;
        if (this.avatarUrl && this.avatarUrl.startsWith("http://tmp/")) {
          common_vendor.index.__f__("log", "at pages/profile-edit.vue:98", "使用临时头像URL");
        }
        const res = await api_auth.updateUserInfo({
          nickname: this.nickname,
          avatarUrl: finalAvatarUrl || "/static/logo.webp"
        });
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => {
            if (this.fromLogin) {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            } else {
              common_vendor.index.navigateBack();
            }
          }, 1e3);
        } else {
          common_vendor.index.showToast({
            title: res.message || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/profile-edit.vue:134", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      }
    },
    // 跳过
    handleSkip() {
      if (this.fromLogin) {
        common_vendor.index.switchTab({
          url: "/pages/index/index"
        });
      } else {
        common_vendor.index.navigateBack();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.avatarUrl || "/static/logo.webp",
    b: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    c: common_vendor.o((...args) => $options.onNicknameBlur && $options.onNicknameBlur(...args)),
    d: $data.nickname,
    e: common_vendor.o(($event) => $data.nickname = $event.detail.value),
    f: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    g: !$options.canSubmit,
    h: common_vendor.o((...args) => $options.handleSkip && $options.handleSkip(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-204bc852"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../.sourcemap/mp-weixin/pages/profile-edit.js.map
