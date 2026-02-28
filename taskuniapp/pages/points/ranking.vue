<template>
    <view class="container">
        <!-- 我的排名 -->
        <view class="my-rank-card">
            <view class="rank-badge">
                <text class="rank-num">{{ myRank }}</text>
            </view>
            <view class="rank-info">
                <text class="rank-label">我的排名</text>
                <text class="rank-points">{{ myPoints }} 积分</text>
            </view>
        </view>

        <!-- 排行榜 -->
        <view class="ranking-list">
            <view class="list-header">
                <text class="header-title">积分排行榜</text>
                <text class="header-subtitle">TOP 100</text>
            </view>

            <view v-if="ranking.length === 0" class="empty">
                <text class="empty-text">暂无排行数据</text>
            </view>

            <view v-else class="rank-items">
                <view v-for="(item, index) in ranking" :key="item.id" class="rank-item"
                    :class="{ 'is-me': item.id === userId }">
                    <!-- 排名 -->
                    <view class="rank-number" :class="getRankClass(index + 1)">
                        <text v-if="index < 3" class="rank-medal">{{ getMedal(index + 1) }}</text>
                        <text v-else class="rank-text">{{ index + 1 }}</text>
                    </view>

                    <!-- 用户信息 -->
                    <image class="user-avatar" :src="getAvatarUrl(item.avatar_url)" mode="aspectFill"></image>

                    <view class="user-info">
                        <text class="user-name">{{ item.nickname || '未设置昵称' }}</text>
                        <text class="user-streak">🔥 连续 {{ item.consecutive_days }} 天</text>
                    </view>

                    <!-- 积分 -->
                    <view class="user-points">
                        <text class="points-num">{{ item.points }}</text>
                        <text class="points-label">积分</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getPointsRanking, getUserPoints } from '@/api/point';
import { getAvatarUrl } from '@/utils/image';

export default {
    data() {
        return {
            ranking: [],
            myRank: '-',
            myPoints: 0,
            userId: 0
        };
    },
    onLoad() {
        this.userId = uni.getStorageSync('userId');
        this.loadRanking();
        this.loadMyPoints();
    },
    methods: {
        // 获取完整的头像URL
        getAvatarUrl(avatarUrl) {
            return getAvatarUrl(avatarUrl);
        },

        async loadRanking() {
            try {
                uni.showLoading({ title: '加载中...' });

                const res = await getPointsRanking({ limit: 100 });

                if (res.code === 200) {
                    this.ranking = res.data.ranking;
                    this.myRank = res.data.myRank;
                }

                uni.hideLoading();
            } catch (error) {
                uni.hideLoading();
                console.error('加载排行榜失败:', error);
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            }
        },

        async loadMyPoints() {
            try {
                const res = await getUserPoints();
                if (res.code === 200) {
                    this.myPoints = res.data.points || 0;
                }
            } catch (error) {
                console.error('加载积分信息失败:', error);
            }
        },

        getMedal(rank) {
            const medals = {
                1: '🥇',
                2: '🥈',
                3: '🥉'
            };
            return medals[rank] || '';
        },

        getRankClass(rank) {
            if (rank === 1) return 'rank-first';
            if (rank === 2) return 'rank-second';
            if (rank === 3) return 'rank-third';
            return '';
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

.my-rank-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 40rpx;
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.rank-badge {
    width: 100rpx;
    height: 100rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
}

.rank-num {
    font-size: 40rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.rank-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.rank-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
}

.rank-points {
    font-size: 36rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.ranking-list {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #F0F0F0;
}

.header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.header-subtitle {
    font-size: 24rpx;
    color: #999999;
}

.empty {
    text-align: center;
    padding: 80rpx 0;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

.rank-items {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
}

.rank-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    border-radius: 12rpx;
    background: #FAFAFA;
    transition: all 0.3s;
}

.rank-item.is-me {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border: 2rpx solid #667eea;
}

.rank-number {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.rank-medal {
    font-size: 40rpx;
}

.rank-text {
    font-size: 28rpx;
    font-weight: bold;
    color: #999999;
}

.rank-first .rank-text {
    color: #FFD700;
}

.rank-second .rank-text {
    color: #C0C0C0;
}

.rank-third .rank-text {
    color: #CD7F32;
}

.user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.user-name {
    font-size: 28rpx;
    color: #333333;
    font-weight: bold;
}

.user-streak {
    font-size: 24rpx;
    color: #999999;
}

.user-points {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: 20rpx;
}

.points-num {
    font-size: 32rpx;
    font-weight: bold;
    color: #667eea;
}

.points-label {
    font-size: 22rpx;
    color: #999999;
}
</style>
