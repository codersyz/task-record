<script>
export default {
	onLaunch: function () {
		console.log('App Launch')
		// 初始化游客模式标识
		const token = uni.getStorageSync('token');
		if (!token) {
			// 设置游客模式
			uni.setStorageSync('isGuestMode', true);
		}
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	}
}
</script>

<style>
/*每个页面公共css */
@import "@/static/iconfont.css";
</style>
