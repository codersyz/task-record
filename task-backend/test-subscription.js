/**
 * 订阅消息系统测试脚本
 * 用于测试订阅消息功能是否正常工作
 */

require('dotenv').config();
const db = require('./config/db');

async function testSubscriptionSystem() {
  console.log('=== 订阅消息系统测试 ===\n');

  try {
    // 1. 检查数据库表是否存在
    console.log('1. 检查数据库表...');
    
    const tables = ['user_subscriptions', 'reminder_settings', 'message_logs'];
    for (const table of tables) {
      try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✅ ${table} 表存在，记录数: ${rows[0].count}`);
      } catch (error) {
        console.log(`   ❌ ${table} 表不存在或无法访问`);
        console.log(`   请执行: mysql -u root -p task_checkin < config/add-subscription-system.sql`);
        return;
      }
    }

    // 2. 检查环境变量
    console.log('\n2. 检查环境变量...');
    const requiredEnvs = ['WECHAT_APPID', 'WECHAT_SECRET'];
    let envOk = true;
    
    for (const env of requiredEnvs) {
      if (process.env[env]) {
        console.log(`   ✅ ${env}: ${process.env[env].substring(0, 10)}...`);
      } else {
        console.log(`   ❌ ${env}: 未配置`);
        envOk = false;
      }
    }

    if (!envOk) {
      console.log('   请在 .env 文件中配置微信小程序的 AppID 和 Secret');
      return;
    }

    // 3. 检查用户数据
    console.log('\n3. 检查用户数据...');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users WHERE openid IS NOT NULL AND openid != ""');
    console.log(`   用户总数: ${users[0].count}`);

    if (users[0].count === 0) {
      console.log('   ⚠️  没有用户数据，请先在小程序中登录');
    }

    // 4. 检查订阅记录
    console.log('\n4. 检查订阅记录...');
    const [subscriptions] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as used
      FROM user_subscriptions
    `);
    
    console.log(`   总订阅数: ${subscriptions[0].total}`);
    console.log(`   有效订阅: ${subscriptions[0].active}`);
    console.log(`   已使用: ${subscriptions[0].used}`);

    // 5. 检查提醒设置
    console.log('\n5. 检查提醒设置...');
    const [settings] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN daily_reminder = 1 THEN 1 ELSE 0 END) as enabled
      FROM reminder_settings
    `);
    
    console.log(`   设置总数: ${settings[0].total}`);
    console.log(`   已开启提醒: ${settings[0].enabled}`);

    // 6. 检查消息发送日志
    console.log('\n6. 检查消息发送日志...');
    const [logs] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as failed
      FROM message_logs
    `);
    
    console.log(`   发送总数: ${logs[0].total}`);
    console.log(`   成功: ${logs[0].success}`);
    console.log(`   失败: ${logs[0].failed}`);

    // 7. 显示最近的发送记录
    if (logs[0].total > 0) {
      console.log('\n7. 最近的发送记录:');
      const [recentLogs] = await db.query(`
        SELECT 
          u.nickname,
          m.template_type,
          m.status,
          m.sent_at,
          m.error_msg
        FROM message_logs m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.sent_at DESC
        LIMIT 5
      `);

      recentLogs.forEach(log => {
        const status = log.status === 1 ? '✅ 成功' : '❌ 失败';
        console.log(`   ${status} | ${log.nickname} | ${log.template_type} | ${log.sent_at}`);
        if (log.error_msg) {
          console.log(`      错误: ${log.error_msg}`);
        }
      });
    }

    // 8. 测试定时任务
    console.log('\n8. 测试定时任务...');
    console.log('   定时任务配置: 每分钟执行一次 (* * * * *)');
    console.log('   提示: 启动后端服务后，定时任务会自动运行');
    console.log('   查看日志: pm2 logs task-backend');

    // 9. 显示待发送的提醒
    console.log('\n9. 当前待发送的提醒:');
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    
    const [pending] = await db.query(`
      SELECT 
        u.nickname,
        rs.reminder_time,
        s.template_id
      FROM users u
      INNER JOIN reminder_settings rs ON u.id = rs.user_id
      INNER JOIN user_subscriptions s ON u.id = s.user_id
      WHERE rs.daily_reminder = 1
        AND s.template_type = 'daily_reminder'
        AND s.status = 1
        AND u.openid IS NOT NULL
        AND u.openid != ''
      LIMIT 10
    `);

    if (pending.length > 0) {
      console.log(`   找到 ${pending.length} 个用户已设置提醒:`);
      pending.forEach(p => {
        console.log(`   - ${p.nickname}: ${p.reminder_time}`);
      });
      console.log(`\n   当前时间: ${currentTime}`);
      console.log(`   提示: 当提醒时间到达时，系统会自动发送消息`);
    } else {
      console.log('   ⚠️  暂无用户设置提醒');
      console.log('   请在小程序中进入"提醒设置"页面进行配置');
    }

    console.log('\n=== 测试完成 ===\n');
    console.log('📝 下一步操作:');
    console.log('1. 在小程序中进入"提醒设置"页面');
    console.log('2. 开启"每日打卡提醒"并设置时间');
    console.log('3. 点击"立即订阅"按钮授权');
    console.log('4. 等待设定的时间，查看是否收到提醒');
    console.log('5. 查看后端日志: pm2 logs task-backend\n');

  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    process.exit(0);
  }
}

// 运行测试
testSubscriptionSystem();
