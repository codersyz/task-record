"use strict";
const common_vendor = require("../common/vendor.js");
const api_auth = require("../api/auth.js");
const utils_image = require("../utils/image.js");
const _sfc_main = {
  data() {
    return {
      avatarUrl: "",
      nickname: "",
      fromLogin: false,
      isLoading: true
    };
  },
  computed: {
    canSubmit() {
      return this.nickname.trim().length > 0;
    }
  },
  onLoad(options) {
    this.fromLogin = options.fromLogin === "true";
    if (!this.fromLogin) {
      this.loadUserInfo();
    } else {
      this.isLoading = false;
    }
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await api_auth.getUserInfo();
        if (res.code === 200) {
          this.nickname = res.data.nickname || "";
          this.avatarUrl = res.data.avatar_url || "";
          common_vendor.index.__f__("log", "at pages/profile-edit.vue:73", "加载用户信息:", res.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile-edit.vue:76", "加载用户信息失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    // 获取完整的头像URL
    getAvatarUrl(avatarUrl) {
      return utils_image.getAvatarUrl(avatarUrl);
    },
    // 选择头像
    onChooseAvatar(e) {
      common_vendor.index.__f__("log", "at pages/profile-edit.vue:89", "选择头像:", e);
      const { avatarUrl } = e.detail;
      this.avatarUrl = avatarUrl;
      common_vendor.index.__f__("log", "at pages/profile-edit.vue:92", "头像URL:", avatarUrl);
    },
    // 昵称输入完成
    onNicknameBlur(e) {
      common_vendor.index.__f__("log", "at pages/profile-edit.vue:97", "昵称输入:", e.detail.value);
      this.nickname = e.detail.value;
    },
    // 上传头像到服务器
    async uploadAvatar(tempFilePath) {
      return new Promise((resolve, reject) => {
        const token = common_vendor.index.getStorageSync("token");
        const baseURL = "https://syztools.cn/task-api";
        common_vendor.index.uploadFile({
          url: `${baseURL}/api/auth/upload-avatar`,
          filePath: tempFilePath,
          name: "avatar",
          header: {
            "Authorization": `Bearer ${token}`
          },
          success: (uploadRes) => {
            common_vendor.index.__f__("log", "at pages/profile-edit.vue:121", "上传响应:", uploadRes);
            try {
              const data = JSON.parse(uploadRes.data);
              if (data.code === 200) {
                resolve(data.data.avatarUrl);
              } else {
                reject(new Error(data.message || "上传失败"));
              }
            } catch (e) {
              reject(new Error("解析响应失败"));
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/profile-edit.vue:134", "上传失败:", error);
            reject(error);
          }
        });
      });
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
        common_vendor.index.__f__("log", "at pages/profile-edit.vue:156", "准备保存:", {
          nickname: this.nickname,
          avatarUrl: this.avatarUrl
        });
        let finalAvatarUrl = this.avatarUrl;
        if (this.avatarUrl && (this.avatarUrl.startsWith("http://tmp/") || this.avatarUrl.startsWith("wxfile://"))) {
          try {
            common_vendor.index.__f__("log", "at pages/profile-edit.vue:165", "上传临时头像到服务器...");
            finalAvatarUrl = await this.uploadAvatar(this.avatarUrl);
            common_vendor.index.__f__("log", "at pages/profile-edit.vue:167", "头像上传成功:", finalAvatarUrl);
          } catch (uploadError) {
            common_vendor.index.__f__("error", "at pages/profile-edit.vue:169", "头像上传失败:", uploadError);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "头像上传失败",
              icon: "none"
            });
            return;
          }
        } else if (this.avatarUrl && this.avatarUrl.startsWith("/uploads/")) {
          finalAvatarUrl = this.avatarUrl;
          common_vendor.index.__f__("log", "at pages/profile-edit.vue:180", "使用已有头像:", finalAvatarUrl);
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
        common_vendor.index.__f__("error", "at pages/profile-edit.vue:216", "保存失败:", error);
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
    a: $options.getAvatarUrl($data.avatarUrl),
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
