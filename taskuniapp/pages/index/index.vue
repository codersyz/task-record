<template>
	<view class="container">
		<!-- 订阅状态提示 -->
		<view v-if="!isGuestMode && !hasSubscription" class="subscription-tip" @click="goToReminderSettings">
			<text class="tip-icon">🔔</text>
			<view class="tip-content">
				<text class="tip-title">开启打卡提醒</text>
				<text class="tip-desc">订阅消息，每天准时提醒</text>
			</view>
			<text class="tip-arrow">›</text>
		</view>

		<!-- 顶部统计 - 固定 -->
		<view class="stats-card">
			<view class="stat-item">
				<text class="stat-num">{{ taskStats.total }}</text>
				<text class="stat-label">总任务</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ taskStats.active }}</text>
				<text class="stat-label">进行中</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ taskStats.totalCheckins }}</text>
				<text class="stat-label">累计打卡</text>
			</view>
		</view>

		<!-- 任务列表 - 可滚动 -->
		<scroll-view class="task-scroll" scroll-y>
			<view class="task-list">
				<!-- 游客模式提示 -->
				<view v-if="isGuestMode" class="guest-banner">
					<text class="banner-icon">👋</text>
					<view class="banner-content">
						<text class="banner-title">欢迎体验任务打卡</text>
						<text class="banner-desc">以下是示例任务，登录后可创建自己的任务</text>
					</view>
					<button class="banner-btn" @click="goToLogin">登录</button>
				</view>

				<view v-if="taskList.length === 0 && !isGuestMode" class="empty">
					<text class="empty-text">暂无任务，点击下方按钮创建</text>
				</view>

				<view v-for="task in taskList" :key="task.id" class="task-item" @click="goToDetail(task.id)">
					<view class="task-header">
						<view class="title-row">
							<view class="category-tag" :class="'category-' + task.category">
								<text>{{ getCategoryName(task.category) }}</text>
							</view>
							<text class="task-title">{{ task.title }}</text>
						</view>
						<text class="task-status" :class="task.status === 1 ? 'active' : 'completed'">
							{{ task.status === 1 ? '进行中' : '已完成' }}
						</text>
					</view>

					<view class="task-progress">
						<text class="progress-text">连续 {{ task.current_days }} 天</text>
						<text class="progress-text">累计 {{ task.total_days }} 天</text>
					</view>

					<view v-if="task.target_days > 0" class="task-target">
						<text class="target-text">目标: {{ task.target_days }} 天</text>
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: getProgress(task) + '%' }"></view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 创建按钮 -->
		<view class="create-btn" @click="goToCreate">
			<text class="iconfont icon-jia"></text>
		</view>

		<!-- 自定义 TabBar -->
		<custom-tabbar />
	</view>
</template>

<script>
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getTaskList } from '@/api/task';
import { getSubscriptionStatus } from '@/api/subscription';

