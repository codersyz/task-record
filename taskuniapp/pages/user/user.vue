<template>
    <view class="container">
        <!-- 用户信息 -->
        <view class="user-card">
            <image class="avatar" :src="userInfo.avatar_url || '/static/logo.webp'" mode="aspectFill"></image>
            <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
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
                <text class="menu-icon">🚪</text>
                <text class="menu-text">退出登录</text>
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

export default {
    components: {
        customTabbar
    },
    data() {
        return {
            userInfo: {},
            stats: {
                totalTasks: 0,
                totalCheckins: 0,
                maxStreak: 0
            }
        };
    },
    onShow() {
        this.loadUserInfo();
        this.loadStats();
    },
    methods: {
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

        // 编辑个人信息
        editProfile() {
            uni.navigateTo({
                url: '/pages/profile-edit'
            });
        },

        // 跳转到打卡日历
        goToCalendar() {
            uni.navigateTo({
                url: '/pages/calendar/calendar'
            });
        },

        // 跳转到成就中心
        goToAchievement() {
            uni.navigateTo({
                url: '/pages/achievement/achievement'
            });
        },

        handleLogout() {
            uni.showModal({
                title: '提示',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        uni.removeStorageSync('token');
                        uni.removeStorageSync('userId');
                        uni.reLaunch({
                            url: '/pages/login/login'
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
    padding-bottom: 120rpx;
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

.menu-arrow {
    font-size: 40rpx;
    color: #CCCCCC;
    font-weight: bold;
}
</style>
