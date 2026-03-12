<template>
    <view class="container">
        <!-- 任务信息 -->
        <view class="task-card">
            <view class="task-header">
                <text class="task-title">{{ task.title }}</text>
                <view class="task-actions" @click="showActionSheet">
                    <text class="action-icon">⋯</text>
                </view>
            </view>
            <text v-if="task.description" class="task-desc">{{ task.description }}</text>

            <view class="stats">
                <view class="stat-item">
                    <text class="stat-num">{{ task.current_days }}</text>
                    <text class="stat-label">连续天数</text>
                </view>
                <view class="stat-item">
                    <text class="stat-num">{{ task.total_days }}</text>
                    <text class="stat-label">累计天数</text>
                </view>
                <view class="stat-item" v-if="task.target_days > 0">
                    <text class="stat-num">{{ task.target_days }}</text>
                    <text class="stat-label">目标天数</text>
                </view>
            </view>
        </view>

        <!-- 打卡按钮 -->
        <view class="checkin-section">
            <!-- 任务已完成 -->
            <button v-if="task.status === 0" class="checkin-btn completed" disabled>
                <text>🎉 任务已完成</text>
            </button>
            <!-- 今日已打卡 -->
            <button v-else-if="hasCheckedToday" class="checkin-btn checked" disabled>
                <text>✓ 已打卡</text>
            </button>
            <!-- 可以打卡 -->
            <button v-else class="checkin-btn" @click="goToCheckin">
                <text>立即打卡</text>
            </button>

            <text v-if="task.status === 0" class="checkin-tip">
                已完成目标 {{ task.target_days }} 天打卡
            </text>
            <text v-else-if="hasCheckedToday" class="checkin-tip">
                明天再来打卡吧~
            </text>
        </view>

        <!-- 打卡记录 -->
        <view class="records">
            <text class="section-title">打卡记录</text>

            <view v-if="checkinList.length === 0" class="empty">
                <text class="empty-text">暂无打卡记录</text>
            </view>

            <view v-for="item in checkinList" :key="item.id" class="record-item">
                <view class="record-date">{{ formatDate(item.checkin_date) }}</view>
                <view v-if="item.note" class="record-note">{{ item.note }}</view>
                <!-- 打卡图片 -->
                <view v-if="item.images && item.images.length > 0" class="record-images">
                    <image v-for="(img, index) in item.images" :key="index" :src="img" mode="aspectFill"
                        class="record-image" @click="previewImage(item.images, index)" />
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getTaskDetail, checkTodayCheckin, getCheckinList, deleteTask } from '@/api/task';

export default {
    data() {
        return {
            taskId: 0,
            task: {},
            checkinList: [],
            hasCheckedToday: false
        };
    },
    onLoad(options) {
        this.taskId = options.id;
        this.loadData();
    },
    onShow() {
        // 从打卡页返回时，重新加载所有数据
        if (this.taskId) {
            this.loadData();
        }
    },
    methods: {
        async loadData() {
            await this.loadTaskDetail();
            await this.checkTodayStatus();
            await this.loadCheckinList();
        },

        async loadTaskDetail() {
            try {
                const res = await getTaskDetail(this.taskId);
                if (res.code === 200) {
                    this.task = res.data;
                }
            } catch (error) {
                console.error('加载任务详情失败:', error);
            }
        },

        // 调用接口检查今天是否已打卡
        async checkTodayStatus() {
            try {
                console.log('检查今日打卡状态 - taskId:', this.taskId);

                const res = await checkTodayCheckin(this.taskId);
                console.log('打卡状态响应:', res);

                if (res.code === 200) {
                    this.hasCheckedToday = res.data.hasChecked;
                    console.log('今日是否已打卡:', this.hasCheckedToday);
                }
            } catch (error) {
                console.error('检查打卡状态失败:', error);
            }
        },

        async loadCheckinList() {
            try {
                const res = await getCheckinList(this.taskId, 1, 20);
                if (res.code === 200) {
                    this.checkinList = res.data;
                }
            } catch (error) {
                console.error('加载打卡记录错误:', error);
            }
        },

        goToCheckin() {
            if (this.hasCheckedToday) {
                uni.showToast({
                    title: '今天已经打卡过了',
                    icon: 'none'
                });
                return;
            }

            uni.navigateTo({
                url: `/pages/checkin/checkin?taskId=${this.taskId}`
            });
        },

        // 显示操作菜单
        showActionSheet() {
            uni.showActionSheet({
                itemList: ['编辑任务', '删除任务'],
                success: (res) => {
                    if (res.tapIndex === 0) {
                        // 编辑任务
                        this.editTask();
                    } else if (res.tapIndex === 1) {
                        // 删除任务
                        this.confirmDelete();
                    }
                }
            });
        },

        // 编辑任务（暂未实现）
        editTask() {
            uni.showToast({
                title: '编辑功能开发中',
                icon: 'none'
            });
        },

        // 确认删除
        confirmDelete() {
            uni.showModal({
                title: '确认删除',
                content: '删除后将无法恢复，确定要删除这个任务吗？',
                confirmText: '删除',
                confirmColor: '#FF3B30',
                success: async (res) => {
                    if (res.confirm) {
                        await this.handleDelete();
                    }
                }
            });
        },

        // 执行删除
        async handleDelete() {
            try {
                uni.showLoading({
                    title: '删除中...'
                });

                const res = await deleteTask(this.taskId);

                uni.hideLoading();

                if (res.code === 200) {
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1000);
                } else {
                    uni.showToast({
                        title: res.message || '删除失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.hideLoading();
                console.error('删除任务失败:', error);
                uni.showToast({
                    title: '删除失败，请重试',
                    icon: 'none'
                });
            }
        },

        formatDate(dateStr) {
            const date = new Date(dateStr);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            const weekday = weekdays[date.getDay()];
            return `${month}月${day}日 星期${weekday}`;
        },

        // 预览图片
        previewImage(images, current) {
            uni.previewImage({
                urls: images,
                current: current
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

.task-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
}

.task-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #FFFFFF;
    flex: 1;
}

.task-actions {
    padding: 0 10rpx;
    margin-left: 20rpx;
}

.action-icon {
    font-size: 40rpx;
    color: #FFFFFF;
    font-weight: bold;
    line-height: 1;
}

.task-desc {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-bottom: 30rpx;
}

.stats {
    display: flex;
    justify-content: space-around;
    margin-top: 30rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-num {
    font-size: 48rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.stat-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 10rpx;
}

.checkin-section {
    margin-bottom: 20rpx;
}

.checkin-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    transition: all 0.3s;
}

.checkin-btn.checked {
    background: #E8F5E9;
    color: #4CAF50;
}

.checkin-btn.completed {
    background: #FFF3E0;
    color: #FF9800;
}

.checkin-btn[disabled] {
    opacity: 1;
}

.checkin-tip {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: #999999;
    margin-top: 15rpx;
}

.records {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 20rpx;
}

.empty {
    text-align: center;
    padding: 60rpx 0;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

.record-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid #F0F0F0;
}

.record-item:last-child {
    border-bottom: none;
}

.record-date {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 10rpx;
}

.record-note {
    font-size: 26rpx;
    color: #666666;
}

.record-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 15rpx;
}

.record-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
}
</style>
