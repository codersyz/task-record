# 订阅消息模板配置指南

## 问题说明

如果你看到类似以下错误：

```
发送提醒失败: 游人渐稀, 错误: argument invalid! data.thing9.value is empty
```

这说明你的订阅消息模板字段与代码中的不匹配。

## 如何查看你的模板字段

### 1. 登录微信公众平台

访问 https://mp.weixin.qq.com/

### 2. 查看模板详情

1. 进入"功能" -> "订阅消息"
2. 找到你添加的模板
3. 点击"详情"查看模板内容

### 3. 记录模板字段

模板内容示例：

```
{{thing1.DATA}}
时间：{{time2.DATA}}
备注：{{thing3.DATA}}
```

或者：

```
提醒内容：{{thing9.DATA}}
提醒时间：{{date4.DATA}}
温馨提示：{{thing5.DATA}}
```

## 常见模板类型

### 类型1：待办事项提醒

```
事项：{{thing1.DATA}}
时间：{{time2.DATA}}
备注：{{thing3.DATA}}
```

**对应代码：**

```javascript
const messageData = {
  thing1: { value: "每日打卡提醒" },
  time2: { value: now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) },
  thing3: { value: `您有${taskCount}个任务待打卡` },
};
```

### 类型2：任务提醒

```
任务名称：{{thing1.DATA}}
任务内容：{{thing2.DATA}}
提醒时间：{{date3.DATA}}
```

**对应代码：**

```javascript
const messageData = {
  thing1: { value: "每日打卡提醒" },
  thing2: { value: `您有${taskCount}个任务待打卡` },
  date3: { value: now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) },
};
```

### 类型3：日程提醒

```
提醒内容：{{thing9.DATA}}
提醒时间：{{date4.DATA}}
温馨提示：{{thing5.DATA}}
```

**对应代码：**

```javascript
const messageData = {
  thing9: { value: "每日打卡提醒" },
  date4: { value: now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) },
  thing5: { value: `您有${taskCount}个任务待打卡` },
};
```

## 如何修改代码

### 1. 打开控制器文件

```bash
vim task-backend/controllers/subscriptionController.js
```

### 2. 找到发送消息的代码

搜索 `const messageData = {`，大约在第 230 行左右

### 3. 根据你的模板修改字段

将字段名和内容替换为你的模板对应的字段。

**示例：如果你的模板是**

```
提醒内容：{{thing9.DATA}}
提醒时间：{{date4.DATA}}
温馨提示：{{thing5.DATA}}
```

**修改为：**

```javascript
const messageData = {
  thing9: { value: "每日打卡提醒" },
  date4: { value: now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) },
  thing5: { value: `您有${taskCount}个任务待打卡` },
};
```

### 4. 重启服务

```bash
pm2 restart task-backend
# 或
npm start
```

## 字段类型说明

### thing 类型（文本）

- 用于显示文本内容
- 最多20个字符
- 示例：`thing1`, `thing2`, `thing9`

### time 类型（时间）

- 用于显示时间
- 格式：`2024-02-28 09:00:00`
- 示例：`time2`, `time3`

### date 类型（日期）

- 用于显示日期或日期时间
- 格式：`2024-02-28` 或 `2024-02-28 09:00:00`
- 示例：`date3`, `date4`

### number 类型（数字）

- 用于显示数字
- 示例：`number5`

### character_string 类型（字符串）

- 用于显示较长的文本
- 最多32个字符
- 示例：`character_string6`

## 推荐模板

建议选择以下类型的模板，字段简单且常用：

### 推荐1：待办事项提醒

```
模板ID: xxxxxxxxx
模板内容：
{{thing1.DATA}}
时间：{{time2.DATA}}
备注：{{thing3.DATA}}
```

### 推荐2：任务提醒

```
模板ID: xxxxxxxxx
模板内容：
任务名称：{{thing1.DATA}}
任务内容：{{thing2.DATA}}
提醒时间：{{date3.DATA}}
```

## 测试方法

### 1. 修改代码后重启服务

### 2. 在小程序中订阅消息

### 3. 手动触发发送测试

```bash
cd task-backend
node -e "
const controller = require('./controllers/subscriptionController');
controller.sendDailyReminders();
"
```

### 4. 查看日志

```bash
pm2 logs task-backend
```

## 常见错误

### 错误1：data.thingX.value is empty

**原因：** 模板中有该字段，但代码中没有提供值

**解决：** 在 messageData 中添加该字段

### 错误2：invalid data.thingX

**原因：** 提供的字段在模板中不存在

**解决：** 删除代码中多余的字段

### 错误3：data.thingX.value exceed max length

**原因：** 字段值超过最大长度限制

**解决：** 缩短文本内容（thing类型最多20字符）

## 完整示例

假设你的模板是：

```
提醒内容：{{thing9.DATA}}
提醒时间：{{date4.DATA}}
温馨提示：{{thing5.DATA}}
```

修改 `task-backend/controllers/subscriptionController.js` 第 230 行左右：

```javascript
// 发送订阅消息
const messageData = {
  thing9: { value: "每日打卡提醒" },
  date4: { value: now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) },
  thing5: { value: `您有${taskCount}个任务待打卡` },
};

const result = await sendSubscribeMessage(
  user.openid,
  user.template_id,
  messageData,
);
```

保存后重启服务即可。

## 需要帮助？

如果还是不确定如何配置，请：

1. 截图你的模板详情页面
2. 提供模板ID
3. 提供完整的错误信息

我会帮你生成正确的代码配置。
