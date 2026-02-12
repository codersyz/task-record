-- 创建数据库
CREATE DATABASE IF NOT EXISTS task_checkin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE task_checkin;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 任务表
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

-- 打卡记录表
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

-- 排行榜视图（可选）
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

-- 成就表
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
