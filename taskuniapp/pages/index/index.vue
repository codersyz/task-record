<template>
	<view class="container">
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
				<view v-if="taskList.length === 0" class="empty">
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
			}
		};
	},
	onShow() {
		// 开发阶段：如果没有token，先不加载数据，但不强制跳转
		const token = uni.getStorageSync('token');
		const userId = uni.getStorageSync('userId');

		console.log('=== 首页加载 ===');
		console.log('Token:', token ? token.substring(0, 20) + '...' : '无');
		console.log('UserId:', userId);

		if (token) {
			this.loadTaskList();
		} else {
			// 提示用户需要登录
			uni.showModal({
				title: '提示',
				content: '请先登录',
				showCancel: false,
				success: () => {
					uni.reLaunch({
						url: '/pages/login/login'
					});
				}
			});
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
			uni.navigateTo({
				url: `/pages/task/detail?id=${id}`
			});
		},

		goToCreate() {
			uni.navigateTo({
				url: '/pages/task/create'
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
