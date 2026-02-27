module.exports = {
  apps: [{
    name: 'task-backend',
    script: './app.js',
    
    // 实例数量
    instances: 1,
    
    // 执行模式：cluster（集群）或 fork（单进程）
    exec_mode: 'fork',
    
    // 监听文件变化自动重启（生产环境建议关闭）
    watch: false,
    
    // 忽略监听的文件
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads',
      '.git'
    ],
    
    // 最大内存限制，超过自动重启
    max_memory_restart: '500M',
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    
    // 日志配置
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // 合并日志
    merge_logs: true,
    
    // 自动重启配置
    autorestart: true,
    
    // 最小运行时间，小于此时间重启视为异常
    min_uptime: '10s',
    
    // 异常重启次数限制
    max_restarts: 10,
    
    // 重启延迟
    restart_delay: 4000,
    
    // 进程启动等待时间
    listen_timeout: 3003,
    
    // 优雅关闭超时时间
    kill_timeout: 5000
  }]
};
