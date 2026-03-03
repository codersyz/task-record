<script>
export default {
	onLaunch: function () {
		console.log('App Launch')
		// 不再自动设置游客模式，让用户自然进入首页体验
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
