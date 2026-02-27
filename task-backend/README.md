# 任务打卡小程序后端API

基于 Node.js + Express + MySQL 的任务打卡系统后端服务。

## 功能特性

- 微信小程序登录
- 任务管理（增删改查）
- 打卡记录管理
- 连续打卡天数统计
- 打卡日历查询
- JWT 身份认证

## 技术栈

- Node.js
- Express.js
- MySQL 8.0+
- JWT 认证
- Axios

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
PORT=3003
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_checkin
JWT_SECRET=your_jwt_secret_key
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

### 3. 创建数据库

执行 `config/database.sql` 文件创建数据库和表：

```bash
mysql -u root -p < config/database.sql
```

### 4. 启动服务

开发模式（自动重启）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

## API 接口文档

### 认证相关

#### 微信登录

- POST `/api/auth/login`
- Body: `{ "code": "微信登录code" }`
- 返回: `{ "token", "userId", "isNewUser" }`

#### 更新用户信息

- PUT `/api/auth/user`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "nickname": "昵称", "avatarUrl": "头像URL" }`

#### 获取用户信息

- GET `/api/auth/user`
- Headers: `Authorization: Bearer {token}`

### 任务管理

#### 创建任务

- POST `/api/tasks`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "title": "任务标题", "description": "描述", "targetDays": 30 }`

#### 获取任务列表

- GET `/api/tasks?status=1`
- Headers: `Authorization: Bearer {token}`

#### 获取任务详情

- GET `/api/tasks/:id`
- Headers: `Authorization: Bearer {token}`

#### 更新任务

- PUT `/api/tasks/:id`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "title": "新标题", "status": 0 }`

#### 删除任务

- DELETE `/api/tasks/:id`
- Headers: `Authorization: Bearer {token}`

### 打卡管理

#### 打卡

- POST `/api/checkins`
- Headers: `Authorization: Bearer {token}`
- Body: `{ "taskId": 1, "note": "今天完成了...", "images": [] }`

#### 获取打卡记录

- GET `/api/checkins/task/:taskId?page=1&pageSize=20`
- Headers: `Authorization: Bearer {token}`

#### 获取打卡日历

- GET `/api/checkins/calendar/:taskId?year=2024&month=2`
- Headers: `Authorization: Bearer {token}`

#### 删除打卡记录

- DELETE `/api/checkins/:id`
- Headers: `Authorization: Bearer {token}`

## 数据库设计

### users 用户表

- id: 主键
- openid: 微信openid
- nickname: 昵称
- avatar_url: 头像

### tasks 任务表

- id: 主键
- user_id: 用户ID
- title: 任务标题
- description: 任务描述
- target_days: 目标天数
- current_days: 当前连续天数
- total_days: 累计打卡天数
- status: 状态（1进行中 0已完成）

### checkins 打卡记录表

- id: 主键
- task_id: 任务ID
- user_id: 用户ID
- checkin_date: 打卡日期
- note: 打卡备注
- images: 打卡图片（JSON）

## 部署说明

### 服务器要求

- Node.js 14+
- MySQL 8.0+
- Nginx（可选，用于反向代理）

### 部署步骤

1. 上传代码到服务器
2. 安装依赖：`npm install --production`
3. 配置 `.env` 文件
4. 创建数据库
5. 使用 PM2 启动：`pm2 start app.js --name task-backend`
6. 配置 Nginx 反向代理（可选）

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 注意事项

1. 微信小程序要求使用 HTTPS，生产环境需配置 SSL 证书
2. 修改 JWT_SECRET 为强密码
3. 定期备份数据库
4. 建议使用 PM2 进行进程管理
5. 生产环境关闭数据库日志输出

## License

MIT
