<template>
    <view class="container">
        <view class="form">
            <view class="form-item">
                <text class="label">打卡备注</text>
                <textarea class="textarea" v-model="note" placeholder="记录今天的收获..." maxlength="200" />
            </view>
        </view>

        <view class="btn-group">
            <button class="submit-btn" type="primary" @click="handleCheckin" :loading="loading">
                确认打卡
            </button>
        </view>
    </view>
</template>

<script>
import { checkin } from '@/api/task';
import { recordSubscription, getSubscriptionStatus } from '@/api/subscription';

export default {
    data() {
        return {
            taskId: 0,
            note: '',
            loading: false,
            hasCheckedToday: false,
            // 模板ID - 需要在微信公众平台配置后替换
            templateId: 'ezyMyEq365A0q4W9oja0NWXIssOZxxUVkO38m_FyM_g'
        };
    },
    onLoad(options) {
        this.taskId = options.taskId;
        this.hasCheckedToday = options.hasChecked === 'true';

        // 如果已经打卡，直接提示并返回
        if (this.hasCheckedToday) {
            uni.showModal({
                title: '提示',
                content: '今天已经打卡过了',
                showCancel: false,
                success: () => {
                    uni.navigateBack();
                }
            });
        }
    },
    methods: {
        async handleCheckin() {
            this.loading = true;

            try {
                const res = await checkin({
                    taskId: this.taskId,
                    note: this.note
                });

                if (res.code === 200) {
                    // 构建成功消息
                    let successMsg = `打卡成功！连续${res.data.currentDays}天`;

                    // 检查积分奖励
                    if (res.data.points && res.data.points.total > 0) {
                        const points = res.data.points;
                        let pointsMsg = `\n\n💎 获得 ${points.total} 积分`;

                        if (points.daily > 0) {
                            pointsMsg += `\n✨ 每日首次打卡 +${points.daily}`;
                        }
                        if (points.streak7 > 0) {
                            pointsMsg += `\n🔥 连续${points.consecutiveDays}天奖励 +${points.streak7}`;
                        }
                        if (points.streak30 > 0) {
                            pointsMsg += `\n⭐ 连续${points.consecutiveDays}天奖励 +${points.streak30}`;
                        }

                        successMsg += pointsMsg;
                    }

                    // 检查是否完成目标
                    if (res.data.isCompleted) {
                        uni.showModal({
                            title: '🎉 恭喜',
                            content: '打卡成功！你已完成目标任务！' + (res.data.points && res.data.points.total > 0 ? `\n\n💎 获得 ${res.data.points.total} 积分` : ''),
                            showCancel: false,
                            success: () => {
                                // 检查是否有新成就
                                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                                    this.showNewAchievements(res.data.newAchievements);
                                } else {
                                    // 打卡成功后提示订阅
                                    this.promptSubscribe();
                                }
                            }
                        });
                    } else {
                        // 显示积分奖励弹窗
                        if (res.data.points && res.data.points.total > 0) {
                            uni.showModal({
                                title: '✅ 打卡成功',
                                content: successMsg,
                                showCancel: false,
                                success: () => {
                                    // 检查是否有新成就
                                    if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                                        this.showNewAchievements(res.data.newAchievements);
                                    } else {
                                        // 打卡成功后提示订阅
                                        this.promptSubscribe();
                                    }
                                }
                            });
                        } else {
                            uni.showToast({
                                title: successMsg,
                                icon: 'success'
                            });

                            setTimeout(() => {
                                // 检查是否有新成就
                                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                                    this.showNewAchievements(res.data.newAchievements);
                                } else {
                                    // 打卡成功后提示订阅
                                    this.promptSubscribe();
                                }
                            }, 1500);
                        }
                    }
                } else if (res.code === 1001) {
                    // 今天已经打卡过了
                    uni.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel: false,
                        success: () => {
                            uni.navigateBack();
                        }
                    });
                } else {
                    uni.showToast({
                        title: res.message || '打卡失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('打卡失败:', error);
                uni.showToast({
                    title: '打卡失败，请重试',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },

        // 显示新解锁的成就
        showNewAchievements(achievements) {
            const achievementNames = achievements.map(a => `${a.icon} ${a.name}`).join('\n');
            uni.showModal({
                title: '🎉 解锁新成就',
                content: achievementNames,
                confirmText: '查看成就',
                cancelText: '稍后查看',
                success: (res) => {
                    if (res.confirm) {
                        uni.redirectTo({
                            url: '/pages/achievement/achievement'
                        });
                    } else {
                        // 查看成就后也提示订阅
                        this.promptSubscribe();
                    }
                }
            });
        },

        // 提示订阅消息
        async promptSubscribe() {
            // 先检查用户是否已有有效订阅
            try {
                const statusRes = await getSubscriptionStatus('daily_reminder');
                if (statusRes.code === 200 && statusRes.data.hasSubscription) {
                    // 已有有效订阅，不再提示
                    console.log('用户已订阅，跳过提示');
                    uni.navigateBack();
                    return;
                }
            } catch (error) {
                console.error('检查订阅状态失败:', error);
            }

            // 没有订阅或订阅已失效，提示用户订阅
            uni.showModal({
                title: '💡 温馨提示',
                content: '订阅消息提醒，每天准时打卡不遗漏',
                confirmText: '立即订阅',
                cancelText: '下次再说',
                success: async (res) => {
                    if (res.confirm) {
                        await this.requestSubscribe();
                    }
                    uni.navigateBack();
                }
            });
        },

        // 请求订阅
        async requestSubscribe() {
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

                    uni.showToast({
                        title: '订阅成功',
                        icon: 'success'
                    });
                } else if (res[this.templateId] === 'reject') {
                    uni.showToast({
                        title: '您拒绝了订阅',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('订阅失败:', error);
            }
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #F5F5F5;
    padding: 20rpx;
}

.form {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
}

.form-item {
    margin-bottom: 40rpx;
}

.label {
    display: block;
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 20rpx;
    font-weight: bold;
}

.textarea {
    width: 100%;
    min-height: 300rpx;
    background: #F5F5F5;
    border-radius: 8rpx;
    padding: 20rpx;
    font-size: 28rpx;
}

.btn-group {
    margin-top: 40rpx;
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
}
</style>
