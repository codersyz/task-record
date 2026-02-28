-- 红包兑换系统数据库脚本

USE task_checkin;

-- 1. 创建红包商品表
CREATE TABLE IF NOT EXISTS redpacket_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '商品名称',
  points_cost INT NOT NULL COMMENT '所需积分',
  amount DECIMAL(10, 2) NOT NULL COMMENT '红包金额（元）',
  description VARCHAR(500) COMMENT '商品描述',
  stock INT DEFAULT -1 COMMENT '库存数量（-1表示无限）',
  status TINYINT DEFAULT 1 COMMENT '状态：1启用 0禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='红包商品表';

-- 2. 创建红包兑换订单表
CREATE TABLE IF NOT EXISTS redpacket_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '商品ID',
  points_cost INT NOT NULL COMMENT '消耗积分',
  amount DECIMAL(10, 2) NOT NULL COMMENT '红包金额',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending待处理 processing处理中 completed已完成 failed失败',
  wechat_order_no VARCHAR(100) COMMENT '微信订单号',
  wechat_payment_no VARCHAR(100) COMMENT '微信支付单号',
  failure_reason VARCHAR(500) COMMENT '失败原因',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES redpacket_products(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='红包兑换订单表';

-- 3. 插入默认商品
INSERT INTO redpacket_products (name, points_cost, amount, description) VALUES
('1元红包', 10, 1.00, '10积分兑换1元微信红包，直达零钱'),
('5元红包', 50, 5.00, '50积分兑换5元微信红包，直达零钱');

-- 4. 更新积分记录表，添加红包兑换类型
-- 如果需要，可以在 point_records 表的 type 字段中添加新类型：'redpacket_exchange'
