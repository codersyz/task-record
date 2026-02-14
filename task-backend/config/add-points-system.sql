-- 积分系统数据库更新脚本

USE task_checkin;

-- 1. 给 users 表添加积分字段
ALTER TABLE users 
ADD COLUMN points INT DEFAULT 0 COMMENT '用户积分',
ADD COLUMN consecutive_days INT DEFAULT 0 COMMENT '连续打卡天数',
ADD COLUMN last_checkin_date DATE COMMENT '最后打卡日期';

-- 2. 创建积分记录表
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

-- 3. 创建每日打卡记录表（用于判断是否是当天首次打卡）
CREATE TABLE IF NOT EXISTS daily_checkin_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  checkin_date DATE NOT NULL COMMENT '打卡日期',
  first_checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '首次打卡时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_date (user_id, checkin_date),
  INDEX idx_checkin_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日打卡日志表';
