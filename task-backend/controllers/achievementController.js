const db = require('../config/db');

// 成就定义
const ACHIEVEMENTS = {
    FIRST_CHECKIN: { type: 'first_checkin', level: 1, name: '新手上路', desc: '完成第1次打卡', icon: '🌱' },
    STREAK_7: { type: 'streak', level: 7, name: '初露锋芒', desc: '连续打卡7天', icon: '🔥' },
    STREAK_30: { type: 'streak', level: 30, name: '坚持不懈', desc: '连续打卡30天', icon: '⭐' },
    STREAK_100: { type: 'streak', level: 100, name: '习惯大师', desc: '连续打卡100天', icon: '💎' },
    TASK_10: { type: 'task_complete', level: 10, name: '任务达人', desc: '完成10个任务', icon: '🏆' },
    TASK_50: { type: 'task_complete', level: 50, name: '任务专家', desc: '完成50个任务', icon: '👑' },
    CHECKIN_100: { type: 'total_checkin', level: 100, name: '打卡狂人', desc: '累计打卡100次', icon: '🎯' },
    CHECKIN_365: { type: 'total_checkin', level: 365, name: '年度冠军', desc: '累计打卡365次', icon: '🌟' },
    MULTI_TASK: { type: 'multi_task', level: 5, name: '全能选手', desc: '同时进行5个任务', icon: '🎨' }
};

// 获取用户成就列表
exports.getUserAchievements = async (req, res) => {
    try {
        const userId = req.userId;

        // 获取已解锁的成就
        const [unlocked] = await db.query(
            'SELECT achievement_type, achievement_level, unlocked_at FROM achievements WHERE user_id = ?',
            [userId]
        );

        // 获取用户统计数据
        const stats = await getUserStats(userId);

        // 构建成就列表
        const achievements = Object.values(ACHIEVEMENTS).map(achievement => {
            const isUnlocked = unlocked.some(
                u => u.achievement_type === achievement.type && u.achievement_level === achievement.level
            );

            const unlockedItem = unlocked.find(
                u => u.achievement_type === achievement.type && u.achievement_level === achievement.level
            );

            return {
                ...achievement,
                unlocked: isUnlocked,
                unlockedAt: unlockedItem ? unlockedItem.unlocked_at : null,
                progress: calculateProgress(achievement, stats)
            };
        });

        res.json({
            code: 200,
            data: {
                achievements,
                stats,
                unlockedCount: unlocked.length,
                totalCount: Object.keys(ACHIEVEMENTS).length
            }
        });
    } catch (error) {
        console.error('获取成就列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误'
        });
    }
};

// 检查并解锁成就
exports.checkAndUnlockAchievements = async (userId) => {
    try {
        const stats = await getUserStats(userId);
        const newAchievements = [];

        // 检查各类成就
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            const shouldUnlock = checkAchievementCondition(achievement, stats);

            if (shouldUnlock) {
                const isUnlocked = await isAchievementUnlocked(userId, achievement.type, achievement.level);

                if (!isUnlocked) {
                    await unlockAchievement(userId, achievement.type, achievement.level);
                    newAchievements.push(achievement);
                }
            }
        }

        return newAchievements;
    } catch (error) {
        console.error('检查成就失败:', error);
        return [];
    }
};

// 获取用户统计数据
async function getUserStats(userId) {
    // 总打卡次数
    const [checkinCount] = await db.query(
        'SELECT COUNT(*) as count FROM checkins WHERE user_id = ?',
        [userId]
    );

    // 完成的任务数
    const [completedTasks] = await db.query(
        'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 0',
        [userId]
    );

    // 当前进行中的任务数
    const [activeTasks] = await db.query(
        'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 1',
        [userId]
    );

    // 最长连续打卡天数（从所有任务中取最大值）
    const [maxStreak] = await db.query(
        'SELECT MAX(current_days) as max_streak FROM tasks WHERE user_id = ?',
        [userId]
    );

    return {
        totalCheckins: checkinCount[0].count,
        completedTasks: completedTasks[0].count,
        activeTasks: activeTasks[0].count,
        maxStreak: maxStreak[0].max_streak || 0
    };
}

// 检查成就条件
function checkAchievementCondition(achievement, stats) {
    switch (achievement.type) {
        case 'first_checkin':
            return stats.totalCheckins >= 1;
        case 'streak':
            return stats.maxStreak >= achievement.level;
        case 'task_complete':
            return stats.completedTasks >= achievement.level;
        case 'total_checkin':
            return stats.totalCheckins >= achievement.level;
        case 'multi_task':
            return stats.activeTasks >= achievement.level;
        default:
            return false;
    }
}

// 计算进度
function calculateProgress(achievement, stats) {
    let current = 0;
    let target = achievement.level;

    switch (achievement.type) {
        case 'first_checkin':
            current = Math.min(stats.totalCheckins, 1);
            target = 1;
            break;
        case 'streak':
            current = Math.min(stats.maxStreak, achievement.level);
            break;
        case 'task_complete':
            current = Math.min(stats.completedTasks, achievement.level);
            break;
        case 'total_checkin':
            current = Math.min(stats.totalCheckins, achievement.level);
            break;
        case 'multi_task':
            current = Math.min(stats.activeTasks, achievement.level);
            break;
    }

    return {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100)
    };
}

// 检查成就是否已解锁
async function isAchievementUnlocked(userId, type, level) {
    const [result] = await db.query(
        'SELECT id FROM achievements WHERE user_id = ? AND achievement_type = ? AND achievement_level = ?',
        [userId, type, level]
    );
    return result.length > 0;
}

// 解锁成就
async function unlockAchievement(userId, type, level) {
    await db.query(
        'INSERT INTO achievements (user_id, achievement_type, achievement_level) VALUES (?, ?, ?)',
        [userId, type, level]
    );
}

module.exports = exports;
