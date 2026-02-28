<template>
    <view class="container">
        <!-- 用户信息 -->
        <view class="user-card">
            <image class="avatar" :src="getAvatarUrl(userInfo.avatar_url)" mode="aspectFill"></image>
            <text class="nickname" v-if="!isGuestMode">{{ userInfo.nickname || '未设置昵称' }}</text>
            <text class="nickname" v-else>游客模式</text>

            <!-- 积分信息 -->
            <view class="points-badge" v-if="!isGuestMode">
                <text class="points-icon">💎</text>
                <text class="points-text">{{ pointsInfo.points || 0 }} 积分</text>
            </view>
            <view class="streak-info" v-if="!isGuestMode">
                <text class="streak-text">🔥 连续打卡 {{ pointsInfo.consecutiveDays || 0 }} 天</text>
            </view>
            <button v-else class="guest-login-btn-card" @click="goToLogin">
                立即登录
            </button>
        </view>

        <!-- 统计信息 -->
        <view class="stats-card">
            <view class="stat-item">
                <text class="stat-num">{{ stats.totalTasks }}</text>
                <text class="stat-label">总任务数</text>
            </view>
            <view class="stat-item">
                <text class="stat-num">{{ stats.totalCheckins }}</text>
                <text class="stat-label">总打卡数</text>
            </view>
            <view class="stat-item">
                <text class="stat-num">{{ stats.maxStreak }}</text>
                <text class="stat-label">最长连续</text>
            </view>
        </view>

        <!-- 功能列表 -->
        <view class="menu-list">
            <view class="menu-item" @click="goToShop">
                <text class="menu-icon">🛒</text>
                <text class="menu-text">积分商城</text>
                <view class="menu-badge">即将上线</view>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="goToPointRecords">
                <text class="menu-icon">💎</text>
                <text class="menu-text">积分明细</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="goToRanking">
                <text class="menu-icon">📊</text>
                <text class="menu-text">积分排行榜</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="goToCalendar">
                <text class="menu-icon">📅</text>
                <text class="menu-text">打卡日历</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="goToAchievement">
                <text class="menu-icon">🏆</text>
                <text class="menu-text">我的成就</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="editProfile">
                <text class="menu-icon">✏️</text>
                <text class="menu-text">编辑资料</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="handleLogout">
                <text class="menu-icon" v-if="!isGuestMode">🚪</text>
                <text class="menu-icon" v-else>🔑</text>
                <text class="menu-text" v-if="!isGuestMode">退出登录</text>
                <text class="menu-text" v-else>立即登录</text>
                <text class="menu-arrow">›</text>
            </view>
        </view>

        <!-- 自定义 TabBar -->
        <custom-tabbar />
    </view>
</template>

<script>
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getUserInfo } from '@/api/auth';
import { getTaskList } from '@/api/task';
import { getUserPoints } from '@/api/point';
import { getAvatarUrl } from '@/utils/image';

