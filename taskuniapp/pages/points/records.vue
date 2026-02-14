<template>
    <view class="container">
        <!-- 积分总览 -->
        <view class="points-header">
            <view class="points-total">
                <text class="points-icon">💎</text>
                <text class="points-num">{{ totalPoints }}</text>
            </view>
            <text class="points-label">我的积分</text>
        </view>

        <!-- 积分规则说明 -->
        <view class="rules-card">
            <view class="rule-title">积分规则</view>
            <view class="rule-item">
                <text class="rule-icon">✨</text>
                <text class="rule-text">每日首次打卡：+1 积分</text>
            </view>
            <view class="rule-item">
                <text class="rule-icon">🔥</text>
                <text class="rule-text">连续打卡每 7 天：+5 积分</text>
            </view>
            <view class="rule-item">
                <text class="rule-icon">⭐</text>
                <text class="rule-text">连续打卡每 30 天：+20 积分</text>
            </view>
            <view class="rule-tip">
                <text>💡 每天只有第一次打卡获得积分，多个任务只计第一个</text>
            </view>
        </view>

        <!-- 积分记录 -->
        <view class="records-section">
            <view class="section-title">积分明细</view>

            <view v-if="records.length === 0" class="empty">
                <text class="empty-text">暂无积分记录</text>
            </view>

            <view v-else class="record-list">
                <view v-for="record in records" :key="record.id" class="record-item">
                    <view class="record-main">
                        <view class="record-header">
                            <view class="record-type">
                                <text class="type-icon">{{ getTypeIcon(record.type) }}</text>
                                <text class="type-text">{{ getTypeName(record.type) }}</text>
                            </view>
                            <text class="record-points" :class="record.points > 0 ? 'positive' : 'negative'">
                                {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                            </text>
                        </view>

                        <!-- 任务信息 -->
                        <view v-if="record.task_title" class="task-info">
                            <view class="task-tag" :class="'category-' + record.task_category">
                                <text>{{ getCategoryName(record.task_category) }}</text>
                            </view>
                            <text class="task-title">{{ record.task_title }}</text>
                        </view>

                        <!-- 打卡信息 -->
                        <view v-if="record.checkin_date" class="checkin-info">
                            <text class="checkin-date">📅 {{ formatDate(record.checkin_date) }}</text>
                            <text v-if="record.checkin_note" class="checkin-note">{{ record.checkin_note }}</text>
                        </view>

                        <!-- 时间 -->
                        <text class="record-time">{{ formatTime(record.created_at) }}</text>
                    </view>
                </view>
            </view>

            <!-- 加载更多 -->
            <view v-if="hasMore" class="load-more" @click="loadMore">
                <text class="load-more-text">加载更多</text>
            </view>
            <view v-else-if="records.length > 0" class="no-more">
                <text class="no-more-text">没有更多了</text>
            </view>
        </view>
    </view>
</template>

<script>
import { getUserPoints, getPointRecords } from '@/api/point';

export default {
    data() {
        return {
            totalPoints: 0,
            records: [],
            page: 1,
            pageSize: 20,
            hasMore: true
        };
    },
    onLoad() {
        this.loadPointsInfo();
        this.loadRecords();
    },
    methods: {
        async loadPointsInfo() {
            try {
                const res = await getUserPoints();
                if (res.code === 200) {
                    this.totalPoints = res.data.points || 0;
                }
            } catch (error) {
                console.error('加载积分信息失败:', error);
            }
        },

        async loadRecords() {
            try {
                uni.showLoading({ title: '加载中...' });

                const res = await getPointRecords({
                    page: this.page,
                    pageSize: this.pageSize
                });

                if (res.code === 200) {
                    if (this.page === 1) {
                        this.records = res.data.records;
                    } else {
                        this.records = [...this.records, ...res.data.records];
                    }

                    this.hasMore = res.data.records.length >= this.pageSize;
                }

                uni.hideLoading();
            } catch (error) {
                uni.hideLoading();
                console.error('加载积分记录失败:', error);
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            }
        },

        loadMore() {
            if (!this.hasMore) return;
            this.page++;
            this.loadRecords();
        },

        formatTime(timeStr) {
            const date = new Date(timeStr);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days === 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                if (hours === 0) {
                    const minutes = Math.floor(diff / (1000 * 60));
                    return minutes === 0 ? '刚刚' : `${minutes}分钟前`;
                }
                return `${hours}小时前`;
            } else if (days === 1) {
                return '昨天';
            } else if (days < 7) {
                return `${days}天前`;
            } else {
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${month}月${day}日`;
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const weekday = weekdays[date.getDay()];
            return `${year}年${month}月${day}日 ${weekday}`;
        },

        getTypeIcon(type) {
            const icons = {
                daily_first: '✨',
                streak_7: '🔥',
                streak_30: '⭐'
            };
            return icons[type] || '💎';
        },

        getTypeName(type) {
            const names = {
                daily_first: '每日首次打卡',
                streak_7: '连续打卡奖励',
                streak_30: '连续打卡奖励'
            };
            return names[type] || '积分奖励';
        },

        getCategoryName(category) {
            const names = {
                study: '学习',
                sport: '运动',
                read: '阅读',
                health: '健康',
                work: '工作',
                other: '其他'
            };
            return names[category] || '其他';
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #F5F5F5;
    padding: 20rpx;
    padding-bottom: 100rpx;
}

.points-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 50rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
}

.points-total {
    display: flex;
    align-items: center;
    gap: 15rpx;
    margin-bottom: 10rpx;
}

.points-icon {
    font-size: 50rpx;
}

.points-num {
    font-size: 80rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.points-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
}

.rules-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.rule-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 20rpx;
}

.rule-item {
    display: flex;
    align-items: center;
    padding: 15rpx 0;
}

.rule-icon {
    font-size: 28rpx;
    margin-right: 15rpx;
}

.rule-text {
    font-size: 26rpx;
    color: #666666;
}

.rule-tip {
    margin-top: 20rpx;
    padding: 15rpx;
    background: #FFF3E0;
    border-radius: 8rpx;
}

.rule-tip text {
    font-size: 24rpx;
    color: #FF9800;
    line-height: 1.6;
}

.records-section {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 20rpx;
}

.empty {
    text-align: center;
    padding: 80rpx 0;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

.record-list {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
}

.record-item {
    background: #FAFAFA;
    border-radius: 12rpx;
    padding: 25rpx;
    border-left: 4rpx solid #667eea;
}

.record-main {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.record-type {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.type-icon {
    font-size: 28rpx;
}

.type-text {
    font-size: 28rpx;
    font-weight: bold;
    color: #333333;
}

.record-points {
    font-size: 36rpx;
    font-weight: bold;
}

.record-points.positive {
    color: #4CAF50;
}

.record-points.negative {
    color: #F44336;
}

.task-info {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 10rpx 0;
    border-top: 1rpx solid #E0E0E0;
}

.task-tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
    flex-shrink: 0;
}

.category-study {
    background: #E3F2FD;
    color: #2196F3;
}

.category-sport {
    background: #FFF3E0;
    color: #FF9800;
}

.category-read {
    background: #F3E5F5;
    color: #9C27B0;
}

.category-health {
    background: #E8F5E9;
    color: #4CAF50;
}

.category-work {
    background: #FBE9E7;
    color: #FF5722;
}

.category-other {
    background: #F5F5F5;
    color: #757575;
}

.task-title {
    font-size: 26rpx;
    color: #666666;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.checkin-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 10rpx 15rpx;
    background: #FFFFFF;
    border-radius: 8rpx;
}

.checkin-date {
    font-size: 24rpx;
    color: #999999;
}

.checkin-note {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.record-time {
    font-size: 22rpx;
    color: #AAAAAA;
}

.load-more {
    text-align: center;
    padding: 30rpx 0;
}

.load-more-text {
    font-size: 26rpx;
    color: #667eea;
}

.no-more {
    text-align: center;
    padding: 30rpx 0;
}

.no-more-text {
    font-size: 24rpx;
    color: #CCCCCC;
}
</style>
