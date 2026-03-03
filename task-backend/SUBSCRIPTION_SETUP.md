# 订阅消息配置指南

## 功能说明

本系统实现了微信小程序订阅消息功能，可以在每天指定时间向用户发送打卡提醒。

## 配置步骤

### 1. 微信公众平台配置

#### 1.1 登录微信公众平台

访问 https://mp.weixin.qq.com/ 并登录你的小程序账号

#### 1.2 选择订阅消息模板

1. 进入"功能" -> "订阅消息"
2. 点击"选用"按钮
3. 搜索适合的模板，推荐以下类型：
   - 待办事项提醒
   - 任务提醒
   - 打卡提醒
   - 日程提醒

#### 1.3 添加模板

选择一个合适的模板，例如：

**模板示例：**

```
模板标题：待办事项提醒
模板内容：
{{thing1.DATA}}
时间：{{time2.DATA}}
备注：{{thing3.DATA}}
```

添加后会获得一个模板ID，格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. 修改前端代码

#### 2.1 修改提醒设置页面

打开 `taskuniapp/pages/reminder-settings/reminder-settings.vue`

找到第 18 行左右：

```javascript
// 模板ID - 需要在微信公众平台配置后替换
templateId: "YOUR_TEMPLATE_ID_HERE";
```

替换为你的模板ID：

```javascript
templateId: "xxxxxxxxxxxxxxxxxxxxxxxxxxx"; // 替换为你的实际模板ID
```

#### 2.2 修改打卡页面

打开 `taskuniapp/pages/checkin/checkin.vue`

找到第 10 行左右：

```javascript
// 模板ID - 需要在微信公众平台配置后替换
templateId: "YOUR_TEMPLATE_ID_HERE";
```

替换为你的模板ID：

```javascript
templateId: "xxxxxxxxxxxxxxxxxxxxxxxxxxx"; // 替换为你的实际模板ID
```

### 3. 数据库配置

执行数据库更新脚本：

```bash
cd task-backend
mysql -u root -p task_checkin < config/add-subscription-system.sql
```

这会创建以下表：

- `user_subscriptions` - 用户订阅记录表
- `reminder_settings` - 提醒设置表
- `message_logs` - 消息发送日志表

### 4. 安装后端依赖

```bash
cd task-backend
npm install
```

这会安装 `node-cron` 依赖，用于定时任务。

### 5. 重启后端服务

```bash
# 开发环境
npm run dev

# 生产环境（使用 PM2）
pm2 restart task-backend
```

## 使用说明

### 用户端操作流程

1. **设置提醒时间**
   - 进入"我的" -> "提醒设置"
   - 开启"每日打卡提醒"
   - 选择提醒时间（如 09:00）
   - 点击"立即订阅"按钮
   - 在弹出的授权框中点击"允许"

2. **打卡后自动提示订阅**
   - 用户完成打卡后
   - 系统会自动弹出订阅提示
   - 用户可以选择"立即订阅"或"下次再说"

3. **接收提醒**
   - 在设定的时间，用户会收到微信服务通知
   - 点击通知可以直接进入小程序

### 订阅消息规则

1. **一次性订阅**
   - 用户每次授权只能发送一次消息
   - 发送后订阅状态自动失效
   - 需要用户重新订阅

2. **订阅时机**
   - 建议在打卡成功后提示订阅
   - 在提醒设置页面可以主动订阅
   - 不要频繁弹出订阅请求

3. **发送条件**
   - 用户已订阅且订阅状态有效
   - 到达设定的提醒时间
   - 当天还未打卡

## 定时任务说明

### 任务执行频率

- 每分钟检查一次（`* * * * *`）
- 只在整点分钟发送（如 09:00、10:00）

### 任务逻辑

1. 查询当前时间需要发送提醒的用户
2. 检查用户今天是否已打卡
3. 如果未打卡，发送订阅消息
4. 标记订阅状态为已使用
5. 记录发送日志

### 查看日志

```bash
# 查看后端日志
pm2 logs task-backend

# 或者直接运行查看
npm run dev
```

日志示例：

```
⏰ 启动定时任务：每日打卡提醒
开始发送每日打卡提醒...
找到 5 个用户需要发送提醒
成功发送提醒给用户: 张三
成功发送提醒给用户: 李四
每日提醒发送完成: 成功 5, 失败 0
```

## 数据库查询

### 查看订阅记录

```sql
SELECT u.nickname, s.template_type, s.status, s.subscribed_at
FROM user_subscriptions s
JOIN users u ON s.user_id = u.id
ORDER BY s.subscribed_at DESC
LIMIT 10;
```

### 查看提醒设置

```sql
SELECT u.nickname, r.daily_reminder, r.reminder_time, r.streak_warning
FROM reminder_settings r
JOIN users u ON r.user_id = u.id;
```

### 查看发送日志

```sql
SELECT u.nickname, m.template_type, m.status, m.sent_at, m.error_msg
FROM message_logs m
JOIN users u ON m.user_id = u.id
ORDER BY m.sent_at DESC
LIMIT 20;
```

## 常见问题

### 1. 用户收不到提醒

**可能原因：**

- 用户未订阅或订阅已失效
- 提醒时间设置不正确
- 后端定时任务未启动
- 微信 access_token 获取失败

**解决方法：**

```sql
-- 检查用户订阅状态
SELECT * FROM user_subscriptions WHERE user_id = ? AND status = 1;

-- 检查提醒设置
SELECT * FROM reminder_settings WHERE user_id = ?;

-- 检查发送日志
SELECT * FROM message_logs WHERE user_id = ? ORDER BY sent_at DESC LIMIT 5;
```

### 2. 订阅失败

**可能原因：**

- 模板ID配置错误
- 用户拒绝授权
- 小程序未发布或未配置服务器域名

**解决方法：**

- 检查前端代码中的模板ID是否正确
- 在微信开发者工具中勾选"不校验合法域名"
- 确保小程序已发布到线上

### 3. 定时任务不执行

**可能原因：**

- 后端服务未启动
- node-cron 依赖未安装
- 代码错误导致任务中断

**解决方法：**

```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs task-backend

# 重启服务
pm2 restart task-backend
```

### 4. access_token 获取失败

**可能原因：**

- AppID 或 Secret 配置错误
- 网络问题

**解决方法：**

- 检查 `.env` 文件中的配置
- 确保服务器可以访问微信API

## 测试方法

### 1. 测试订阅功能

1. 在小程序中进入"提醒设置"
2. 点击"立即订阅"
3. 检查数据库中是否有订阅记录

### 2. 测试定时发送

```javascript
// 在后端控制台手动触发
const subscriptionController = require("./controllers/subscriptionController");
subscriptionController.sendDailyReminders();
```

### 3. 测试消息发送

- 将提醒时间设置为当前时间后1分钟
- 等待定时任务执行
- 检查是否收到微信通知

## 优化建议

### 1. 长期订阅

如果你的小程序类目支持长期订阅，可以申请长期订阅权限，这样用户一次授权可以多次发送。

### 2. 智能提醒

- 根据用户历史打卡时间，智能推荐提醒时间
- 连续多天未打卡时，增加提醒频率
- 完成任务后自动停止提醒

### 3. 多种提醒类型

- 每日打卡提醒
- 连续打卡即将中断预警
- 成就解锁通知
- 积分变动通知

## 相关文档

- [微信订阅消息文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html)
- [node-cron 文档](https://github.com/node-cron/node-cron)

## 技术支持

如有问题，请查看：

1. 后端日志：`pm2 logs task-backend`
2. 数据库日志：`message_logs` 表
3. 微信开发者工具控制台
