const db = require('../config/db');

// 创建任务
exports.createTask = async (req, res) => {
  try {
    const { title, description, targetDays, category } = req.body;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({
        code: 400,
        message: '任务标题不能为空'
      });
    }

    // 验证分类
    const validCategories = ['study', 'sport', 'read', 'health', 'work', 'other'];
    const taskCategory = validCategories.includes(category) ? category : 'other';

    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description, target_days, category) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description || '', targetDays || 0, taskCategory]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: { taskId: result.insertId }
    });

  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 获取任务列表
exports.getTaskList = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    console.log('获取任务列表 - userId:', userId, 'status:', status);

    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    // 只有当 status 是有效值时才添加条件
    if (status !== undefined && status !== 'undefined' && status !== null && status !== '') {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }

    sql += ' ORDER BY created_at DESC';

    const [tasks] = await db.query(sql, params);
    
    console.log('查询到的任务数量:', tasks.length);
    console.log('任务列表:', tasks);

    res.json({
      code: 200,
      data: tasks
    });

  } catch (error) {
    console.error('获取任务列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 获取任务详情
exports.getTaskDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '任务不存在'
      });
    }

    res.json({
      code: 200,
      data: tasks[0]
    });

  } catch (error) {
    console.error('获取任务详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, description, targetDays, status } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (targetDays !== undefined) {
      updates.push('target_days = ?');
      params.push(targetDays);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有要更新的字段'
      });
    }

    params.push(id, userId);

    const [result] = await db.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '任务不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });

  } catch (error) {
    console.error('更新任务错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('删除任务 - taskId:', id, 'userId:', userId);

    // 先查询打卡记录数量
    const [checkins] = await db.query(
      'SELECT COUNT(*) as count FROM checkins WHERE task_id = ? AND user_id = ?',
      [id, userId]
    );

    const checkinCount = checkins[0].count;
    console.log('该任务的打卡记录数:', checkinCount);

    // 删除任务（会自动级联删除打卡记录）
    const [result] = await db.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '任务不存在'
      });
    }

    console.log('任务删除成功，已自动删除', checkinCount, '条打卡记录');

    res.json({
      code: 200,
      message: '删除成功',
      data: {
        deletedCheckins: checkinCount
      }
    });

  } catch (error) {
    console.error('删除任务错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};
