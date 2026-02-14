<template>
    <view class="container">
        <!-- 月份选择器 -->
        <view class="month-selector">
            <view class="month-btn" @click="prevMonth">
                <text class="arrow">‹</text>
            </view>
            <view class="month-text">
                <text>{{ currentYear }}年{{ currentMonth }}月</text>
            </view>
            <view class="month-btn" @click="nextMonth">
                <text class="arrow">›</text>
            </view>
        </view>

        <!-- 统计卡片 -->
        <view class="stats-card">
            <view class="stat-item">
                <text class="stat-num">{{ monthStats.totalDays }}</text>
                <text class="stat-label">本月打卡</text>
            </view>
            <view class="stat-item">
                <text class="stat-num">{{ monthStats.continuousDays }}</text>
                <text class="stat-label">连续天数</text>
            </view>
            <view class="stat-item">
                <text class="stat-num">{{ monthStats.completionRate }}%</text>
                <text class="stat-label">完成率</text>
            </view>
        </view>

        <!-- 日历 -->
        <view class="calendar-card">
            <!-- 星期标题 -->
            <view class="weekdays">
                <text v-for="day in weekdays" :key="day" class="weekday">{{ day }}</text>
            </view>

            <!-- 日期网格 -->
            <view class="days-grid">
                <view v-for="(day, index) in calendarDays" :key="index" class="day-cell" :class="{
                    'other-month': !day.isCurrentMonth,
                    'today': day.isToday,
                    'has-checkin': day.hasCheckin
                }" @click="selectDate(day)">
                    <text class="day-num">{{ day.day }}</text>
                    <view v-if="day.hasCheckin" class="checkin-dot">
                        <text class="dot-icon">●</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 当日打卡详情 -->
        <view v-if="selectedDate && selectedDateCheckins.length > 0" class="detail-card">
            <view class="detail-header">
                <text class="detail-title">{{ selectedDate }}的打卡</text>
            </view>
            <view v-for="(item, index) in selectedDateCheckins" :key="index" class="checkin-item">
                <view class="checkin-header">
                    <view class="category-tag" :class="'category-' + item.category">
                        <text>{{ getCategoryName(item.category) }}</text>
                    </view>
                    <text class="task-title">{{ item.taskTitle }}</text>
                </view>
                <text v-if="item.note" class="checkin-note">{{ item.note }}</text>
            </view>
        </view>

        <view v-else-if="selectedDate" class="empty-detail">
            <text class="empty-text">{{ selectedDate }}没有打卡记录</text>
        </view>
    </view>
</template>

<script>
import { getMonthlyCalendar } from '@/api/task';

