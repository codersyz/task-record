-- 添加历史最长连续打卡天数字段

ALTER TABLE users 
ADD COLUMN max_consecutive_days INT DEFAULT 0 COMMENT '历史最长连续打卡天数' 
AFTER consecutive_days;

-- 初始化现有用户的最长连续天数（使用当前连续天数）
UPDATE users 
SET max_consecutive_days = consecutive_days 
WHERE consecutive_days > 0;

-- 查看结果
SELECT id, nickname, consecutive_days, max_consecutive_days 
FROM users 
WHERE consecutive_days > 0 OR max_consecutive_days > 0;
