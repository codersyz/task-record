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

export default {
    data() {
        return {
            taskId: 0,
            note: '',
            loading: false,
            hasCheckedToday: false
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
                                    uni.navigateBack();
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
                                        uni.navigateBack();
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
                                    uni.navigateBack();
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
                        uni.navigateBack();
                    }
                }
            });
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
