<template>
    <view class="container">
        <view class="form">
            <view class="form-item">
                <text class="label">打卡备注</text>
                <textarea class="textarea" v-model="note" placeholder="记录今天的收获..." maxlength="200" />
            </view>

            <!-- 图片上传区域 -->
            <view class="form-item">
                <text class="label">打卡图片（可选）</text>
                <view class="image-upload">
                    <view class="image-list">
                        <view class="image-item" v-for="(img, index) in images" :key="index">
                            <image :src="img" mode="aspectFill" class="preview-image" />
                            <view class="delete-btn" @click="deleteImage(index)">
                                <text class="iconfont icon-close">×</text>
                            </view>
                        </view>
                        <view class="add-image" @click="chooseImage" v-if="images.length < 9">
                            <text class="add-icon">+</text>
                            <text class="add-text">添加图片</text>
                        </view>
                    </view>
                    <view class="image-tip">最多上传9张图片，支持拍照或从相册选择</view>
                </view>
            </view>
        </view>

        <view class="btn-group">
            <button class="submit-btn" type="primary" @click="handleCheckin" :loading="loading">
                确认打卡
            </button>
        </view>
    </view>
</template>

<script>
import { checkin } from '@/api/task';
import { recordSubscription, getSubscriptionStatus } from '@/api/subscription';
import { uploadCheckinImage } from '@/api/upload';

