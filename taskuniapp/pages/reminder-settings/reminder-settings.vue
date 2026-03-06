<template>
    <view class="container">
        <view class="header">
            <text class="title">提醒设置</text>
            <text class="subtitle">设置您的打卡提醒偏好</text>
        </view>

        <view class="settings-list">
            <!-- 每日打卡提醒 -->
            <view class="setting-item">
                <view class="setting-info">
                    <text class="setting-label">📅 每日打卡提醒</text>
                    <text class="setting-desc">每天定时提醒您打卡</text>
                </view>
                <switch :checked="settings.daily_reminder" @change="onDailyReminderChange" color="#667eea" />
            </view>

            <!-- 提醒时间 -->
            <view class="setting-item" v-if="settings.daily_reminder">
                <view class="setting-info">
                    <text class="setting-label">⏰ 提醒时间</text>
                    <text class="setting-desc">选择每天提醒的时间</text>
                </view>
                <picker mode="time" :value="settings.reminder_time" @change="onTimeChange">
                    <view class="time-picker">
                        <text>{{ settings.reminder_time }}</text>
                        <text class="iconfont icon-arrow-right"></text>
                    </view>
                </picker>
            </view>

            <!-- 订阅状态 -->
            <view class="setting-item" v-if="settings.daily_reminder">
                <view class="setting-info">
                    <text class="setting-label">🔔 订阅状态</text>
                    <text class="setting-desc">{{ hasSubscription ? '已订阅' : '未订阅' }}</text>
                </view>
                <button class="subscribe-btn" :class="{ subscribed: hasSubscription }" @click="requestSubscribe">
                    {{ hasSubscription ? '已订阅' : '立即订阅' }}
                </button>
            </view>

            <!-- 连续打卡预警 -->
            <!-- <view class="setting-item">
                <view class="setting-info">
                    <text class="setting-label">⚠️ 连续打卡预警</text>
                    <text class="setting-desc">连续打卡即将中断时提醒</text>
                </view>
                <switch :checked="settings.streak_warning" @change="onStreakWarningChange" color="#667eea" />
            </view> -->

            <!-- 成就解锁通知 -->
            <!-- <view class="setting-item">
                <view class="setting-info">
                    <text class="setting-label">🏆 成就解锁通知</text>
                    <text class="setting-desc">解锁新成就时通知您</text>
                </view>
                <switch :checked="settings.achievement_notify" @change="onAchievementNotifyChange" color="#667eea" />
            </view> -->
        </view>

        <view class="tips">
            <text class="tips-title">💡 温馨提示</text>
            <text class="tips-text">• 订阅消息需要您的授权，每次订阅可发送一次提醒</text>
            <text class="tips-text">• 建议在打卡成功后重新订阅，以便持续接收提醒</text>
            <text class="tips-text">• 您可以随时在此页面管理提醒设置</text>
        </view>

        <view class="save-btn-wrapper">
            <button class="save-btn" @click="saveSettings">保存设置</button>
        </view>
    </view>
</template>

<script>
import { getReminderSettings, updateReminderSettings, recordSubscription, getSubscriptionStatus } from '../../api/subscription.js';

