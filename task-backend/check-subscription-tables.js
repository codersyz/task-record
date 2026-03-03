/**
 * 检查订阅系统数据库表是否存在
 */

require('dotenv').config();
const db = require('./config/db');

async function checkTables() {
  console.log('检查订阅系统数据库表...\n');

  const tables = [
    'user_subscriptions',
    'reminder_settings',
    'message_logs'
  ];

  try {
    for (const table of tables) {
      try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table} 表存在，记录数: ${rows[0].count}`);
      } catch (error) {
        console.log(`❌ ${table} 表不存在`);
        console.log(`   错误: ${error.message}`);
      }
    }

    console.log('\n如果表不存在，请执行以下命令：');
    console.log('mysql -u root -p task_checkin < config/add-subscription-system.sql');
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();
