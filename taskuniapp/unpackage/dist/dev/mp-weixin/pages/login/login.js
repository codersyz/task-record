"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      testLoading: false
    };
  },
  methods: {
    // 测试登录（开发环境使用）
    async handleTestLogin() {
      this.testLoading = true;
      try {
        const res = await api_auth.testLogin();
        if (res.code === 200) {
          common_vendor.index.setStorageSync("token", res.data.token);
          common_vendor.index.setStorageSync("userId", res.data.userId);
          common_vendor.index.removeStorageSync("isGuestMode");
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1e3);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:62", "测试登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请检查后端服务",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.testLoading = false;
      }
    },
    async handleLogin() {
      this.loading = true;
      try {
        common_vendor.index.login({
          provider: "weixin",
          success: async (loginRes) => {
            if (!loginRes.code) {
              common_vendor.index.showToast({
                title: "获取登录code失败",
                icon: "none"
              });
              this.loading = false;
              return;
            }
            try {
              const res = await api_auth.wechatLogin(loginRes.code);
              if (res.code === 200) {
                common_vendor.index.setStorageSync("token", res.data.token);
                common_vendor.index.setStorageSync("userId", res.data.userId);
                common_vendor.index.removeStorageSync("isGuestMode");
                common_vendor.index.showToast({
                  title: "登录成功",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.navigateTo({
                    url: "/pages/profile-edit?fromLogin=true"
                  });
                }, 1e3);
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/login/login.vue:114", "后端登录失败:", error);
              common_vendor.index.showToast({
                title: error.message || "登录失败",
                icon: "none"
              });
            } finally {
              this.loading = false;
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/login/login.vue:124", "微信登录失败:", error);
            common_vendor.index.showToast({
              title: "微信登录失败",
              icon: "none"
            });
            this.loading = false;
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:133", "登录错误:", error);
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
        this.loading = false;
      }
    },
    // 获取用户信息并更新到服务器
    async getUserInfoAndUpdate() {
      return new Promise((resolve) => {
        common_vendor.index.getUserProfile({
          desc: "用于完善用户资料",
          success: async (userInfoRes) => {
            common_vendor.index.__f__("log", "at pages/login/login.vue:148", "获取到用户信息:", userInfoRes.userInfo);
            try {
              const { nickName, avatarUrl } = userInfoRes.userInfo;
              await api_auth.updateUserInfo({
                nickname: nickName,
                avatarUrl
              });
              common_vendor.index.__f__("log", "at pages/login/login.vue:159", "用户信息已更新到服务器");
              resolve();
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/login/login.vue:162", "更新用户信息失败:", error);
              resolve();
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/login/login.vue:167", "用户拒绝授权或获取失败:", error);
            resolve();
          }
        });
      });
    },
    // 跳过登录，以游客身份浏览
    skipLogin() {
      common_vendor.index.setStorageSync("isGuestMode", true);
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    c: $data.loading,
    d: common_vendor.o((...args) => $options.skipLogin && $options.skipLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