export default {
    data() {
        return {
            taskId: 0,
            note: '',
            images: [], // 已选择的图片列表（本地路径）
            uploadedImages: [], // 已上传到COS的图片URL列表
            loading: false,
            hasCheckedToday: false,
            // 模板ID - 需要在微信公众平台配置后替换
            templateId: 'ezyMyEq365A0q4W9oja0NWXIssOZxxUVkO38m_FyM_g'
        };
    },
    onLoad(options) {
        this.taskId = options.taskId;
        this.hasCheckedToday = options.hasChecked === 'true';

        // 如果已经打卡，直接提示并返回
        if (this.hasCheckedToday) {
            uni.showModal({
                title: '提示',
                content: '今天已经打卡过了',
                showCancel: false,
                success: () => {
                    uni.navigateBack();
                }
            });
        }
    },
    methods: {
        // 选择图片
        chooseImage() {
            uni.chooseImage({
                count: 9 - this.images.length, // 最多9张
                sizeType: ['compressed'], // 压缩图
                sourceType: ['camera', 'album'], // 可以拍照或从相册选择
                success: (res) => {
                    this.images = this.images.concat(res.tempFilePaths);
                },
                fail: (error) => {
                    console.error('选择图片失败:', error);
                    uni.showToast({
                        title: '选择图片失败',
                        icon: 'none'
                    });
                }
            });
        },

        // 删除图片
        deleteImage(index) {
            this.images.splice(index, 1);
        },

        // 上传所有图片到COS
        async uploadImages() {
            if (this.images.length === 0) {
                return [];
            }

            uni.showLoading({
                title: '上传图片中...',
                mask: true
            });

            const uploadPromises = this.images.map(async (imagePath) => {
                try {
                    const result = await uploadCheckinImage(imagePath);
                    return result.data.url;
                } catch (error) {
                    console.error('上传图片失败:', error);
                    throw error;
                }
            });

            try {
                const urls = await Promise.all(uploadPromises);
                uni.hideLoading();
                return urls;
            } catch (error) {
                uni.hideLoading();
                throw error;
            }
        },

        async handleCheckin() {
            this.loading = true;

            try {
                // 如果有图片，先上传到COS
                let imageUrls = [];
                if (this.images.length > 0) {
                    try {
                        imageUrls = await this.uploadImages();
                    } catch (error) {
                        uni.showToast({
                            title: '图片上传失败',
                            icon: 'none'
                        });
                        this.loading = false;
                        return;
                    }
                }

                const res = await checkin({
                    taskId: this.taskId,
                    note: this.note,
                    images: imageUrls
                });

                if (res.code === 200) {
                    // 构建成功消息
                    let successMsg = `打卡成功！连续${res.data.currentDays}天`;

                    // 检查积分奖励
                    if (res.data.points && res.data.points.total > 0) {
                        const points = res.data.points;
                        let pointsMsg = `\n\n💎 获得 ${points.total} 积分`;

                        if (points.daily > 0) {
                            pointsMsg += `\n✨ 每日首次打卡 +${points.daily}`;
                        }
                        if (points.streak7 > 0) {
                            pointsMsg += `\n🔥 连续${points.consecutiveDays}天奖励 +${points.streak7}`;
                        }
                        if (points.streak30 > 0) {
                            pointsMsg += `\n⭐ 连续${points.consecutiveDays}天奖励 +${points.streak30}`;
                        }

                        successMsg += pointsMsg;
                    }

                    // 检查是否完成目标
                    if (res.data.isCompleted) {
                        uni.showModal({
                            title: '🎉 恭喜',
                            content: '打卡成功！你已完成目标任务！' + (res.data.points && res.data.points.total > 0 ? `\n\n💎 获得 ${res.data.points.total} 积分` : ''),
                            showCancel: false,
                            success: () => {
                                // 检查是否有新成就
                                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                                    this.showNewAchievements(res.data.newAchievements);
                                } else {
                                    // 打卡成功后提示订阅
                                    this.promptSubscribe();
                                }
                            }
                        });
                    } else {
                        // 显示积分奖励弹窗
                        if (res.data.points && res.data.points.total > 0) {
                            uni.showModal({
                                title: '✅ 打卡成功',
                                content: successMsg,
                                showCancel: false,
                                success: () => {
                                    // 检查是否有新成就
                                    if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                                        this.showNewAchievements(res.data.newAchievements);
                                    } else {
                                        // 打卡成功后提示订阅
                                        this.promptSubscribe();
                                    }
                                }
                            });
                        } else {
                            uni.showToast({
                                title: successMsg,
                                icon: 'success'
                            });

                            setTimeout(() => {
                                // 检查是否有新成就
                                if (res.data.newAchievements && res.data.newAchievements.length > 0) {
                                    this.showNewAchievements(res.data.newAchievements);
                                } else {
                                    // 打卡成功后提示订阅
                                    this.promptSubscribe();
                                }
                            }, 1500);
                        }
                    }
                } else if (res.code === 1001) {
                    // 今天已经打卡过了
                    uni.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel: false,
                        success: () => {
                            uni.navigateBack();
                        }
                    });
                } else {
                    uni.showToast({
                        title: res.message || '打卡失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('打卡失败:', error);
                uni.showToast({
                    title: '打卡失败，请重试',
                    icon: 'none'
                });
            } finally {
                this.loading = false;
            }
        },

        // 显示新解锁的成就
        showNewAchievements(achievements) {
            const achievementNames = achievements.map(a => `${a.icon} ${a.name}`).join('\n');
            uni.showModal({
                title: '🎉 解锁新成就',
                content: achievementNames,
                confirmText: '查看成就',
                cancelText: '稍后查看',
                success: (res) => {
                    if (res.confirm) {
                        uni.redirectTo({
                            url: '/pages/achievement/achievement'
                        });
                    } else {
                        // 查看成就后也提示订阅
                        this.promptSubscribe();
                    }
                }
            });
        },

        // 提示订阅消息
        async promptSubscribe() {
            // 先检查用户是否已有有效订阅
            try {
                const statusRes = await getSubscriptionStatus('daily_reminder');
                if (statusRes.code === 200 && statusRes.data.hasSubscription) {
                    // 已有有效订阅，不再提示
                    console.log('用户已订阅，跳过提示');
                    uni.navigateBack();
                    return;
                }
            } catch (error) {
                console.error('检查订阅状态失败:', error);
            }

            // 没有订阅或订阅已失效，提示用户订阅
            uni.showModal({
                title: '💡 温馨提示',
                content: '订阅消息提醒，每天准时打卡不遗漏',
                confirmText: '立即订阅',
                cancelText: '下次再说',
                success: async (res) => {
                    if (res.confirm) {
                        await this.requestSubscribe();
                    }
                    uni.navigateBack();
                }
            });
        },

        // 请求订阅
        async requestSubscribe() {
            try {
                const res = await uni.requestSubscribeMessage({
                    tmplIds: [this.templateId]
                });

                console.log('订阅结果:', res);

                if (res[this.templateId] === 'accept') {
                    // 记录订阅
                    await recordSubscription({
                        templateId: this.templateId,
                        templateType: 'daily_reminder'
                    });

                    uni.showToast({
                        title: '订阅成功',
                        icon: 'success'
                    });
                } else if (res[this.templateId] === 'reject') {
                    // 用户拒绝了订阅，给出详细说明
                    setTimeout(() => {
                        uni.showModal({
                            title: '订阅提示',
                            content: '您拒绝了订阅授权，将无法收到打卡提醒。\n\n如需开启提醒，请前往"我的-提醒设置"重新订阅。',
                            showCancel: false,
                            confirmText: '我知道了'
                        });
                    }, 500);
                } else if (res[this.templateId] === 'ban') {
                    setTimeout(() => {
                        uni.showModal({
                            title: '订阅受限',
                            content: '您已被限制订阅该消息。请在微信"设置-通知-订阅消息"中重置权限。',
                            showCancel: false,
                            confirmText: '我知道了'
                        });
                    }, 500);
                }
            } catch (error) {
                console.error('订阅失败:', error);
            }
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #F5F5F5;
    padding: 20rpx;
}

.form {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
}

.form-item {
    margin-bottom: 40rpx;
}

.label {
    display: block;
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 20rpx;
    font-weight: bold;
}

.textarea {
    width: 100%;
    min-height: 300rpx;
    background: #F5F5F5;
    border-radius: 8rpx;
    padding: 20rpx;
    font-size: 28rpx;
}

.btn-group {
    margin-top: 40rpx;
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
}

/* 图片上传样式 */
.image-upload {
    margin-top: 10rpx;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.image-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
}

.preview-image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
}

.delete-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-close {
    color: #FFFFFF;
    font-size: 32rpx;
    line-height: 1;
}

.add-image {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #CCCCCC;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #F9F9F9;
}

.add-icon {
    font-size: 60rpx;
    color: #999999;
    line-height: 1;
}

.add-text {
    font-size: 24rpx;
    color: #999999;
    margin-top: 10rpx;
}

.image-tip {
    font-size: 24rpx;
    color: #999999;
    margin-top: 20rpx;
}
</style>
