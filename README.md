# 任务打卡小程序

一个基于 uni-app + Node.js + MySQL 的任务打卡微信小程序，帮助用户养成良好习惯，坚持每日打卡。

## 项目简介

这是一个完整的全栈项目，包含：

- 前端：uni-app（Vue 2）开发的微信小程序
- 后端：Node.js + Express + MySQL
- 功能：微信登录、任务管理、每日打卡、数据统计、成就系统

## 功能特性

### 用户功能

- ✅ 微信一键登录
- ✅ 自定义头像和昵称（适配微信新规）
- ✅ 个人信息管理
- ✅ 测试登录（开发环境）

### 任务管理

- ✅ 创建任务（设置目标天数、选择分类）
- ✅ 任务分类：学习📚、运动🏃、阅读📖、健康💪、工作💼、其他📝
- ✅ 查看任务列表（全部/进行中/已完成）
- ✅ 任务详情查看
- ✅ 删除任务

### 打卡功能

- ✅ 每日打卡（支持拍照、添加备注）
- ✅ 打卡记录查看
- ✅ 打卡日历视图（月历展示）
- ✅ 打卡状态实时显示
- ✅ 自动完成任务（达到目标天数）
- ✅ 防重复打卡

### 成就系统

- ✅ 9种成就徽章（使用 Emoji 图标）
- ✅ 自动检测并解锁成就
- ✅ 打卡成功后弹窗提示新成就
- ✅ 成就中心查看所有成就及进度

### 数据统计

- ✅ 总任务数统计
- ✅ 总打卡数统计
- ✅ 最长连续打卡天数
- ✅ 月度打卡统计

## 技术栈

### 前端

- uni-app
- Vue 2（Options API）
- 自定义 TabBar（iconfont 图标）

### 后端

- Node.js
- Express
- MySQL 8.0+
- JWT 认证
- axios

## 项目结构

```
.
├── testuniapp/              # 前端小程序
│   ├── pages/              # 页面
│   │   ├── index/         # 首页（任务列表）
│   │   ├── login/         # 登录页
│   │   ├── user/          # 个人中心
│   │   ├── profile-edit.vue  # 编辑个人信息
│   │   ├── task/          # 任务相关
│   │   │   ├── create.vue # 创建任务
│   │   │   └── detail.vue # 任务详情
│   │   ├── checkin/       # 打卡页
│   │   ├── calendar/      # 打卡日历
│   │   └── achievement/   # 成就中心
│   ├── components/        # 组件
│   │   └── custom-tabbar/ # 自定义 TabBar
│   ├── api/               # API 接口
│   ├── utils/             # 工具函数
│   └── static/            # 静态资源（图标字体）
│
├── task-backend/           # 后端服务
│   ├── controllers/       # 控制器
│   │   ├── authController.js        # 认证相关
│   │   ├── taskController.js        # 任务管理
│   │   ├── checkinController.js     # 打卡管理
│   │   └── achievementController.js # 成就系统
│   ├── routes/            # 路由
│   ├── middleware/        # 中间件（JWT 认证）
│   ├── config/            # 配置
│   │   ├── db.js         # 数据库连接
│   │   └── database.sql  # 数据库结构
│   └── app.js            # 入口文件
│
├── generate-token.js       # JWT token 生成工具
└── README.md              # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 14.0
- MySQL >= 5.7
- HBuilderX（用于开发 uni-app）
- 微信开发者工具

### 1. 数据库配置

```bash
# 登录 MySQL
mysql -h 你的数据库地址 -u 用户名 -p

# 创建数据库
CREATE DATABASE task_checkin;

# 导入数据库结构
mysql -h 你的数据库地址 -u 用户名 -p task_checkin < task-backend/config/database.sql
```

### 2. 后端配置

```bash
# 进入后端目录
cd task-backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 编辑 .env 文件，填入你的配置
# DB_HOST=你的数据库地址
# DB_USER=数据库用户名
# DB_PASSWORD=数据库密码
# DB_NAME=task_checkin
# JWT_SECRET=你的密钥
# WECHAT_APPID=你的小程序AppID
# WECHAT_SECRET=你的小程序Secret

# 启动后端服务
npm start
```

后端服务将运行在 `http://localhost:3000`

### 3. 前端配置

```bash
# 用 HBuilderX 打开 taskuniapp 目录

# 修改 API 地址
# 编辑 taskuniapp/utils/request.js
# 将 baseURL 改为你的后端地址
```

对于真机调试，需要使用局域网 IP：

```javascript
// taskuniapp/utils/request.js
const baseURL = "http://192.168.x.x:3000/api"; // 替换为你的局域网IP
```

### 4. 微信小程序配置

1. 在微信公众平台注册小程序，获取 AppID 和 Secret
2. 在 `taskuniapp/manifest.json` 中填入你的 AppID
3. 在后端 `.env` 文件中填入 AppID 和 Secret
4. 用微信开发者工具打开 `taskuniapp` 目录
5. 编译运行

## API 文档

详见 `task-backend/API_STATUS_CODES.md`

### 主要接口

#### 认证相关

- `POST /api/auth/wechat-login` - 微信登录
- `POST /api/auth/test-login` - 测试登录（开发用）
- `GET /api/auth/userinfo` - 获取用户信息
- `PUT /api/auth/userinfo` - 更新用户信息

#### 任务管理

- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务（支持分类）
- `GET /api/tasks/:id` - 获取任务详情
- `DELETE /api/tasks/:id` - 删除任务

#### 打卡管理

