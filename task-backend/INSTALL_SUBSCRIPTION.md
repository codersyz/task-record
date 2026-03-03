# 订阅消息功能快速安装

## 一、数据库更新

```bash
cd task-backend
mysql -u root -p task_checkin < config/add-subscription-system.sql
```

## 二、安装依赖

```bash
npm install
```

## 三、配置模板ID

### 1. 获取模板ID

1. 登录微信公众平台 https://mp.weixin.qq.com/
2. 进入"功能" -> "订阅消息"
3. 选择"待办事项提醒"或类似模板
4. 复制模板ID（格式：xxxxxxxxxxxxxxxxxxxxxxxxxxx）

### 2. 修改前端代码

**文件1：** `taskuniapp/pages/reminder-settings/reminder-settings.vue`

找到第 18 行：

```javascript
templateId: "YOUR_TEMPLATE_ID_HERE";
```

替换为：

```javascript
templateId: "xxxxxxxxxxxxxxxxxxxxxxxxxxx"; // 你的模板ID
```

**文件2：** `taskuniapp/pages/checkin/checkin.vue`

找到第 10 行：

```javascript
templateId: "YOUR_TEMPLATE_ID_HERE";
```

替换为：

```javascript
templateId: "xxxxxxxxxxxxxxxxxxxxxxxxxxx"; // 你的模板ID
```

## 四、重启服务

```bash
# 开发环境
npm run dev

# 生产环境
pm2 restart task-backend
```

## 五、测试

```bash
# 运行测试脚本
node test-subscription.js
```

## 六、使用

1. 在小程序中进入"我的" -> "提醒设置"
2. 开启"每日打卡提醒"
3. 设置提醒时间
4. 点击"立即订阅"
5. 在弹出的授权框中点击"允许"

## 完成！

现在用户会在设定的时间收到打卡提醒了。

详细文档请查看：[SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md)
