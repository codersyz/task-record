<template>
    <view class="custom-tabbar">
        <view v-for="(item, index) in tabList" :key="index" class="tab-item" @click="switchTab(index)">
            <text class="iconfont" :class="item.icon"
                :style="{ color: currentIndex === index ? selectedColor : color }"></text>
            <text class="tab-text" :style="{ color: currentIndex === index ? selectedColor : color }">{{ item.text
            }}</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            currentIndex: 0,
            color: '#999999',
            selectedColor: '#667eea',
            tabList: [
                {
                    pagePath: '/pages/index/index',
                    text: '任务',
                    icon: 'icon-H5-renwuTAB'
                },
                {
                    pagePath: '/pages/user/user',
                    text: '我的',
                    icon: 'icon-wodeTAB'
                }
            ]
        };
    },
    mounted() {
        this.updateCurrentIndex();
    },
    methods: {
        updateCurrentIndex() {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const route = '/' + currentPage.route;

            this.currentIndex = this.tabList.findIndex(item => item.pagePath === route);
        },
        switchTab(index) {
            if (this.currentIndex === index) return;

            const path = this.tabList[index].pagePath;
            uni.switchTab({
                url: path
            });
        }
    }
};
</script>

<style scoped>
@import '@/static/iconfont.css';

.custom-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background: #FFFFFF;
    border-top: 1rpx solid #E5E5E5;
    display: flex;
    z-index: 9999;
    padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 10rpx;
}

.iconfont {
    font-size: 44rpx;
    margin-bottom: 4rpx;
}

.tab-text {
    font-size: 20rpx;
}
</style>