export default {
    data() {
        return {
            settings: {
                daily_reminder: 1,
                reminder_time: '09:00',
                // streak_warning: 1,
                // achievement_notify: 1
            },
            hasSubscription: false,
            // 模板ID - 需要在微信公众平台配置后替换
            templateId: 'ezyMyEq365A0q4W9oja0NWXIssOZxxUVkO38m_FyM_g'
        };
    },

    onLoad() {
        this.loadSettings();
        this.checkSubscriptionStatus();
    },

    methods: {
        // 加载设置
        async loadSettings() {
            try {
                const res = await getReminderSettings();
                if (res.code === 200) {
                    this.settings = {
                        daily_reminder: res.data.daily_reminder,
                        reminder_time: res.data.reminder_time ? res.data.reminder_time.substring(0, 5) : '09:00',
                        streak_warning: res.data.streak_warning,
                        achievement_notify: res.data.achievement_notify
                    };
                }
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        },

        // 检查订阅状态
        async checkSubscriptionStatus() {
            try {
                const res = await getSubscriptionStatus('daily_reminder');
                if (res.code === 200) {
                    this.hasSubscription = res.data.hasSubscription;
                }
            } catch (error) {
                console.error('检查订阅状态失败:', error);
            }
        },

        // 请求订阅
        async requestSubscribe() {
            if (this.hasSubscription) {
                uni.showToast({
                    title: '您已订阅',
                    icon: 'none'
                });
                return;
            }

            // 先显示说明
            uni.showModal({
                title: '订阅消息授权',
                content: '为了及时提醒您打卡，需要您授权订阅消息。\n\n请在弹出的授权框中点击"允许"。\n\n注意：每次授权只能发送一次提醒，发送后需要重新订阅。',
                confirmText: '去授权',
                cancelText: '取消',
                success: async (modalRes) => {
                    if (!modalRes.confirm) {
                        return;
                    }

                    try {
                        const res = await uni.requestSubscribeMessage({
                            tmplIds: [this.templateId]
                        });

                        console.log('订阅结果:', res);

                        if (res[this.templateId] === 'accept') {
                            // 记录订阅
                            await recordSubscription({
                                templateId: this.templateId,
                                templateType: 'daily_reminder'
                            });

                            this.hasSubscription = true;
                            uni.showToast({
                                title: '订阅成功',
                                icon: 'success'
                            });
                        } else if (res[this.templateId] === 'reject') {
                            // 用户拒绝了订阅
                            uni.showModal({
                                title: '订阅失败',
                                content: '您拒绝了订阅授权。\n\n如需接收提醒，请按以下步骤操作：\n1. 打开微信"我-设置-通知-订阅消息"\n2. 找到本小程序并开启权限\n3. 返回小程序重新订阅',
                                showCancel: false,
                                confirmText: '我知道了'
                            });
                        } else if (res[this.templateId] === 'ban') {
                            // 用户被禁止订阅
                            uni.showModal({
                                title: '无法订阅',
                                content: '您已被限制订阅该消息。\n\n可能原因：\n1. 多次拒绝订阅\n2. 在微信设置中关闭了权限\n\n请在微信"设置-通知-订阅消息"中重置权限后重试。',
                                showCancel: false,
                                confirmText: '我知道了'
                            });
                        }
                    } catch (error) {
                        console.error('订阅失败:', error);
                        uni.showModal({
                            title: '订阅失败',
                            content: '订阅过程出现错误，请稍后重试。\n\n如果问题持续存在，请检查：\n1. 网络连接是否正常\n2. 小程序版本是否最新\n3. 微信版本是否支持订阅消息',
                            showCancel: false,
                            confirmText: '我知道了'
                        });
                    }
                }
            });
        },

        // 每日提醒开关
        onDailyReminderChange(e) {
            this.settings.daily_reminder = e.detail.value ? 1 : 0;
        },

        // 时间选择
        onTimeChange(e) {
            this.settings.reminder_time = e.detail.value;
        },

        // 连续打卡预警开关
        onStreakWarningChange(e) {
            this.settings.streak_warning = e.detail.value ? 1 : 0;
        },

        // 成就通知开关
        onAchievementNotifyChange(e) {
            this.settings.achievement_notify = e.detail.value ? 1 : 0;
        },

        // 保存设置
        async saveSettings() {
            try {
                uni.showLoading({ title: '保存中...' });

                const res = await updateReminderSettings({
                    ...this.settings,
                    reminder_time: this.settings.reminder_time + ':00'
                });

                uni.hideLoading();

                if (res.code === 200) {
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });

                    // 如果开启了每日提醒但未订阅，提示订阅
                    if (this.settings.daily_reminder && !this.hasSubscription) {
                        setTimeout(() => {
                            uni.showModal({
                                title: '提示',
                                content: '您已开启每日提醒，是否立即订阅消息？',
                                success: (res) => {
                                    if (res.confirm) {
                                        this.requestSubscribe();
                                    }
                                }
                            });
                        }, 1500);
                    }
                } else {
                    uni.showToast({
                        title: res.message || '保存失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.hideLoading();
                console.error('保存设置失败:', error);
                uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
            }
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20rpx;
}

.header {
    background: white;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    text-align: center;
}

.title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
}

.subtitle {
    font-size: 28rpx;
    color: #999;
    display: block;
}

.settings-list {
    background: white;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info {
    flex: 1;
}

.setting-label {
    font-size: 32rpx;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
}

.setting-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.time-picker {
    display: flex;
    align-items: center;
    color: #667eea;
    font-size: 32rpx;
}

.subscribe-btn {
    padding: 10rpx 30rpx;
    font-size: 28rpx;
    border-radius: 30rpx;
    background: #667eea;
    color: white;
    border: none;
    line-height: normal;
}

.subscribe-btn.subscribed {
    background: #e0e0e0;
    color: #999;
}

.tips {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.tips-title {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    display: block;
    margin-bottom: 20rpx;
}

.tips-text {
    font-size: 26rpx;
    color: #666;
    line-height: 40rpx;
    display: block;
    margin-bottom: 10rpx;
}

.save-btn-wrapper {
    padding: 20rpx 0 40rpx;
}

.save-btn {
    width: 100%;
    height: 90rpx;
    background: white;
    color: #667eea;
    border-radius: 45rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
}
</style>
