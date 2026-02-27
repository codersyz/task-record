// 认证相关工具函数

/**
 * 检查是否为游客模式
 * @returns {boolean} 是否为游客模式
 */
export function isGuestMode() {
    const token = uni.getStorageSync('token');
    return !token;
}

/**
 * 检查游客模式并提示登录
 * @param {string} message 提示消息
 * @returns {boolean} 是否为游客模式
 */
export function checkGuestMode(message = '请先登录后使用此功能') {
    if (isGuestMode()) {
        uni.showModal({
            title: '提示',
            content: message,
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
}

/**
 * 设置游客模式
 */
export function setGuestMode() {
    uni.setStorageSync('isGuestMode', true);
}

/**
 * 清除游客模式
 */
export function clearGuestMode() {
    uni.removeStorageSync('isGuestMode');
}

/**
 * 退出登录
 */
export function logout() {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userId');
    setGuestMode();
}
