USE task_checkin;

ALTER TABLE tasks ADD COLUMN category VARCHAR(50) DEFAULT 'other' COMMENT '任务分类' AFTER description;
ALTER TABLE tasks ADD INDEX idx_category (category);
