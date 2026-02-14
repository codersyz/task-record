# 数据库配置文件说明

## 文件列表

### 主要文件

#### `init-database.sql` ⭐ 推荐使用

**完整的数据库初始化脚本**

包含所有表结构和功能：

- 用户表（含积分字段）
- 任务表（含分类字段）
- 打卡记录表
- 成就表
- 积分记录表
- 每日打卡日志表
- 排行榜视图

**使用场景：** 新项目初始化

**使用方法：**

```bash
mysql -u root -p < init-database.sql
```

---

#### `database.sql`

**基础数据库结构**

包含核心表结构（不含积分系统）：

- 用户表（基础字段）
- 任务表
- 打卡记录表
- 成就表
- 排行榜视图

**使用场景：** 仅在需要基础功能时使用（不推荐）

---

#### `add-points-system.sql`

**积分系统增量更新脚本**

为已有数据库添加积分系统：

- 给 users 表添加积分相关字段
- 创建积分记录表
- 创建每日打卡日志表

**使用场景：** 从旧版本升级到积分系统版本

**使用方法：**

```bash
mysql -u root -p task_checkin < add-points-system.sql
```

---

### 历史文件（已废弃）

#### `add-category-column.sql`

**任务分类字段更新**

为 tasks 表添加 category 字段。

**状态：** 已整合到 `init-database.sql`

---

#### `add-category-simple.sql`

**简化版分类更新**

同上，简化版本。

**状态：** 已废弃

---

### 配置文件

#### `db.js`

**数据库连接配置**

MySQL 连接池配置文件，从 `.env` 读取配置。

---

## 使用建议

### 新项目

直接使用 `init-database.sql`：

```bash
# 1. 执行初始化脚本
mysql -u root -p < task-backend/config/init-database.sql

# 2. 验证数据库（可选）
cd task-backend
node test-points-system.js

# 3. 启动后端
npm start
```

### 旧项目升级

如果已有数据库，只需添加积分系统：

```bash
# 1. 备份数据库（重要！）
mysqldump -u root -p task_checkin > backup.sql

# 2. 执行积分系统更新
mysql -u root -p task_checkin < task-backend/config/add-points-system.sql

# 3. 验证更新
cd task-backend
node test-points-system.js

# 4. 重启后端
npm start
```

### 开发环境重置

如果需要完全重置数据库：

```bash
# 1. 删除数据库
mysql -u root -p -e "DROP DATABASE IF EXISTS task_checkin;"

# 2. 重新初始化
mysql -u root -p < task-backend/config/init-database.sql
```

## 数据库结构

### 表关系图

```
users (用户表)
  ├── tasks (任务表) - 一对多
  │   └── checkins (打卡记录表) - 一对多
  ├── achievements (成就表) - 一对多
  ├── point_records (积分记录表) - 一对多
  └── daily_checkin_log (每日打卡日志表) - 一对多
```

### 表说明

| 表名              | 说明         | 记录数预估             |
| ----------------- | ------------ | ---------------------- |
| users             | 用户信息     | 按用户数               |
| tasks             | 任务信息     | 用户数 × 5-10          |
| checkins          | 打卡记录     | 用户数 × 任务数 × 天数 |
| achievements      | 成就记录     | 用户数 × 9             |
| point_records     | 积分记录     | 用户数 × 天数 × 1-3    |
| daily_checkin_log | 每日打卡日志 | 用户数 × 天数          |

### 索引说明

所有表都包含必要的索引以优化查询性能：

- 主键索引
- 外键索引
- 常用查询字段索引
- 唯一约束索引

## 常见问题

### Q: 执行 SQL 文件时报错 "Table already exists"

A: 所有 SQL 文件都使用了 `CREATE TABLE IF NOT EXISTS`，不会重复创建表。如果报错，可能是：

1. 使用了错误的 SQL 文件
2. 数据库版本不兼容
3. 权限不足

### Q: 如何查看当前数据库结构？

A: 使用以下命令：

```bash
mysql -u root -p task_checkin -e "SHOW TABLES;"
mysql -u root -p task_checkin -e "DESCRIBE users;"
```

### Q: 如何备份数据库？

A: 使用 mysqldump：

```bash
mysqldump -u root -p task_checkin > backup_$(date +%Y%m%d).sql
```

### Q: 如何恢复数据库？

A: 使用 mysql 导入：

```bash
mysql -u root -p task_checkin < backup_20260213.sql
```

## 版本历史

- **v1.3.2** (2026-02-13) - 创建 `init-database.sql` 整合所有 SQL 文件
- **v1.3.0** (2026-02-13) - 添加积分系统表结构
- **v1.2.0** (2026-02-12) - 添加任务分类字段
- **v1.1.0** (2026-02-11) - 添加成就系统表
- **v1.0.0** (2026-02-11) - 初始数据库结构
