-- 修复数据库中的临时头像路径
-- 将所有 wxfile:// 和 http://tmp/ 开头的头像路径重置为默认头像

-- 查看需要修复的记录
SELECT id, nickname, avatar_url 
FROM users 
WHERE avatar_url LIKE 'wxfile://%' OR avatar_url LIKE 'http://tmp/%';

-- 执行修复（取消下面的注释来执行）
-- UPDATE users 
-- SET avatar_url = '/static/logo.webp' 
-- WHERE avatar_url LIKE 'wxfile://%' OR avatar_url LIKE 'http://tmp/%';

-- 验证修复结果
-- SELECT id, nickname, avatar_url 
-- FROM users 
-- WHERE avatar_url = '/static/logo.webp';
