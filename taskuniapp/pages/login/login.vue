<template>
    <view class="login-container">
        <view class="login-content">
            <image class="logo" src="/static/logo.webp" mode="aspectFit"></image>
            <text class="title">任务打卡</text>
            <text class="subtitle">坚持每一天，成就更好的自己</text>

            <button class="login-btn" type="primary" @click="handleLogin" :loading="loading">
                微信一键登录
            </button>

            <button class="skip-btn" @click="skipLogin">
                跳过，以游客身份浏览
            </button>

            <!-- 开发环境：测试登录按钮 -->
            <!-- <button class="test-login-btn" @click="handleTestLogin" :loading="testLoading">
                测试登录（开发用）
            </button> -->
        </view>
    </view>
</template>

<script>
import { wechatLogin, testLogin, updateUserInfo } from '@/api/auth';

export default {
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
                const res = await testLogin();

                if (res.code === 200) {
                    // 保存token
                    uni.setStorageSync('token', res.data.token);
                    uni.setStorageSync('userId', res.data.userId);
                    // 清除游客模式标识
                    uni.removeStorageSync('isGuestMode');

                    uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                    });

                    // 跳转到首页
                    setTimeout(() => {
                        uni.switchTab({
                            url: '/pages/index/index'
                        });
                    }, 1000);
                }
            } catch (error) {
                console.error('测试登录失败:', error);
                uni.showToast({
                    title: '登录失败，请检查后端服务',
                    icon: 'none',
                    duration: 2000
                });
            } finally {
                this.testLoading = false;
            }
        },

        async handleLogin() {
            this.loading = true;

            try {
                // 第一步：获取微信登录code
                uni.login({
                    provider: 'weixin',
                    success: async (loginRes) => {
                        if (!loginRes.code) {
                            uni.showToast({
                                title: '获取登录code失败',
                                icon: 'none'
                            });
                            this.loading = false;
                            return;
                        }

                        try {
                            // 第二步：调用后端登录接口
                            const res = await wechatLogin(loginRes.code);

                            if (res.code === 200) {
                                // 保存token
                                uni.setStorageSync('token', res.data.token);
                                uni.setStorageSync('userId', res.data.userId);
                                // 清除游客模式标识
                                uni.removeStorageSync('isGuestMode');

                                uni.showToast({
                                    title: '登录成功',
                                    icon: 'success'
                                });

                                // 跳转到个人信息编辑页
                                setTimeout(() => {
                                    uni.navigateTo({
                                        url: '/pages/profile-edit?fromLogin=true'
                                    });
                                }, 1000);
                            }
                        } catch (error) {
                            console.error('后端登录失败:', error);
                            uni.showToast({
                                title: error.message || '登录失败',
                                icon: 'none'
                            });
                        } finally {
                            this.loading = false;
                        }
                    },
                    fail: (error) => {
                        console.error('微信登录失败:', error);
                        uni.showToast({
                            title: '微信登录失败',
                            icon: 'none'
                        });
                        this.loading = false;
                    }
                });
            } catch (error) {
                console.error('登录错误:', error);
                uni.showToast({
                    title: '登录失败',
                    icon: 'none'
                });
                this.loading = false;
            }
        },

        // 获取用户信息并更新到服务器
        async getUserInfoAndUpdate() {
            return new Promise((resolve) => {
                uni.getUserProfile({
                    desc: '用于完善用户资料',
                    success: async (userInfoRes) => {
                        console.log('获取到用户信息:', userInfoRes.userInfo);

                        try {
                            const { nickName, avatarUrl } = userInfoRes.userInfo;

                            // 更新到服务器
                            await updateUserInfo({
                                nickname: nickName,
                                avatarUrl: avatarUrl
                            });

                            console.log('用户信息已更新到服务器');
                            resolve();
                        } catch (error) {
                            console.error('更新用户信息失败:', error);
                            resolve(); // 即使失败也继续登录流程
                        }
                    },
                    fail: (error) => {
                        console.log('用户拒绝授权或获取失败:', error);
                        resolve(); // 用户拒绝也继续登录流程
                    }
                });
            });
        },

        // 跳过登录，以游客身份浏览
        skipLogin() {
            uni.setStorageSync('isGuestMode', true);
            uni.switchTab({
                url: '/pages/index/index'
            });
        }
    }
};
</script>

<style scoped>
.login-container {
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx;
}

.logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
}

.title {
    font-size: 48rpx;
    font-weight: bold;
    color: #FFFFFF;
    margin-bottom: 20rpx;
}

.subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 100rpx;
}

.login-btn {
    width: 500rpx;
    height: 88rpx;
    background: #FFFFFF;
    color: #667eea;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    margin-bottom: 20rpx;
}

.test-login-btn {
    width: 500rpx;
    height: 88rpx;
    background: rgba(255, 255, 255, 0.3);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: 2rpx solid #FFFFFF;
}

.skip-btn {
    width: 500rpx;
    height: 88rpx;
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border-radius: 44rpx;
    font-size: 28rpx;
    border: none;
    margin-top: 20rpx;
}
</style>
