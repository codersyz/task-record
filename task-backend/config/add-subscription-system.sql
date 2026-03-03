-- 添加订阅消息系统

-- 用户订阅记录表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  template_id VARCHAR(100) NOT NULL COMMENT '模板ID',
  template_type VARCHAR(50) NOT NULL COMMENT '模板类型: daily_reminder, streak_warning, achievement',
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '订阅时间',
  status TINYINT DEFAULT 1 COMMENT '状态: 1有效 0已使用',
  used_at DATETIME NULL COMMENT '使用时间',
  INDEX idx_user_template (user_id, template_id),
  INDEX idx_user_type_status (user_id, template_type, status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户订阅记录表';

-- 提醒设置表
CREATE TABLE IF NOT EXISTS reminder_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  daily_reminder TINYINT DEFAULT 1 COMMENT '每日打卡提醒: 1开启 0关闭',
  reminder_time TIME DEFAULT '09:00:00' COMMENT '提醒时间',
  streak_warning TINYINT DEFAULT 1 COMMENT '连续打卡中断预警: 1开启 0关闭',
  achievement_notify TINYINT DEFAULT 1 COMMENT '成就解锁通知: 1开启 0关闭',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提醒设置表';

-- 消息发送日志表
CREATE TABLE IF NOT EXISTS message_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  template_type VARCHAR(50) NOT NULL COMMENT '模板类型',
  template_id VARCHAR(100) NOT NULL COMMENT '模板ID',
  openid VARCHAR(100) NOT NULL COMMENT '用户openid',
  status TINYINT NOT NULL COMMENT '发送状态: 1成功 0失败',
  error_msg TEXT NULL COMMENT '错误信息',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  INDEX idx_user_sent (user_id, sent_at),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息发送日志表';
