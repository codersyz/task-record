<template>
    <view class="container">
        <view class="form">
            <view class="form-item">
                <text class="label">任务名称</text>
                <input class="input" v-model="form.title" placeholder="请输入任务名称" maxlength="50" />
            </view>

            <view class="form-item">
                <text class="label">任务分类</text>
                <view class="category-grid">
                    <view v-for="cat in categories" :key="cat.value" class="category-item"
                        :class="{ active: form.category === cat.value }" @click="selectCategory(cat.value)">
                        <text class="category-icon">{{ cat.icon }}</text>
                        <text class="category-name">{{ cat.label }}</text>
                    </view>
                </view>
            </view>

            <view class="form-item">
                <text class="label">任务描述</text>
                <textarea class="textarea" v-model="form.description" placeholder="请输入任务描述（可选）" maxlength="100" />
            </view>

            <view class="form-item">
                <text class="label">目标天数</text>
                <input class="input" v-model.number="form.targetDays" type="number" placeholder="请输入目标天数（可选）" />
            </view>
        </view>

        <view class="btn-group">
            <button class="submit-btn" type="primary" @click="handleSubmit">创建任务</button>
        </view>
    </view>
</template>

<script>
import { createTask } from '@/api/task';

export default {
    data() {
        return {
            form: {
                title: '',
                description: '',
                targetDays: '',
                category: 'other'
            },
            categories: [
                { value: 'study', label: '学习', icon: '📚' },
                { value: 'sport', label: '运动', icon: '🏃' },
                { value: 'read', label: '阅读', icon: '📖' },
                { value: 'health', label: '健康', icon: '💪' },
                { value: 'work', label: '工作', icon: '💼' },
                { value: 'other', label: '其他', icon: '📝' }
            ]
        };
    },
    methods: {
        selectCategory(value) {
            this.form.category = value;
        },

        async handleSubmit() {
            if (!this.form.title.trim()) {
                uni.showToast({
                    title: '请输入任务名称',
                    icon: 'none'
                });
                return;
            }

            try {
                const res = await createTask({
                    title: this.form.title,
                    description: this.form.description,
                    targetDays: this.form.targetDays || 0,
                    category: this.form.category
                });

                if (res.code === 200) {
                    uni.showToast({
                        title: '创建成功',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1000);
                }
            } catch (error) {
                console.error('创建任务失败:', error);
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

.category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
}

.category-item {
    background: #F5F5F5;
    border-radius: 12rpx;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s;
    border: 2rpx solid transparent;
}

.category-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
}

.category-icon {
    font-size: 40rpx;
    margin-bottom: 8rpx;
}

.category-name {
    font-size: 24rpx;
    color: #666666;
}

.category-item.active .category-name {
    color: #FFFFFF;
    font-weight: bold;
}

.input {
    width: 100%;
    height: 80rpx;
    background: #F5F5F5;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
}

.textarea {
    width: 100%;
    min-height: 100rpx;
    max-height: 150rpx;
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
</style>
