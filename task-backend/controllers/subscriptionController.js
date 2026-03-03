const db = require('../config/db');
const axios = require('axios');

// 获取微信 access_token（带缓存）
let accessTokenCache = {
  token: null,
  expiresAt: 0
};

async function getAccessToken() {
  // 如果缓存有效，直接返回
  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  try {
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token`,
      {
        params: {
          grant_type: 'client_credential',
          appid: process.env.WECHAT_APPID,
          secret: process.env.WECHAT_SECRET
        }
      }
    );

    if (response.data.access_token) {
      accessTokenCache.token = response.data.access_token;
      // 提前5分钟过期，避免边界问题
      accessTokenCache.expiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
      return accessTokenCache.token;
    }

    throw new Error('获取access_token失败');
  } catch (error) {
    console.error('获取access_token错误:', error.message);
    throw error;
  }
}

// 记录订阅
exports.recordSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { templateId, templateType } = req.body;

    if (!templateId || !templateType) {
      return res.status(400).json({
        code: 400,
        message: '缺少必需参数'
      });
    }

    // 插入订阅记录
    await db.query(
      'INSERT INTO user_subscriptions (user_id, template_id, template_type) VALUES (?, ?, ?)',
      [userId, templateId, templateType]
    );

    res.json({
      code: 200,
      message: '订阅成功'
    });
  } catch (error) {
    console.error('记录订阅错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 获取用户提醒设置
exports.getReminderSettings = async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await db.query(
      'SELECT * FROM reminder_settings WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      // 如果没有设置，返回默认值
      return res.json({
        code: 200,
        data: {
          daily_reminder: 1,
          reminder_time: '09:00:00',
          streak_warning: 1,
          achievement_notify: 1
        }
      });
    }

    res.json({
      code: 200,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取提醒设置错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 更新提醒设置
exports.updateReminderSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { daily_reminder, reminder_time, streak_warning, achievement_notify } = req.body;

    // 检查是否已有设置
    const [existing] = await db.query(
      'SELECT id FROM reminder_settings WHERE user_id = ?',
      [userId]
    );

    if (existing.length === 0) {
      // 插入新设置
      await db.query(
        `INSERT INTO reminder_settings 
        (user_id, daily_reminder, reminder_time, streak_warning, achievement_notify) 
        VALUES (?, ?, ?, ?, ?)`,
        [userId, daily_reminder, reminder_time, streak_warning, achievement_notify]
      );
    } else {
      // 更新现有设置
      await db.query(
        `UPDATE reminder_settings 
        SET daily_reminder = ?, reminder_time = ?, streak_warning = ?, achievement_notify = ?
        WHERE user_id = ?`,
        [daily_reminder, reminder_time, streak_warning, achievement_notify, userId]
      );
    }

    res.json({
      code: 200,
      message: '设置已更新'
    });
  } catch (error) {
    console.error('更新提醒设置错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// 发送订阅消息
async function sendSubscribeMessage(openid, templateId, data, page = 'pages/index/index') {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      {
        touser: openid,
        template_id: templateId,
        page: page,
        data: data,
        miniprogram_state: process.env.NODE_ENV === 'production' ? 'formal' : 'developer'
      }
    );

    return response.data;
  } catch (error) {
    console.error('发送订阅消息错误:', error.message);
    throw error;
  }
}

// 发送每日打卡提醒
exports.sendDailyReminders = async () => {
  try {
    console.log('开始发送每日打卡提醒...');

    // 获取当前时间（小时:分钟）
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    // 查询需要发送提醒的用户
    const [users] = await db.query(
      `SELECT DISTINCT 
        u.id, u.openid, u.nickname,
        rs.reminder_time,
        s.template_id
      FROM users u
      INNER JOIN reminder_settings rs ON u.id = rs.user_id
      INNER JOIN user_subscriptions s ON u.id = s.user_id
      WHERE rs.daily_reminder = 1
        AND s.template_type = 'daily_reminder'
        AND s.status = 1
        AND TIME(rs.reminder_time) = ?
        AND u.openid IS NOT NULL
        AND u.openid != ''`,
      [currentTime]
    );

    console.log(`找到 ${users.length} 个用户需要发送提醒`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        // 检查今天是否已打卡
        const [checkins] = await db.query(
          `SELECT COUNT(*) as count FROM checkins 
          WHERE user_id = ? AND DATE(checkin_date) = CURDATE()`,
          [user.id]
        );

        const hasCheckedToday = checkins[0].count > 0;

        // 如果今天已打卡，跳过提醒（可选）
        // if (hasCheckedToday) {
        //   console.log(`用户 ${user.nickname} 今天已打卡，跳过提醒`);
        //   continue;
        // }

        // 获取用户的进行中任务数
        const [tasks] = await db.query(
          'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 1',
          [user.id]
        );

        const taskCount = tasks[0].count;

        // 根据打卡状态设置消息内容
        const checkinStatus = hasCheckedToday ? '已打卡' : '待打卡';
        const tipMessage = hasCheckedToday 
          ? `今日已完成打卡，继续保持` 
          : `您有${taskCount}个任务待完成`;

        // 发送订阅消息
        // 你的模板字段：thing9(打卡类型) + phrase4(打卡状态) + thing6(温馨提示)
        const messageData = {
          thing9: { value: '每日任务打卡' },
          phrase4: { value: checkinStatus },
          thing6: { value: tipMessage }
        };

        // 发送订阅消息
        const result = await sendSubscribeMessage(
          user.openid,
          user.template_id,
          messageData
        );

        if (result.errcode === 0) {
          successCount++;
          console.log(`成功发送提醒给用户: ${user.nickname}`);

          // 标记订阅已使用
          await db.query(
            'UPDATE user_subscriptions SET status = 0, used_at = NOW() WHERE user_id = ? AND template_id = ?',
            [user.id, user.template_id]
          );

          // 记录发送日志
          await db.query(
            'INSERT INTO message_logs (user_id, template_type, template_id, openid, status) VALUES (?, ?, ?, ?, ?)',
            [user.id, 'daily_reminder', user.template_id, user.openid, 1]
          );
        } else {
          failCount++;
          console.error(`发送提醒失败: ${user.nickname}, 错误: ${result.errmsg}`);

          // 记录失败日志
          await db.query(
            'INSERT INTO message_logs (user_id, template_type, template_id, openid, status, error_msg) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, 'daily_reminder', user.template_id, user.openid, 0, result.errmsg]
          );
        }
      } catch (error) {
        failCount++;
        console.error(`处理用户 ${user.nickname} 时出错:`, error.message);
      }
    }

    console.log(`每日提醒发送完成: 成功 ${successCount}, 失败 ${failCount}`);
    return { successCount, failCount };
  } catch (error) {
    console.error('发送每日提醒错误:', error);
    throw error;
  }
};

// 获取订阅状态
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { templateType } = req.query;

    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM user_subscriptions 
      WHERE user_id = ? AND template_type = ? AND status = 1`,
      [userId, templateType]
    );

    res.json({
      code: 200,
      data: {
        hasSubscription: rows[0].count > 0
      }
    });
  } catch (error) {
    console.error('获取订阅状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

module.exports = exports;
