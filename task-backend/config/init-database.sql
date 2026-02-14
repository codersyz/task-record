-- ============================================
-- 任务打卡小程序 - 完整数据库初始化脚本
-- 版本: v1.3.2
-- 创建日期: 2026-02-13
-- 说明: 包含所有表结构、索引、视图和积分系统
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS task_checkin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE task_checkin;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  points INT DEFAULT 0 COMMENT '用户积分',
  consecutive_days INT DEFAULT 0 COMMENT '连续打卡天数',
  last_checkin_date DATE COMMENT '最后打卡日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 任务表
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  title VARCHAR(200) NOT NULL COMMENT '任务标题',
  description TEXT COMMENT '任务描述',
  category VARCHAR(50) DEFAULT 'other' COMMENT '任务分类: study学习 sport运动 read阅读 health健康 work工作 other其他',
  target_days INT DEFAULT 0 COMMENT '目标天数',
  current_days INT DEFAULT 0 COMMENT '当前连续天数',
  total_days INT DEFAULT 0 COMMENT '累计打卡天数',
  status TINYINT DEFAULT 1 COMMENT '状态: 1进行中 0已完成',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- ============================================
-- 3. 打卡记录表
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL COMMENT '任务ID',
  user_id INT NOT NULL COMMENT '用户ID',
  checkin_date DATE NOT NULL COMMENT '打卡日期',
  note TEXT COMMENT '打卡备注',
  images JSON COMMENT '打卡图片',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_task_date (task_id, checkin_date),
  INDEX idx_user_id (user_id),
  INDEX idx_checkin_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡记录表';

-- ============================================
-- 4. 成就表
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  achievement_type VARCHAR(50) NOT NULL COMMENT '成就类型',
  achievement_level INT DEFAULT 1 COMMENT '成就等级',
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_achievement (user_id, achievement_type, achievement_level),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户成就表';

-- ============================================
-- 5. 积分记录表
-- ============================================
CREATE TABLE IF NOT EXISTS point_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  points INT NOT NULL COMMENT '积分变化（正数为增加，负数为减少）',
  type VARCHAR(50) NOT NULL COMMENT '积分类型: daily_first首次打卡 streak_7连续7天 streak_30连续30天',
  description VARCHAR(200) COMMENT '积分说明',
  related_id INT COMMENT '关联ID（如任务ID、打卡ID）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分记录表';

-- ============================================
-- 6. 每日打卡日志表
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checkin_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  checkin_date DATE NOT NULL COMMENT '打卡日期',
  first_checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '首次打卡时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_date (user_id, checkin_date),
  INDEX idx_checkin_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日打卡日志表';

-- ============================================
-- 7. 排行榜视图
-- ============================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.nickname,
  u.avatar_url,
  COUNT(DISTINCT c.checkin_date) as total_checkins,
  COUNT(DISTINCT t.id) as total_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN checkins c ON u.id = c.user_id
GROUP BY u.id, u.nickname, u.avatar_url
ORDER BY total_checkins DESC;

-- ============================================
-- 初始化完成
-- ============================================
-- 数据库初始化完成！
-- 
-- 表结构说明：
-- 1. users - 用户表（包含积分字段）
-- 2. tasks - 任务表（包含分类字段）
-- 3. checkins - 打卡记录表
-- 4. achievements - 成就表
-- 5. point_records - 积分记录表
-- 6. daily_checkin_log - 每日打卡日志表
-- 7. leaderboard - 排行榜视图
--
-- 下一步：
-- 1. 配置后端 .env 文件
-- 2. 启动后端服务: npm start
-- 3. 配置前端 API 地址
-- 4. 运行小程序
-- ============================================
