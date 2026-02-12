<template>
    <view class="container">
        <view class="title">完善个人信息</view>
        <view class="subtitle">请填写你的昵称和头像</view>

        <view class="form">
            <!-- 头像选择 -->
            <view class="form-item">
                <text class="label">头像</text>
                <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                    <image class="avatar" :src="avatarUrl || '/static/logo.webp'" mode="aspectFill"></image>
                    <text class="avatar-tip">点击更换头像</text>
                </button>
            </view>

            <!-- 昵称输入 -->
            <view class="form-item">
                <text class="label">昵称</text>
                <input class="input" type="nickname" v-model="nickname" placeholder="请输入昵称" @blur="onNicknameBlur" />
            </view>
        </view>

        <view class="btn-group">
            <button class="submit-btn" @click="handleSubmit" :disabled="!canSubmit">
                保存
            </button>
            <button class="skip-btn" @click="handleSkip">
                跳过
            </button>
        </view>

        <view class="tips">
            <text class="tip-text">💡 提示：头像和昵称用于在小程序中展示你的个人信息</text>
        </view>
    </view>
</template>

<script>
import { updateUserInfo } from '@/api/auth';

export default {
    data() {
        return {
            avatarUrl: '',
            nickname: '',
            fromLogin: false
        };
    },
    computed: {
        canSubmit() {
            return this.nickname.trim().length > 0;
        }
    },
    onLoad(options) {
        this.fromLogin = options.fromLogin === 'true';
    },
    methods: {
        // 选择头像
        onChooseAvatar(e) {
            console.log('选择头像:', e);
            const { avatarUrl } = e.detail;
            this.avatarUrl = avatarUrl;
            console.log('头像URL:', avatarUrl);
        },

        // 昵称输入完成
        onNicknameBlur(e) {
            console.log('昵称输入:', e.detail.value);
            this.nickname = e.detail.value;
        },

        // 提交
        async handleSubmit() {
            if (!this.canSubmit) {
                uni.showToast({
                    title: '请输入昵称',
                    icon: 'none'
                });
                return;
            }

            try {
                uni.showLoading({
                    title: '保存中...'
                });

                console.log('准备上传:', {
                    nickname: this.nickname,
                    avatarUrl: this.avatarUrl
                });

                // 如果有头像，先上传
                let finalAvatarUrl = this.avatarUrl;
                if (this.avatarUrl && this.avatarUrl.startsWith('http://tmp/')) {
                    // 临时文件，需要上传到服务器
                    // 这里简化处理，直接使用临时URL
                    // 生产环境应该上传到自己的服务器或云存储
                    console.log('使用临时头像URL');
                }

                // 更新用户信息
                const res = await updateUserInfo({
                    nickname: this.nickname,
                    avatarUrl: finalAvatarUrl || '/static/logo.webp'
                });

                uni.hideLoading();

                if (res.code === 200) {
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        if (this.fromLogin) {
                            // 从登录页来的，跳转到首页
                            uni.switchTab({
                                url: '/pages/index/index'
                            });
                        } else {
                            // 从个人中心来的，返回
                            uni.navigateBack();
                        }
                    }, 1000);
                } else {
                    uni.showToast({
                        title: res.message || '保存失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.hideLoading();
                console.error('保存失败:', error);
                uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
            }
        },

        // 跳过
        handleSkip() {
            if (this.fromLogin) {
                uni.switchTab({
                    url: '/pages/index/index'
                });
            } else {
                uni.navigateBack();
            }
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #F5F5F5;
    padding: 40rpx;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333333;
    text-align: center;
    margin-bottom: 20rpx;
}

.subtitle {
    font-size: 28rpx;
    color: #999999;
    text-align: center;
    margin-bottom: 60rpx;
}

.form {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 40rpx;
    margin-bottom: 40rpx;
}

.form-item {
    margin-bottom: 40rpx;
}

.form-item:last-child {
    margin-bottom: 0;
}

.label {
    display: block;
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 20rpx;
    font-weight: bold;
}

.avatar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx;
    background: #F5F5F5;
    border-radius: 16rpx;
    border: none;
}

.avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 80rpx;
    margin-bottom: 20rpx;
}

.avatar-tip {
    font-size: 24rpx;
    color: #999999;
}

.input {
    width: 100%;
    height: 80rpx;
    background: #F5F5F5;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
}

.btn-group {
    margin-bottom: 40rpx;
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    margin-bottom: 20rpx;
}

.submit-btn[disabled] {
    background: #CCCCCC;
}

.skip-btn {
    width: 100%;
    height: 88rpx;
    background: #FFFFFF;
    color: #666666;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: 1rpx solid #E0E0E0;
}

.tips {
    padding: 20rpx;
}

.tip-text {
    font-size: 24rpx;
    color: #999999;
    line-height: 1.6;
}
</style>
