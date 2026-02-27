#!/bin/bash

# 任务打卡后端一键部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e  # 遇到错误立即退出

echo "================================"
echo "任务打卡后端部署脚本"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_DIR="/var/www/task-backend"
DB_NAME="task_checkin"
DB_USER="root"
DB_PASSWORD="Sun123456@"
APP_NAME="task-backend"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root用户运行此脚本${NC}"
    exit 1
fi

# 步骤1: 检查Node.js
echo -e "${YELLOW}[1/10] 检查Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js未安装，正在安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js已安装: $(node -v)${NC}"
fi

# 步骤2: 检查PM2
echo -e "${YELLOW}[2/10] 检查PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2未安装，正在安装...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}PM2已安装: $(pm2 -v)${NC}"
fi

# 步骤3: 检查MySQL
echo -e "${YELLOW}[3/10] 检查MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL未安装，请先安装MySQL${NC}"
    exit 1
else
    echo -e "${GREEN}MySQL已安装${NC}"
fi

# 步骤4: 进入项目目录
echo -e "${YELLOW}[4/10] 检查项目目录...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}项目目录不存在: $PROJECT_DIR${NC}"
    echo "请先上传代码到服务器"
    exit 1
fi
cd $PROJECT_DIR
echo -e "${GREEN}项目目录: $PROJECT_DIR${NC}"

# 步骤5: 检查.env文件
echo -e "${YELLOW}[5/10] 检查环境配置...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}.env文件不存在，正在创建...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}请编辑.env文件配置数据库等信息${NC}"
    exit 1
else
    echo -e "${GREEN}.env文件存在${NC}"
    chmod 600 .env
fi

# 步骤6: 安装依赖
echo -e "${YELLOW}[6/10] 安装项目依赖...${NC}"
npm install --production
echo -e "${GREEN}依赖安装完成${NC}"

# 步骤7: 创建必要目录
echo -e "${YELLOW}[7/10] 创建必要目录...${NC}"
mkdir -p uploads
mkdir -p logs
chmod 755 uploads
chmod 755 logs
echo -e "${GREEN}目录创建完成${NC}"

# 步骤8: 初始化数据库
echo -e "${YELLOW}[8/10] 初始化数据库...${NC}"
# read -p "是否需要初始化数据库？(y/n): " init_db
# if [ "$init_db" = "y" ]; then
#     # 检查数据库是否存在
#     DB_EXISTS=$(mysql -u$DB_USER -p$DB_PASSWORD -e "SHOW DATABASES LIKE '$DB_NAME';" | grep "$DB_NAME" > /dev/null; echo "$?")
    
#     if [ $DB_EXISTS -eq 0 ]; then
#         echo -e "${YELLOW}数据库已存在，是否重新初始化？(会删除所有数据) (y/n):${NC}"
#         read -p "" reinit_db
#         if [ "$reinit_db" = "y" ]; then
#             mysql -u$DB_USER -p$DB_PASSWORD -e "DROP DATABASE $DB_NAME;"
#             mysql -u$DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
#             mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < config/init-database.sql
#             echo -e "${GREEN}数据库重新初始化完成${NC}"
#         fi
#     else
#         mysql -u$DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
#         mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < config/init-database.sql
#         echo -e "${GREEN}数据库初始化完成${NC}"
#     fi
# else
#     echo -e "${YELLOW}跳过数据库初始化${NC}"
# fi

# 步骤9: 启动应用
echo -e "${YELLOW}[9/10] 启动应用...${NC}"

# 检查应用是否已在运行
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}应用已在运行，正在重启...${NC}"
    pm2 restart $APP_NAME
else
    echo -e "${YELLOW}启动新应用...${NC}"
    pm2 start ecosystem.config.js
fi

# 保存PM2进程列表
pm2 save

echo -e "${GREEN}应用启动完成${NC}"

# 步骤10: 配置开机自启
echo -e "${YELLOW}[10/10] 配置开机自启...${NC}"
pm2 startup systemd -u root --hp /root
echo -e "${GREEN}开机自启配置完成${NC}"

# 显示应用状态
echo ""
echo "================================"
echo -e "${GREEN}部署完成！${NC}"
echo "================================"
echo ""
pm2 list
echo ""
echo "查看日志: pm2 logs $APP_NAME"
echo "重启应用: pm2 restart $APP_NAME"
echo "停止应用: pm2 stop $APP_NAME"
echo ""
echo "测试接口: curl http://localhost:3003/health"
echo ""

# 测试健康检查
echo -e "${YELLOW}正在测试接口...${NC}"
sleep 2
if curl -s http://localhost:3003/health | grep -q "ok"; then
    echo -e "${GREEN}✓ 接口测试成功！${NC}"
else
    echo -e "${RED}✗ 接口测试失败，请检查日志${NC}"
    pm2 logs $APP_NAME --lines 20
fi

echo ""
echo -e "${YELLOW}提醒事项：${NC}"
echo "1. 确保防火墙已开放3003端口"
echo "2. 如果使用云服务器，需要在安全组中开放3003端口"
echo "3. 建议配置Nginx反向代理（参考nginx.conf）"
echo "4. 生产环境建议使用HTTPS"
echo ""
