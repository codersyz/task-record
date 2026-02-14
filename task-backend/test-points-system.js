/**
 * 积分系统测试脚本
 * 用于验证数据库表结构是否正确创建
 */

const db = require('./config/db');

async function testPointsSystem() {
  console.log('=== 开始测试积分系统 ===\n');

  try {
    // 1. 检查 users 表是否有新字段
    console.log('1. 检查 users 表结构...');
    const [usersColumns] = await db.query('SHOW COLUMNS FROM users');
    const hasPoints = usersColumns.some(col => col.Field === 'points');
    const hasConsecutiveDays = usersColumns.some(col => col.Field === 'consecutive_days');
    const hasLastCheckinDate = usersColumns.some(col => col.Field === 'last_checkin_date');

    if (hasPoints && hasConsecutiveDays && hasLastCheckinDate) {
      console.log('✅ users 表字段已正确添加');
    } else {
      console.log('❌ users 表缺少字段:');
      if (!hasPoints) console.log('   - points');
      if (!hasConsecutiveDays) console.log('   - consecutive_days');
      if (!hasLastCheckinDate) console.log('   - last_checkin_date');
    }

    // 2. 检查 point_records 表
    console.log('\n2. 检查 point_records 表...');
    const [pointRecordsTables] = await db.query("SHOW TABLES LIKE 'point_records'");
    if (pointRecordsTables.length > 0) {
      console.log('✅ point_records 表已创建');
      const [pointRecordsColumns] = await db.query('SHOW COLUMNS FROM point_records');
      console.log('   字段列表:', pointRecordsColumns.map(col => col.Field).join(', '));
    } else {
      console.log('❌ point_records 表不存在');
    }

    // 3. 检查 daily_checkin_log 表
    console.log('\n3. 检查 daily_checkin_log 表...');
    const [dailyLogTables] = await db.query("SHOW TABLES LIKE 'daily_checkin_log'");
    if (dailyLogTables.length > 0) {
      console.log('✅ daily_checkin_log 表已创建');
      const [dailyLogColumns] = await db.query('SHOW COLUMNS FROM daily_checkin_log');
      console.log('   字段列表:', dailyLogColumns.map(col => col.Field).join(', '));
    } else {
      console.log('❌ daily_checkin_log 表不存在');
    }

    // 4. 测试查询用户积分
    console.log('\n4. 测试查询用户积分...');
    const [users] = await db.query('SELECT id, points, consecutive_days, last_checkin_date FROM users LIMIT 1');
    if (users.length > 0) {
      console.log('✅ 可以正常查询用户积分信息');
      console.log('   示例数据:', users[0]);
    } else {
      console.log('⚠️  数据库中暂无用户数据');
    }

    console.log('\n=== 测试完成 ===');
    console.log('\n如果所有检查都通过，说明积分系统数据库已正确配置！');
    console.log('如果有失败项，请执行: mysql -u root -p task_checkin < config/add-points-system.sql\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('\n请确保：');
    console.log('1. 数据库连接配置正确（.env 文件）');
    console.log('2. 已执行数据库更新脚本: config/add-points-system.sql');
    console.log('3. MySQL 服务正在运行\n');
  } finally {
    process.exit(0);
  }
}

// 运行测试
testPointsSystem();
