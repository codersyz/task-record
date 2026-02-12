-- 为 tasks 表添加 category 字段
USE task_checkin;

-- 添加 category 字段
ALTER TABLE tasks 
ADD COLUMN category VARCHAR(50) DEFAULT 'other' COMMENT '任务分类: study学习 sport运动 read阅读 health健康 work工作 other其他'
AFTER description;

-- 为 category 字段添加索引
ALTER TABLE tasks ADD INDEX idx_category (category);

-- 验证字段是否添加成功
DESCRIBE tasks;