export default {
    data() {
        return {
            currentYear: new Date().getFullYear(),
            currentMonth: new Date().getMonth() + 1,
            weekdays: ['日', '一', '二', '三', '四', '五', '六'],
            calendarDays: [],
            checkinData: {},
            selectedDate: null,
            selectedDateCheckins: [],
            monthStats: {
                totalDays: 0,
                continuousDays: 0,
                completionRate: 0
            }
        };
    },
    onLoad() {
        this.loadCalendarData();
    },
    methods: {
        async loadCalendarData() {
            try {
                uni.showLoading({ title: '加载中...' });

                const res = await getMonthlyCalendar(this.currentYear, this.currentMonth);

                if (res.code === 200) {
                    this.checkinData = res.data.checkins;
                    this.generateCalendar();
                    this.calculateMonthStats();
                }

                uni.hideLoading();
            } catch (error) {
                uni.hideLoading();
                console.error('加载日历数据失败:', error);
            }
        },

        generateCalendar() {
            const year = this.currentYear;
            const month = this.currentMonth;

            // 当月第一天
            const firstDay = new Date(year, month - 1, 1);
            // 当月最后一天
            const lastDay = new Date(year, month, 0);
            // 当月天数
            const daysInMonth = lastDay.getDate();
            // 第一天是星期几
            const firstDayWeek = firstDay.getDay();

            const days = [];

            // 填充上月日期
            const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
            for (let i = firstDayWeek - 1; i >= 0; i--) {
                days.push({
                    day: prevMonthLastDay - i,
                    isCurrentMonth: false,
                    hasCheckin: false
                });
            }

            // 填充当月日期
            const today = new Date();
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const isToday = year === today.getFullYear() &&
                    month === today.getMonth() + 1 &&
                    i === today.getDate();

                days.push({
                    day: i,
                    date: dateStr,
                    isCurrentMonth: true,
                    isToday,
                    hasCheckin: !!this.checkinData[dateStr]
                });
            }

            // 填充下月日期
            const remainingDays = 42 - days.length; // 6行7列
            for (let i = 1; i <= remainingDays; i++) {
                days.push({
                    day: i,
                    isCurrentMonth: false,
                    hasCheckin: false
                });
            }

            this.calendarDays = days;
        },

        calculateMonthStats() {
            const checkinDates = Object.keys(this.checkinData);
            this.monthStats.totalDays = checkinDates.length;

            // 计算完成率（本月已过天数中的打卡率）
            const today = new Date();
            const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
            let passedDays = daysInMonth;

            if (this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth() + 1) {
                passedDays = today.getDate();
            }

            this.monthStats.completionRate = passedDays > 0
                ? Math.round((checkinDates.length / passedDays) * 100)
                : 0;

            // 计算连续天数（从今天往前推）
            this.monthStats.continuousDays = this.calculateContinuousDays(checkinDates);
        },

        calculateContinuousDays(checkinDates) {
            if (checkinDates.length === 0) return 0;

            // 获取今天的日期字符串（本地时区）
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            let continuous = 0;
            let checkDate = new Date(today);
            checkDate.setHours(0, 0, 0, 0);

            // 从今天开始往前检查连续打卡
            while (true) {
                const year = checkDate.getFullYear();
                const month = String(checkDate.getMonth() + 1).padStart(2, '0');
                const day = String(checkDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                if (checkinDates.includes(dateStr)) {
                    continuous++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            return continuous;
        },

        selectDate(day) {
            if (!day.isCurrentMonth || !day.hasCheckin) {
                this.selectedDate = null;
                this.selectedDateCheckins = [];
                return;
            }

            this.selectedDate = `${this.currentMonth}月${day.day}日`;
            this.selectedDateCheckins = this.checkinData[day.date] || [];
        },

        prevMonth() {
            if (this.currentMonth === 1) {
                this.currentYear--;
                this.currentMonth = 12;
            } else {
                this.currentMonth--;
            }
            this.selectedDate = null;
            this.selectedDateCheckins = [];
            this.loadCalendarData();
        },

        nextMonth() {
            if (this.currentMonth === 12) {
                this.currentYear++;
                this.currentMonth = 1;
            } else {
                this.currentMonth++;
            }
            this.selectedDate = null;
            this.selectedDateCheckins = [];
            this.loadCalendarData();
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

.month-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 40rpx;
    background: #FFFFFF;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
}

.month-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5F5F5;
    border-radius: 30rpx;
}

.arrow {
    font-size: 40rpx;
    color: #667eea;
    font-weight: bold;
}

.month-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    justify-content: space-around;
    margin-bottom: 20rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-num {
    font-size: 40rpx;
    font-weight: bold;
    color: #FFFFFF;
}

.stat-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 8rpx;
}

.calendar-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.weekdays {
    display: flex;
    margin-bottom: 20rpx;
}

.weekday {
    flex: 1;
    text-align: center;
    font-size: 24rpx;
    color: #999999;
    font-weight: bold;
}

.days-grid {
    display: flex;
    flex-wrap: wrap;
}

.day-cell {
    width: 14.28%;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 10rpx;
}

.day-num {
    font-size: 28rpx;
    color: #333333;
}

.day-cell.other-month .day-num {
    color: #CCCCCC;
}

.day-cell.today {
    background: #E8F5E9;
    border-radius: 50%;
}

.day-cell.today .day-num {
    color: #4CAF50;
    font-weight: bold;
}

.day-cell.has-checkin {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
}

.day-cell.has-checkin .day-num {
    color: #FFFFFF;
    font-weight: bold;
}

.checkin-dot {
    position: absolute;
    bottom: 5rpx;
}

.dot-icon {
    font-size: 12rpx;
    color: #FF9800;
}

.detail-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
}

.detail-header {
    margin-bottom: 20rpx;
}

.detail-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333333;
}

.checkin-item {
    padding: 20rpx;
    background: #F5F5F5;
    border-radius: 12rpx;
    margin-bottom: 15rpx;
}

.checkin-item:last-child {
    margin-bottom: 0;
}

.checkin-header {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
}

.category-tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
    margin-right: 10rpx;
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
    color: #333333;
    flex: 1;
}

.checkin-note {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.6;
}

.empty-detail {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 60rpx;
    text-align: center;
}

.empty-text {
    font-size: 26rpx;
    color: #999999;
}
</style>
