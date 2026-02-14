const db = require('../config/db');

// 积分类型常量
const POINT_TYPES = {
  DAILY_FIRST: 'daily_first',      // 每日首次打卡
  STREAK_7: 'streak_7',             // 连续7天
  STREAK_30: 'streak_30'            // 连续30天
};

// 积分奖励配置
const POINT_REWARDS = {
  DAILY_FIRST: 1,                   // 每日首次打卡
  STREAK_7: 5,                      // 连续7天奖励
  STREAK_30: 20                     // 连续30天奖励
};

/**
 * 处理打卡积分逻辑
 * @param {number} userId - 用户ID
 * @param {number} taskId - 任务ID
 * @param {number} checkinId - 打卡记录ID
 * @returns {Object} 积分奖励信息
 */
exports.handleCheckinPoints = async (userId, taskId, checkinId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const today = new Date().toISOString().split('T')[0];
    const pointsEarned = {
      total: 0,
      daily: 0,
      streak7: 0,
      streak30: 0,
      consecutiveDays: 0
    };
    
    // 1. 检查今天是否已经打卡过（是否是首次打卡）
    const [dailyLog] = await connection.query(
      'SELECT id FROM daily_checkin_log WHERE user_id = ? AND checkin_date = ?',
      [userId, today]
    );
    
    const isFirstCheckinToday = dailyLog.length === 0;
    
    if (!isFirstCheckinToday) {
      // 不是今天首次打卡，不给积分
      await connection.commit();
      return pointsEarned;
    }
    
    // 2. 记录今日首次打卡
    await connection.query(
      'INSERT INTO daily_checkin_log (user_id, checkin_date) VALUES (?, ?)',
      [userId, today]
    );
    
    // 3. 获取用户当前信息
    const [users] = await connection.query(
      'SELECT points, consecutive_days, last_checkin_date FROM users WHERE id = ?',
      [userId]
    );
    
    const user = users[0];
    let newConsecutiveDays = 1;
    
    // 4. 计算连续打卡天数
    if (user.last_checkin_date) {
      const lastDate = new Date(user.last_checkin_date);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // 连续打卡
        newConsecutiveDays = user.consecutive_days + 1;
      } else if (diffDays === 0) {
        // 同一天（理论上不会发生，因为已经检查过了）
        newConsecutiveDays = user.consecutive_days;
      } else {
        // 中断了，重新开始
        newConsecutiveDays = 1;
      }
    }
    
    pointsEarned.consecutiveDays = newConsecutiveDays;
    
    // 5. 计算积分奖励
    // 5.1 每日首次打卡积分
    pointsEarned.daily = POINT_REWARDS.DAILY_FIRST;
    pointsEarned.total += pointsEarned.daily;
    
    await connection.query(
      'INSERT INTO point_records (user_id, points, type, description, related_id) VALUES (?, ?, ?, ?, ?)',
      [userId, pointsEarned.daily, POINT_TYPES.DAILY_FIRST, '每日首次打卡', checkinId]
    );
    
    // 5.2 连续打卡奖励
    // 检查是否触发 7 天奖励
    if (newConsecutiveDays > 0 && newConsecutiveDays % 7 === 0) {
      pointsEarned.streak7 = POINT_REWARDS.STREAK_7;
      pointsEarned.total += pointsEarned.streak7;
      
      await connection.query(
        'INSERT INTO point_records (user_id, points, type, description, related_id) VALUES (?, ?, ?, ?, ?)',
        [userId, pointsEarned.streak7, POINT_TYPES.STREAK_7, `连续打卡${newConsecutiveDays}天奖励`, checkinId]
      );
    }
    
    // 检查是否触发 30 天奖励
    if (newConsecutiveDays > 0 && newConsecutiveDays % 30 === 0) {
      pointsEarned.streak30 = POINT_REWARDS.STREAK_30;
      pointsEarned.total += pointsEarned.streak30;
      
      await connection.query(
        'INSERT INTO point_records (user_id, points, type, description, related_id) VALUES (?, ?, ?, ?, ?)',
        [userId, pointsEarned.streak30, POINT_TYPES.STREAK_30, `连续打卡${newConsecutiveDays}天奖励`, checkinId]
      );
    }
    
    // 6. 更新用户积分和连续天数
    const newPoints = user.points + pointsEarned.total;
    await connection.query(
      'UPDATE users SET points = ?, consecutive_days = ?, last_checkin_date = ? WHERE id = ?',
      [newPoints, newConsecutiveDays, today, userId]
    );
    
    await connection.commit();
    
    return pointsEarned;
    
  } catch (error) {
    await connection.rollback();
    console.error('处理积分失败:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 获取用户积分信息
 */
exports.getUserPoints = async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log('=== 获取用户积分信息 ===');
    console.log('userId:', userId);
    
    const [users] = await db.query(
      'SELECT points, consecutive_days, last_checkin_date FROM users WHERE id = ?',
      [userId]
    );
    
    console.log('查询结果:', users);
    
    if (users.length === 0) {
      console.log('用户不存在');
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    const result = {
      points: users[0].points || 0,
      consecutiveDays: users[0].consecutive_days || 0,
      lastCheckinDate: users[0].last_checkin_date
    };
    
    console.log('返回数据:', result);
    
    res.json({
      code: 200,
      data: result
    });
    
  } catch (error) {
    console.error('获取积分信息失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 500,
      message: '服务器错误: ' + error.message
    });
  }
};

/**
 * 获取积分记录
 */
exports.getPointRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, pageSize = 20 } = req.query;
    
    const offset = (page - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    
    // 关联查询，获取任务信息和打卡信息
    const [records] = await db.query(
      `SELECT 
        pr.id,
        pr.points,
        pr.type,
        pr.description,
        pr.related_id,
        pr.created_at,
        t.title as task_title,
        t.category as task_category,
        c.checkin_date,
        c.note as checkin_note
       FROM point_records pr
       LEFT JOIN checkins c ON pr.related_id = c.id AND pr.type IN ('daily_first', 'streak_7', 'streak_30')
       LEFT JOIN tasks t ON c.task_id = t.id
       WHERE pr.user_id = ? 
       ORDER BY pr.created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // 获取总数
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM point_records WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      code: 200,
      data: {
        records,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: limit
      }
    });
    
  } catch (error) {
    console.error('获取积分记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 获取积分排行榜
 */
exports.getPointsRanking = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const userId = req.userId;
    
    // 获取排行榜
    const [ranking] = await db.query(
      `SELECT 
        u.id,
        u.nickname,
        u.avatar_url,
        u.points,
        u.consecutive_days
       FROM users u
       WHERE u.points > 0
       ORDER BY u.points DESC, u.consecutive_days DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    // 获取当前用户排名
    const [userRank] = await db.query(
      `SELECT COUNT(*) + 1 as rank
       FROM users
       WHERE points > (SELECT points FROM users WHERE id = ?)`,
      [userId]
    );
    
    res.json({
      code: 200,
      data: {
        ranking,
        myRank: userRank[0].rank
      }
    });
    
  } catch (error) {
    console.error('获取排行榜失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

module.exports = exports;
