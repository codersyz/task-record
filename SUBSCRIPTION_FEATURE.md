# 订阅消息功能说明

## 功能概述

已为你的任务打卡小程序添加了完整的订阅消息提醒功能，用户可以在每天指定时间收到微信订阅消息，提醒他们进行打卡。

## 新增文件

### 后端文件

1. **数据库脚本**
   - `task-backend/config/add-subscription-system.sql` - 创建订阅相关数据表

2. **控制器**
   - `task-backend/controllers/subscriptionController.js` - 订阅消息业务逻辑

3. **路由**
   - `task-backend/routes/subscription.js` - 订阅相关API路由

4. **测试脚本**
   - `task-backend/test-subscription.js` - 测试订阅系统是否正常

5. **文档**
   - `task-backend/SUBSCRIPTION_SETUP.md` - 详细配置指南
   - `task-backend/INSTALL_SUBSCRIPTION.md` - 快速安装指南

### 前端文件

1. **API接口**
   - `taskuniapp/api/subscription.js` - 订阅相关API调用

2. **页面**
   - `taskuniapp/pages/reminder-settings/reminder-settings.vue` - 提醒设置页面

### 修改的文件

1. **后端**
   - `task-backend/app.js` - 添加订阅路由和定时任务
   - `task-backend/package.json` - 添加 node-cron 依赖

2. **前端**
   - `taskuniapp/pages.json` - 添加提醒设置页面配置
   - `taskuniapp/pages/user/user.vue` - 添加提醒设置入口
   - `taskuniapp/pages/checkin/checkin.vue` - 打卡成功后提示订阅

3. **文档**
   - `README.md` - 更新功能说明和更新日志

## 核心功能

### 1. 提醒设置

- 用户可以自定义提醒时间（如 09:00）
- 可以开启/关闭每日打卡提醒
- 可以查看订阅状态
- 支持一键订阅

### 2. 智能提醒

- 只在用户未打卡时发送提醒
- 避免重复提醒
- 自动检测订阅状态

### 3. 订阅管理

- 打卡成功后自动提示订阅
- 订阅状态实时更新
- 发送后自动标记为已使用

### 4. 定时任务

- 每分钟检查一次
- 自动发送到期的提醒
- 记录发送日志

## 数据库表结构

### user_subscriptions（用户订阅记录表）

- id - 主键
- user_id - 用户ID
- template_id - 模板ID
- template_type - 模板类型
- subscribed_at - 订阅时间
- status - 状态（1有效 0已使用）
- used_at - 使用时间

### reminder_settings（提醒设置表）

- id - 主键
- user_id - 用户ID
- daily_reminder - 每日打卡提醒开关
- reminder_time - 提醒时间
- streak_warning - 连续打卡预警开关
- achievement_notify - 成就解锁通知开关

### message_logs（消息发送日志表）

- id - 主键
- user_id - 用户ID
- template_type - 模板类型
- template_id - 模板ID
- openid - 用户openid
- status - 发送状态
- error_msg - 错误信息
- sent_at - 发送时间

## API接口

### POST /api/subscription/record

记录用户订阅

**请求参数：**

```json
{
  "templateId": "模板ID",
  "templateType": "daily_reminder"
}
```

### GET /api/subscription/settings

获取用户提醒设置

**返回数据：**

```json
{
  "code": 200,
  "data": {
    "daily_reminder": 1,
    "reminder_time": "09:00:00",
    "streak_warning": 1,
    "achievement_notify": 1
  }
}
```

### PUT /api/subscription/settings

更新提醒设置

**请求参数：**

```json
{
  "daily_reminder": 1,
  "reminder_time": "09:00:00",
  "streak_warning": 1,
  "achievement_notify": 1
}
```

### GET /api/subscription/status

获取订阅状态

**请求参数：**

- templateType: 模板类型（如 daily_reminder）

**返回数据：**

```json
{
  "code": 200,
  "data": {
    "hasSubscription": true
  }
}
```

## 安装步骤

### 1. 执行数据库脚本

```bash
cd task-backend
mysql -u root -p task_checkin < config/add-subscription-system.sql
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置模板ID

在微信公众平台获取订阅消息模板ID后，修改以下文件：

- `taskuniapp/pages/reminder-settings/reminder-settings.vue` (第18行)
- `taskuniapp/pages/checkin/checkin.vue` (第10行)

将 `YOUR_TEMPLATE_ID_HERE` 替换为实际的模板ID

### 4. 重启服务

```bash
# 开发环境
npm run dev

# 生产环境
pm2 restart task-backend
```

### 5. 测试

```bash
node test-subscription.js
```

## 使用流程

### 用户端

1. 进入"我的" -> "提醒设置"
2. 开启"每日打卡提醒"
3. 选择提醒时间
4. 点击"立即订阅"
5. 授权订阅消息
6. 在设定时间收到提醒

### 开发者端

1. 在微信公众平台配置模板
2. 修改前端模板ID
3. 执行数据库脚本
4. 重启服务
5. 查看日志监控

## 注意事项

### 1. 订阅消息限制

- 一次性订阅：用户授权后只能发送一次
- 需要用户主动授权
- 发送后订阅状态自动失效

### 2. 最佳实践

- 在打卡成功后提示订阅
- 不要频繁弹出订阅请求
- 提供清晰的订阅说明

### 3. 模板选择

推荐使用以下类型的模板：

- 待办事项提醒
- 任务提醒
- 打卡提醒
- 日程提醒

### 4. 定时任务

- 每分钟执行一次检查
- 只在整点分钟发送
- 自动记录发送日志

## 监控和调试

### 查看日志

```bash
# PM2日志
pm2 logs task-backend

# 或直接运行
npm run dev
```

### 数据库查询

```sql
-- 查看订阅记录
SELECT * FROM user_subscriptions ORDER BY subscribed_at DESC LIMIT 10;

-- 查看提醒设置
SELECT * FROM reminder_settings;

-- 查看发送日志
SELECT * FROM message_logs ORDER BY sent_at DESC LIMIT 20;
```

### 测试脚本

```bash
node test-subscription.js
```

## 扩展功能

当前实现了每日打卡提醒，未来可以扩展：

1. **连续打卡预警** - 即将中断时提醒
2. **成就解锁通知** - 解锁新成就时通知
3. **积分变动通知** - 积分增加时通知
4. **任务到期提醒** - 任务即将到期时提醒

这些功能的基础架构已经搭建好，只需要：

1. 在微信公众平台添加对应模板
2. 在前端添加订阅入口
3. 在后端添加发送逻辑

## 相关文档

- [详细配置指南](task-backend/SUBSCRIPTION_SETUP.md)
- [快速安装指南](task-backend/INSTALL_SUBSCRIPTION.md)
- [微信订阅消息文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html)

## 技术支持

如有问题，请：

1. 查看后端日志
2. 运行测试脚本
3. 检查数据库表
4. 查看微信开发者工具控制台

---

功能已完成，祝使用愉快！🎉
