<template>
    <view class="container">
        <!-- 顶部积分显示 -->
        <view class="points-header">
            <view class="points-info">
                <text class="points-label">我的积分</text>
                <view class="points-value">
                    <text class="points-icon">💎</text>
                    <text class="points-num">{{ userPoints }}</text>
                </view>
            </view>
            <view class="header-tip">
                <text>每日打卡赚积分，兑换精美礼品</text>
            </view>
        </view>

        <!-- 商城分类（预留） -->
        <view class="category-tabs">
            <view class="tab-item active">
                <text class="tab-text">全部</text>
            </view>
            <view class="tab-item">
                <text class="tab-text">虚拟商品</text>
            </view>
            <view class="tab-item">
                <text class="tab-text">实物商品</text>
            </view>
            <view class="tab-item">
                <text class="tab-text">特权</text>
            </view>
        </view>

        <!-- 敬请期待 -->
        <view class="coming-soon">
            <view class="coming-icon">🎁</view>
            <text class="coming-title">积分商城即将上线</text>
            <text class="coming-desc">我们正在精心准备各种精美礼品</text>
            <text class="coming-desc">敬请期待...</text>
            
            <!-- 预告内容 -->
            <view class="preview-list">
                <view class="preview-item">
                    <text class="preview-icon">🎨</text>
                    <view class="preview-content">
                        <text class="preview-title">主题皮肤</text>
                        <text class="preview-desc">个性化界面主题</text>
                    </view>
                </view>
                <view class="preview-item">
                    <text class="preview-icon">🏆</text>
                    <view class="preview-content">
                        <text class="preview-title">专属徽章</text>
                        <text class="preview-desc">彰显你的成就</text>
                    </view>
                </view>
                <view class="preview-item">
                    <text class="preview-icon">⭐</text>
                    <view class="preview-content">
                        <text class="preview-title">会员特权</text>
                        <text class="preview-desc">解锁更多功能</text>
                    </view>
                </view>
                <view class="preview-item">
                    <text class="preview-icon">🎁</text>
                    <view class="preview-content">
                        <text class="preview-title">实物礼品</text>
                        <text class="preview-desc">精选好物等你兑换</text>
                    </view>
                </view>
            </view>

            <!-- 提示信息 -->
            <view class="tip-card">
                <text class="tip-icon">💡</text>
                <text class="tip-text">继续坚持打卡，积累更多积分，商城上线时可第一时间兑换心仪礼品！</text>
            </view>
        </view>
    </view>
</template>

<script>
import { getUserPoints } from '@/api/point';

export default {
    data() {
        return {
            userPoints: 0
        };
    },
    onLoad() {
        this.loadPoints();
    },
    onShow() {
        this.loadPoints();
    },
    methods: {
        async loadPoints() {
            try {
                const res = await getUserPoints();
                if (res.code === 200) {
                    this.userPoints = res.data.points || 0;
                }
            } catch (error) {
                console.error('加载积分失败:', error);
            }
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #F5F5F5;
    padding-bottom: 100rpx;
}

.points-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40rpx 30rpx;
    display: flex;
    flex-direction: column;
    gap: 15rpx;
}

.points-info {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
}

.points-label {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
}

.points-value {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.points-icon {
    font-size: 40rpx;
}

.points-num {
    font-size: 60rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.header-tip {
    padding: 10rpx 20rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    align-self: flex-start;
}

.header-tip text {
    font-size: 24rpx;
    color: #FFFFFF;
}

.category-tabs {
    background: #FFFFFF;
    padding: 20rpx 30rpx;
    display: flex;
    gap: 30rpx;
    overflow-x: auto;
    white-space: nowrap;
}

.tab-item {
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    transition: all 0.3s;
}

.tab-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tab-text {
    font-size: 26rpx;
    color: #666666;
}

.tab-item.active .tab-text {
    color: #FFFFFF;
    font-weight: bold;
}

.coming-soon {
    padding: 80rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.coming-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-20rpx);
    }
}

.coming-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 15rpx;
}

.coming-desc {
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 8rpx;
}

.preview-list {
    width: 100%;
    margin-top: 60rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.preview-item {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.preview-icon {
    font-size: 50rpx;
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.preview-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
}

.preview-desc {
    font-size: 24rpx;
    color: #999999;
}

.tip-card {
    width: 100%;
    margin-top: 40rpx;
    padding: 25rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 16rpx;
    border: 2rpx solid #667eea;
    display: flex;
    align-items: flex-start;
    gap: 15rpx;
}

.tip-icon {
    font-size: 32rpx;
    flex-shrink: 0;
}

.tip-text {
    flex: 1;
    font-size: 26rpx;
    color: #667eea;
    line-height: 1.6;
}
</style>
