# 快速部署指南

## 最简单的部署方式（推荐新手）

### 1. 上传代码到服务器

在本地电脑执行：

```bash
# 进入后端目录
cd task-backend

# 打包代码（排除node_modules）
tar -czf task-backend.tar.gz --exclude='node_modules' --exclude='.git' --exclude='logs' .

# 上传到服务器
scp task-backend.tar.gz root@43.142.65.192:/var/www/
```

### 2. 在服务器上解压并部署

SSH登录服务器：

```bash
ssh root@43.142.65.192
```

执行以下命令：

```bash
# 解压代码
cd /root
mkdir -p task-backend
tar -xzf task-backend.tar.gz -C task-backend
cd task-backend

# 给部署脚本执行权限
chmod +x deploy.sh

# 运行一键部署脚本
./deploy.sh
```

按照脚本提示操作即可！

### 3. 验证部署

```bash
# 查看应用状态
pm2 list

# 查看日志
pm2 logs task-backend

# 测试接口
curl http://localhost:3003/health
curl http://43.142.65.192:3003/health
```

## 手动部署步骤（如果自动脚本失败）

### 1. 安装Node.js和PM2

```bash
# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装PM2
npm install -g pm2
```

### 2. 安装项目依赖

```bash
cd /root/task-backend
npm install --production
```

### 3. 创建必要目录

```bash
mkdir -p uploads logs
chmod 755 uploads logs
```

### 4. 初始化数据库

```bash
# 登录MySQL
mysql -u root -p
# 输入密码: Sun123456@

# 执行以下SQL
CREATE DATABASE IF NOT EXISTS task_checkin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task_checkin;
SOURCE /root/task-backend/config/init-database.sql;
EXIT;
```

### 5. 启动应用

```bash
# 使用PM2启动
pm2 start ecosystem.config.js

# 保存进程列表
pm2 save

# 配置开机自启
pm2 startup
```

### 6. 开放端口

```bash
# 如果使用ufw防火墙
ufw allow 3003/tcp

# 如果使用iptables
iptables -A INPUT -p tcp --dport 3003 -j ACCEPT
iptables-save
```

**重要：** 如果使用云服务器（阿里云、腾讯云等），还需要在云控制台的安全组中开放3003端口！

## 常见问题

### Q1: 部署脚本执行失败？

```bash
# 查看详细错误信息
bash -x deploy.sh
```

### Q2: 应用启动失败？

```bash
# 查看错误日志
pm2 logs task-backend --err

# 或手动启动查看错误
node app.js
```

### Q3: 数据库连接失败？

```bash
# 测试数据库连接
mysql -h 43.142.65.192 -u root -pSun123456@ -e "SELECT 1;"

# 检查.env文件配置
cat .env
```

### Q4: 端口被占用？

```bash
# 查看端口占用
lsof -i :3003

# 杀死占用进程
kill -9 <PID>
```

### Q5: 外网无法访问？

1. 检查防火墙是否开放3003端口
2. 检查云服务器安全组是否开放3003端口
3. 检查应用是否正常运行：`pm2 list`
4. 检查应用是否监听0.0.0.0：`netstat -tulpn | grep 3003`

## 更新代码

当代码有更新时：

```bash
# 1. 上传新代码（覆盖旧文件）
scp task-backend.tar.gz root@43.142.65.192:/root/

# 2. SSH登录服务器
ssh root@43.142.65.192

# 3. 备份当前版本
cd /root
cp -r task-backend task-backend-backup-$(date +%Y%m%d)

# 4. 解压新代码
tar -xzf task-backend.tar.gz -C task-backend

# 5. 安装依赖（如果有新依赖）
cd task-backend
npm install --production

# 6. 重启应用
pm2 restart task-backend

# 7. 查看日志确认
pm2 logs task-backend --lines 50
```

## 配置小程序端

部署完成后，修改小程序端的API地址：

```javascript
// taskuniapp/utils/request.js
const baseURL = "http://43.142.65.192:3003/api";
```

然后在微信公众平台配置服务器域名：

1. 登录微信公众平台
2. 开发 -> 开发管理 -> 开发设置 -> 服务器域名
3. 添加：http://43.142.65.192

**注意：** 正式发布时必须使用HTTPS和备案域名！

## 下一步优化

1. 配置Nginx反向代理（参考nginx.conf）
2. 申请SSL证书，启用HTTPS
3. 配置域名解析
4. 设置定期备份
5. 配置监控告警

## 需要帮助？

查看完整文档：`DEPLOYMENT.md`