- `POST /api/checkins` - 创建打卡记录
- `GET /api/checkins/task/:taskId` - 获取任务打卡记录
- `GET /api/checkins/check/:taskId` - 检查今日是否已打卡
- `GET /api/checkins/monthly-calendar` - 获取月度打卡日历

#### 成就系统

- `GET /api/achievements` - 获取用户成就列表

## 业务逻辑说明

### 打卡规则

1. 每个任务每天只能打卡一次
2. 打卡后 `total_days` 自动 +1
3. 当 `total_days >= target_days` 时，任务自动完成（status=0）
4. 已完成的任务不能再打卡
5. 打卡成功后自动检测并解锁成就

### 任务状态

- `status=1`：进行中
- `status=0`：已完成

### 任务分类

- `study`：学习 📚（蓝色）
- `sport`：运动 🏃（橙色）
- `read`：阅读 📖（紫色）
- `health`：健康 💪（绿色）
- `work`：工作 💼（红色）
- `other`：其他 📝（灰色）

### 成就系统

9种成就徽章，自动解锁：

1. 🌱 新手上路 - 完成第1次打卡
2. 🔥 初露锋芒 - 连续打卡7天
3. ⭐ 坚持不懈 - 连续打卡30天
4. 💎 习惯大师 - 连续打卡100天
5. 🏆 任务达人 - 完成10个任务
6. 👑 任务专家 - 完成50个任务
7. 🎯 打卡狂人 - 累计打卡100次
8. 🌟 年度冠军 - 累计打卡365次
9. 🎨 全能选手 - 同时进行5个任务

### 用户信息获取

由于微信在 2024年10月 废弃了 `getUserProfile` API，现在使用新方式：

- 头像：使用 `button` 的 `open-type="chooseAvatar"` 属性
- 昵称：使用 `input` 的 `type="nickname"` 属性
- 用户登录后跳转到个人信息编辑页完善信息
- 可随时在个人中心修改头像和昵称

## 开发说明

### 真机调试

1. 确保手机和电脑在同一局域网
2. 获取电脑局域网 IP：

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

3. 修改前端 API 地址为局域网 IP
4. 后端确保监听 `0.0.0.0`（已配置）
5. 在微信开发者工具中选择真机调试

### 测试登录

开发环境提供了测试登录功能，无需真实微信登录：

- 点击登录页的"测试登录（开发用）"按钮
- 自动使用测试账号登录

### 自定义 TabBar 图标

项目使用 iconfont 字体图标，支持动态改变颜色。

如需替换图标：

1. 访问 https://www.iconfont.cn/
2. 选择图标并生成字体文件
3. 替换 `testuniapp/static/` 下的字体文件
4. 更新 `components/custom-tabbar/custom-tabbar.vue` 中的图标类名

当前图标类名：

- `icon-task` - 任务图标
- `icon-user` - 用户图标

颜色配置：

- 未选中：`#999999`
- 选中：`#667eea`（紫色）

## 常见问题

### 1. 连接后端失败（ERR_CONNECTION_REFUSED）

- 检查后端是否启动
- 检查 API 地址是否正确
- 真机调试需要使用局域网 IP，不能用 localhost

### 2. 微信登录失败

- 检查 AppID 和 Secret 是否正确
- 检查小程序是否在微信公众平台配置了服务器域名
- 开发环境可以在微信开发者工具中勾选"不校验合法域名"

### 3. 无法获取用户头像和昵称

- 这是正常的，微信已废弃 `getUserProfile` API
- 用户需要在个人信息编辑页手动选择头像和输入昵称
- 使用 `open-type="chooseAvatar"` 和 `type="nickname"` 获取

### 4. 数据库连接失败

- 检查数据库地址、用户名、密码是否正确
- 检查数据库是否允许远程连接
- 检查防火墙是否开放 MySQL 端口（默认 3306）

### 5. TabBar 图标不显示

- 检查字体文件路径是否正确（`static/iconfont.*`）
- 检查 `iconfont.css` 中的 `@font-face` 路径
- 确保图标类名与 CSS 中定义的一致

### 6. 成就未解锁

- 成就在打卡成功后自动检测
- 检查后端日志确认成就检测逻辑是否执行
- 查看 `achievements` 表确认数据是否写入

## 部署说明

### 后端部署

1. 将代码上传到服务器
2. 安装 Node.js 和 MySQL
3. 配置 `.env` 文件
4. 使用 PM2 管理进程：
   ```bash
   npm install -g pm2
   pm2 start app.js --name task-backend
   pm2 save
   pm2 startup
   ```

### 小程序发布

1. 在微信公众平台配置服务器域名（request、uploadFile、downloadFile）
2. 在 HBuilderX 中点击"发行" -> "小程序-微信"
3. 上传代码到微信公众平台
4. 提交审核

## 许可证

MIT

## 作者

开发于 2026年2月

## 更新日志

### v1.2.0 (2026-02-12)

- ✅ 新增打卡日历视图（月历展示）
- ✅ 新增任务分类/标签功能（6种分类）
- ✅ 新增成就系统（9种成就徽章）
- ✅ 优化任务列表显示（显示分类标签）
- ✅ 优化打卡成功提示（显示新解锁成就）

### v1.1.0 (2026-02-11)

- ✅ 适配微信新规（头像昵称获取方式）
- ✅ 新增个人信息编辑页
- ✅ 新增测试登录功能
- ✅ 优化用户体验

### v1.0.0 (2026-02-11)

- ✅ 完成基础功能开发
- ✅ 微信登录
- ✅ 任务管理
- ✅ 打卡功能
- ✅ 用户信息管理
- ✅ 数据统计
