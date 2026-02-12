const db = require('../config/db');
const { checkAndUnlockAchievements } = require('./achievementController');

// 打卡
exports.checkin = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { taskId, note, images } = req.body;
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    await connection.beginTransaction();

    // 检查任务是否存在
    const [tasks] = await connection.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        code: 404,
        message: '任务不存在'
      });
    }

    // 检查今天是否已打卡
    const [existingCheckins] = await connection.query(
      'SELECT * FROM checkins WHERE task_id = ? AND checkin_date = ?',
      [taskId, today]
    );

    if (existingCheckins.length > 0) {
      await connection.rollback();
      // 使用 200 状态码，但业务 code 表示已打卡
      return res.json({
        code: 1001, // 自定义业务状态码：已打卡
        message: '今天已经打卡过了',
        data: {
          checkinDate: today,
          checkinId: existingCheckins[0].id
        }
      });
    }

    // 插入打卡记录
    await connection.query(
      'INSERT INTO checkins (task_id, user_id, checkin_date, note, images) VALUES (?, ?, ?, ?, ?)',
      [taskId, userId, today, note || '', JSON.stringify(images || [])]
    );

    // 检查是否连续打卡
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const [yesterdayCheckin] = await connection.query(
      'SELECT * FROM checkins WHERE task_id = ? AND checkin_date = ?',
      [taskId, yesterday]
    );

    let currentDays = tasks[0].current_days;
    if (yesterdayCheckin.length > 0) {
      currentDays += 1;
    } else {
      currentDays = 1;
    }

    // 更新任务统计
    const newTotalDays = tasks[0].total_days + 1;
    
    // 检查是否达到目标天数，如果达到则自动完成任务
    let newStatus = tasks[0].status;
    if (tasks[0].target_days > 0 && newTotalDays >= tasks[0].target_days) {
      newStatus = 0; // 0 表示已完成
      console.log(`任务 ${taskId} 已达到目标天数 ${tasks[0].target_days}，自动标记为已完成`);
    }
    
    await connection.query(
      'UPDATE tasks SET current_days = ?, total_days = ?, status = ? WHERE id = ?',
      [currentDays, newTotalDays, newStatus, taskId]
    );

    await connection.commit();

    // 检查并解锁成就
    const newAchievements = await checkAndUnlockAchievements(userId);

    res.json({
      code: 200,
      message: newStatus === 0 ? '打卡成功！恭喜完成目标🎉' : '打卡成功',
      data: { 
        currentDays,
        totalDays: newTotalDays,
        isCompleted: newStatus === 0,
        newAchievements: newAchievements.length > 0 ? newAchievements : undefined
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('打卡错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  } finally {
    connection.release();
  }
};

// 检查今天是否已打卡
exports.checkTodayCheckin = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    console.log('检查今日打卡 - taskId:', taskId, 'userId:', userId, 'today:', today);

    // 检查任务状态
    const [tasks] = await db.query(
      'SELECT status, target_days, total_days FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '任务不存在'
      });
    }

    const task = tasks[0];
    
    // 如果任务已完成，不允许打卡
    if (task.status === 0) {
      return res.json({
        code: 200,
        data: {
          hasChecked: true, // 已完成的任务视为已打卡
          checkinDate: today,
          checkin: null,
          isCompleted: true
        }
      });
    }

    // 检查今天是否已打卡
    const [checkins] = await db.query(
      'SELECT id, checkin_date, note FROM checkins WHERE task_id = ? AND user_id = ? AND checkin_date = ?',
      [taskId, userId, today]
    );

    const hasChecked = checkins.length > 0;
    
    console.log('今日是否已打卡:', hasChecked, '任务状态:', task.status);

    res.json({
      code: 200,
      data: {
        hasChecked,
        checkinDate: today,
        checkin: hasChecked ? checkins[0] : null,
        isCompleted: false
      }
    });

  } catch (error) {
    console.error('检查打卡状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 获取打卡记录
exports.getCheckinList = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;
    const { page = 1, pageSize = 20 } = req.query;

    console.log('获取打卡记录 - taskId:', taskId, 'userId:', userId, 'page:', page, 'pageSize:', pageSize);

    const offset = (page - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    console.log('SQL参数 - taskId:', taskId, 'userId:', userId, 'limit:', limit, 'offset:', offset);

    const [checkins] = await db.query(
      `SELECT * FROM checkins 
       WHERE task_id = ? AND user_id = ? 
       ORDER BY checkin_date DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(taskId), parseInt(userId), limit, offset]
    );

    console.log('查询到的打卡记录数量:', checkins.length);

    // 解析JSON字段，增加错误处理
    const formattedCheckins = checkins.map(item => {
      try {
        return {
          ...item,
          images: typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || [])
        };
      } catch (parseError) {
        console.error('解析 images 字段失败:', item.id, parseError);
        return {
          ...item,
          images: []
        };
      }
    });

    res.json({
      code: 200,
      data: formattedCheckins
    });

  } catch (error) {
    console.error('获取打卡记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 500,
      message: '服务器错误: ' + error.message
    });
  }
};

// 获取打卡日历（某月的打卡情况）
exports.getCheckinCalendar = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        code: 400,
        message: '缺少年份或月份参数'
      });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [checkins] = await db.query(
      `SELECT checkin_date FROM checkins 
       WHERE task_id = ? AND user_id = ? 
       AND checkin_date BETWEEN ? AND ?`,
      [taskId, userId, startDate, endDate]
    );

    const checkinDates = checkins.map(item => item.checkin_date);

    res.json({
      code: 200,
      data: checkinDates
    });

  } catch (error) {
    console.error('获取打卡日历错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 删除打卡记录
exports.deleteCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [result] = await db.query(
      'DELETE FROM checkins WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '打卡记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除打卡记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};


// 获取月度打卡日历数据
exports.getMonthlyCalendar = async (req, res) => {
  try {
    const userId = req.userId;
    const { year, month, taskId } = req.query;

    // 构建查询条件
    let query = `
      SELECT 
        c.checkin_date,
        c.note,
        t.id as task_id,
        t.title as task_title,
        t.category
      FROM checkins c
      JOIN tasks t ON c.task_id = t.id
      WHERE c.user_id = ?
        AND YEAR(c.checkin_date) = ?
        AND MONTH(c.checkin_date) = ?
    `;
    
    const params = [userId, year, month];
    
    // 如果指定了任务ID，只查询该任务的打卡记录
    if (taskId) {
      query += ' AND c.task_id = ?';
      params.push(taskId);
    }
    
    query += ' ORDER BY c.checkin_date DESC';

    const [checkins] = await db.query(query, params);

    // 按日期分组
    const calendarData = {};
    checkins.forEach(checkin => {
      // 直接使用 MySQL 返回的日期字符串，避免时区转换问题
      let date;
      if (checkin.checkin_date instanceof Date) {
        // 如果是 Date 对象，格式化为 YYYY-MM-DD（使用本地时区）
        const year = checkin.checkin_date.getFullYear();
        const month = String(checkin.checkin_date.getMonth() + 1).padStart(2, '0');
        const day = String(checkin.checkin_date.getDate()).padStart(2, '0');
        date = `${year}-${month}-${day}`;
      } else {
        // 如果已经是字符串，直接使用
        date = checkin.checkin_date;
      }
      
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push({
        taskId: checkin.task_id,
        taskTitle: checkin.task_title,
        category: checkin.category,
        note: checkin.note
      });
    });

    res.json({
      code: 200,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        checkins: calendarData,
        totalDays: Object.keys(calendarData).length
      }
    });

  } catch (error) {
    console.error('获取日历数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};