export default {
	components: {
		customTabbar
	},
	data() {
		return {
			taskList: [],
			taskStats: {
				total: 0,
				active: 0,
				totalCheckins: 0
			},
			isGuestMode: false,
			hasSubscription: false,
			// 示例任务数据（游客模式展示）
			demoTasks: [
				{
					id: 'demo1',
					title: '每天阅读30分钟',
					category: 'read',
					status: 1,
					current_days: 7,
					total_days: 15,
					target_days: 30
				},
				{
					id: 'demo2',
					title: '坚持晨跑',
					category: 'sport',
					status: 1,
					current_days: 3,
					total_days: 10,
					target_days: 21
				},
				{
					id: 'demo3',
					title: '学习英语单词',
					category: 'study',
					status: 1,
					current_days: 12,
					total_days: 25,
					target_days: 100
				}
			]
		};
	},
	onLoad() {
		// 检查是否为游客模式
		const token = uni.getStorageSync('token');
		this.isGuestMode = !token;
	},
	onShow() {
		const token = uni.getStorageSync('token');
		const isGuestMode = uni.getStorageSync('isGuestMode');

		// 更新游客模式状态
		this.isGuestMode = !token;

		console.log('=== 首页加载 ===');
		console.log('Token:', token ? token.substring(0, 20) + '...' : '无');
		console.log('游客模式:', this.isGuestMode);

		if (token) {
			// 已登录，加载任务列表和订阅状态
			this.loadTaskList();
			this.checkSubscriptionStatus();
		} else {
			// 游客模式，显示示例任务
			this.taskList = this.demoTasks;
			this.calculateStats();
		}
	},
	methods: {
		async loadTaskList() {
			try {
				console.log('开始加载任务列表...');
				const res = await getTaskList();
				console.log('任务列表响应:', res);

				if (res.code === 200) {
					this.taskList = res.data;
					console.log('任务列表数据:', this.taskList);
					this.calculateStats();
				} else {
					console.error('获取任务列表失败:', res);
					uni.showToast({
						title: res.message || '获取任务失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加载任务列表错误:', error);
			}
		},

		// 检查订阅状态
		async checkSubscriptionStatus() {
			try {
				const res = await getSubscriptionStatus('daily_reminder');
				if (res.code === 200) {
					this.hasSubscription = res.data.hasSubscription;
				}
			} catch (error) {
				console.error('检查订阅状态失败:', error);
			}
		},

		calculateStats() {
			this.taskStats.total = this.taskList.length;
			this.taskStats.active = this.taskList.filter(t => t.status === 1).length;
			this.taskStats.totalCheckins = this.taskList.reduce((sum, t) => sum + t.total_days, 0);
		},

		getProgress(task) {
			if (task.target_days === 0) return 0;
			return Math.min((task.total_days / task.target_days) * 100, 100);
		},

		goToDetail(id) {
			// 游客模式下点击示例任务，提示登录
			if (this.isGuestMode) {
				uni.showModal({
					title: '体验示例',
					content: '这是示例任务，登录后可以创建自己的任务并开始打卡',
					confirmText: '立即登录',
					cancelText: '继续浏览',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/login/login'
							});
						}
					}
				});
				return;
			}

			uni.navigateTo({
				url: `/pages/task/detail?id=${id}`
			});
		},

		goToCreate() {
			// 游客模式下提示登录
			if (this.isGuestMode) {
				uni.showModal({
					title: '需要登录',
					content: '登录后即可创建任务并开始打卡',
					confirmText: '立即登录',
					cancelText: '继续浏览',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/login/login'
							});
						}
					}
				});
				return;
			}

			uni.navigateTo({
				url: '/pages/task/create'
			});
		},

		// 跳转到登录页
		goToLogin() {
			uni.navigateTo({
				url: '/pages/login/login'
			});
		},

		// 跳转到提醒设置
		goToReminderSettings() {
			uni.navigateTo({
				url: '/pages/reminder-settings/reminder-settings'
			});
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
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #F5F5F5;
}

.subscription-tip {
	background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%);
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.tip-icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.tip-content {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.tip-title {
	font-size: 28rpx;
	color: #FFFFFF;
	font-weight: bold;
	margin-bottom: 5rpx;
}

.tip-desc {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.9);
}

.tip-arrow {
	font-size: 40rpx;
	color: #FFFFFF;
	font-weight: bold;
}

.stats-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx;
	display: flex;
	justify-content: space-around;
	flex-shrink: 0;
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

.task-scroll {
	flex: 1;
	height: 0;
}

.task-list {
	padding: 20rpx;
	padding-bottom: 180rpx;
}

.empty {
	text-align: center;
	padding: 100rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.guest-banner {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.banner-icon {
	font-size: 48rpx;
}

.banner-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.banner-title {
	font-size: 30rpx;
	color: #FFFFFF;
	font-weight: bold;
}

.banner-desc {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
}

.banner-btn {
	width: 120rpx;
	height: 60rpx;
	line-height: 60rpx;
	background: #FFFFFF;
	color: #667eea;
	border-radius: 30rpx;
	font-size: 26rpx;
	padding: 0;
	border: none;
}

.guest-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.guest-text {
	font-size: 32rpx;
	color: #333333;
	font-weight: bold;
}

.guest-desc {
	font-size: 26rpx;
	color: #666666;
}

.guest-login-btn {
	margin-top: 20rpx;
	width: 300rpx;
	height: 70rpx;
	line-height: 70rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #FFFFFF;
	border-radius: 35rpx;
	font-size: 28rpx;
	border: none;
}

.task-item {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.task-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.title-row {
	display: flex;
	align-items: center;
	flex: 1;
	flex-wrap: wrap;
}

.category-tag {
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-size: 20rpx;
	margin-right: 10rpx;
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
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	flex: 1;
}

.task-status {
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.task-status.active {
	background: #E8F5E9;
	color: #4CAF50;
}

.task-status.completed {
	background: #E3F2FD;
	color: #2196F3;
}

.task-progress {
	display: flex;
	gap: 30rpx;
	margin-bottom: 20rpx;
}

.progress-text {
	font-size: 28rpx;
	color: #666666;
}

.task-target {
	margin-top: 20rpx;
}

.target-text {
	font-size: 24rpx;
	color: #999999;
}

.progress-bar {
	height: 8rpx;
	background: #E0E0E0;
	border-radius: 4rpx;
	margin-top: 10rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	transition: width 0.3s;
}

.create-btn {
	position: fixed;
	right: 40rpx;
	bottom: 180rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
	z-index: 100;
}

.create-btn .iconfont {
	font-size: 36rpx;
	color: #FFFFFF;
	line-height: 1;
}
</style>
