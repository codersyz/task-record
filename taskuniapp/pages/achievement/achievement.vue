<template>
    <view class="container">
        <!-- 头部统计 -->
        <view class="header-card">
            <view class="achievement-count">
                <text class="count-num">{{ unlockedCount }}</text>
                <text class="count-total">/{{ totalCount }}</text>
            </view>
            <text class="header-title">已解锁成就</text>
            <view class="progress-ring">
                <view class="progress-text">{{ completionRate }}%</view>
            </view>
        </view>

        <!-- 成就列表 -->
        <view class="achievement-list">
            <view 
                v-for="(item, index) in achievements" 
                :key="index"
                class="achievement-item"
                :class="{ unlocked: item.unlocked }"
            >
                <view class="achievement-icon">
                    <text class="icon-emoji">{{ item.icon }}</text>
                    <view v-if="item.unlocked" class="unlock-badge">
                        <text class="badge-text">✓</text>
                    </view>
                </view>
                
                <view class="achievement-content">
                    <view class="achievement-header">
                        <text class="achievement-name">{{ item.name }}</text>
                        <text v-if="item.unlocked" class="unlock-time">
                            {{ formatDate(item.unlockedAt) }}
                        </text>
                    </view>
                    
                    <text class="achievement-desc">{{ item.desc }}</text>
                    
                    <!-- 进度条 -->
                    <view v-if="!item.unlocked" class="progress-bar">
                        <view class="progress-fill" :style="{ width: item.progress.percentage + '%' }"></view>
                    </view>
                    <text v-if="!item.unlocked" class="progress-text">
                        {{ item.progress.current }}/{{ item.progress.target }}
                    </text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getAchievements } from '@/api/achievement';

export default {
    data() {
        return {
            achievements: [],
            unlockedCount: 0,
            totalCount: 0,
            completionRate: 0
        };
    },
    onLoad() {
        this.loadAchievements();
    },
    onShow() {
        // 从其他页面返回时刷新
        this.loadAchievements();
    },
    methods: {
        async loadAchievements() {
            try {
                uni.showLoading({ title: '加载中...' });

                const res = await getAchievements();

                if (res.code === 200) {
                    // 按解锁状态排序：已解锁的在前
                    this.achievements = res.data.achievements.sort((a, b) => {
                        if (a.unlocked && !b.unlocked) return -1;
                        if (!a.unlocked && b.unlocked) return 1;
                        return 0;
                    });
                    
                    this.unlockedCount = res.data.unlockedCount;
                    this.totalCount = res.data.totalCount;
                    this.completionRate = Math.round((this.unlockedCount / this.totalCount) * 100);
                }

                uni.hideLoading();
            } catch (error) {
                uni.hideLoading();
                console.error('加载成就失败:', error);
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日解锁`;
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #F5F5F5;
    padding: 20rpx;
    padding-bottom: 40rpx;
}

.header-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 50rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
    position: relative;
}

.achievement-count {
    display: flex;
    align-items: baseline;
    margin-bottom: 10rpx;
}

.count-num {
    font-size: 80rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.count-total {
    font-size: 40rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-left: 10rpx;
}

.header-title {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 20rpx;
}

.progress-ring {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 40rpx;
    top: 50%;
    transform: translateY(-50%);
}

.progress-text {
    font-size: 24rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.achievement-list {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
}

.achievement-item {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    align-items: flex-start;
    opacity: 0.6;
    transition: all 0.3s;
}

.achievement-item.unlocked {
    opacity: 1;
    box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.15);
}

.achievement-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    position: relative;
    flex-shrink: 0;
}

.achievement-item:not(.unlocked) .achievement-icon {
    background: #E0E0E0;
}

.icon-emoji {
    font-size: 50rpx;
}

.achievement-item:not(.unlocked) .icon-emoji {
    filter: grayscale(100%);
    opacity: 0.5;
}

.unlock-badge {
    position: absolute;
    right: -5rpx;
    top: -5rpx;
    width: 35rpx;
    height: 35rpx;
    background: #4CAF50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid #FFFFFF;
}

.badge-text {
    font-size: 20rpx;
    color: #FFFFFF;
    font-weight: bold;
}

.achievement-content {
    flex: 1;
}

.achievement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
}

.achievement-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
}

.unlock-time {
    font-size: 22rpx;
    color: #999999;
}

.achievement-desc {
    font-size: 26rpx;
    color: #666666;
    display: block;
    margin-bottom: 15rpx;
}

.progress-bar {
    height: 8rpx;
    background: #E0E0E0;
    border-radius: 4rpx;
    overflow: hidden;
    margin-bottom: 8rpx;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s;
}

.achievement-content .progress-text {
    font-size: 22rpx;
    color: #999999;
}
</style>