export default {
    components: {
        customTabbar
    },
    data() {
        return {
            userInfo: {},
            pointsInfo: {
                points: 0,
                consecutiveDays: 0
            },
            stats: {
                totalTasks: 0,
                totalCheckins: 0,
                maxStreak: 0
            },
            isGuestMode: false
        };
    },
    onShow() {
        const token = uni.getStorageSync('token');
        this.isGuestMode = !token;

        if (token) {
            this.loadUserInfo();
            this.loadStats();
            this.loadPoints();
        }
    },
    methods: {
        // 获取完整的头像URL
        getAvatarUrl(avatarUrl) {
            return getAvatarUrl(avatarUrl);
        },

        async loadUserInfo() {
            try {
                const res = await getUserInfo();
                if (res.code === 200) {
                    this.userInfo = res.data;
                }
            } catch (error) {
                console.error('加载用户信息失败:', error);
            }
        },

        async loadStats() {
            try {
                const res = await getTaskList();
                if (res.code === 200) {
                    const tasks = res.data;
                    this.stats.totalTasks = tasks.length;
                    this.stats.totalCheckins = tasks.reduce((sum, t) => sum + t.total_days, 0);
                    this.stats.maxStreak = Math.max(...tasks.map(t => t.current_days), 0);
                }
            } catch (error) {
                console.error('加载统计信息失败:', error);
            }
        },

        async loadPoints() {
            try {
                const res = await getUserPoints();
                if (res.code === 200) {
                    this.pointsInfo = res.data;
                }
            } catch (error) {
                console.error('加载积分信息失败:', error);
            }
        },

        // 编辑个人信息
        editProfile() {
            if (this.checkGuestMode()) return;
            uni.navigateTo({
                url: '/pages/profile-edit'
            });
        },

        // 跳转到打卡日历
        goToCalendar() {
            if (this.checkGuestMode()) return;
            uni.navigateTo({
                url: '/pages/calendar/calendar'
            });
        },

        // 跳转到成就中心
        goToAchievement() {
            if (this.checkGuestMode()) return;
            uni.navigateTo({
                url: '/pages/achievement/achievement'
            });
        },

        // 跳转到积分商城
        goToShop() {
            if (this.checkGuestMode()) return;
            uni.navigateTo({
                url: '/pages/points/shop'
            });
        },

        // 跳转到积分明细
        goToPointRecords() {
            if (this.checkGuestMode()) return;
            uni.navigateTo({
                url: '/pages/points/records'
            });
        },

        // 跳转到积分排行榜
        goToRanking() {
            if (this.checkGuestMode()) return;
            uni.navigateTo({
                url: '/pages/points/ranking'
            });
        },

        // 检查游客模式
        checkGuestMode() {
            if (this.isGuestMode) {
                uni.showModal({
                    title: '提示',
                    content: '请先登录后使用此功能',
                    confirmText: '去登录',
                    cancelText: '继续浏览',
                    success: (res) => {
                        if (res.confirm) {
                            uni.navigateTo({
                                url: '/pages/login/login'
                            });
                        }
                    }
                });
                return true;
            }
            return false;
        },

        // 跳转到登录页
        goToLogin() {
            uni.navigateTo({
                url: '/pages/login/login'
            });
        },

        handleLogout() {
            // 如果是游客模式，直接跳转登录
            if (this.isGuestMode) {
                this.goToLogin();
                return;
            }

            uni.showModal({
                title: '提示',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        uni.removeStorageSync('token');
                        uni.removeStorageSync('userId');
                        uni.setStorageSync('isGuestMode', true);
                        uni.reLaunch({
                            url: '/pages/index/index'
                        });
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
    padding-bottom: 160rpx;
}

.user-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    border: 4rpx solid #FFFFFF;
    margin-bottom: 20rpx;
}

.nickname {
    font-size: 32rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.points-badge {
    margin-top: 20rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 10rpx 30rpx;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.points-icon {
    font-size: 28rpx;
}

.points-text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: bold;
}

.streak-info {
    margin-top: 15rpx;
}

.streak-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

.guest-login-btn-card {
    margin-top: 20rpx;
    width: 300rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: rgba(255, 255, 255, 0.3);
    color: #FFFFFF;
    border-radius: 35rpx;
    font-size: 28rpx;
    border: 2rpx solid #FFFFFF;
}

.stats-card {
    background: #FFFFFF;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 40rpx;
    display: flex;
    justify-content: space-around;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-num {
    font-size: 40rpx;
    font-weight: bold;
    color: #333333;
}

.stat-label {
    font-size: 24rpx;
    color: #999999;
    margin-top: 10rpx;
}

.menu-list {
    margin: 20rpx;
}

.menu-item {
    background: #FFFFFF;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 15rpx;
    display: flex;
    align-items: center;
    position: relative;
}

.menu-icon {
    font-size: 36rpx;
    margin-right: 20rpx;
}

.menu-text {
    font-size: 28rpx;
    color: #333333;
    flex: 1;
}

.menu-badge {
    padding: 4rpx 12rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #FFFFFF;
    font-size: 20rpx;
    border-radius: 10rpx;
    margin-right: 10rpx;
}

.menu-arrow {
    font-size: 40rpx;
    color: #CCCCCC;
    font-weight: bold;
}
</style>
