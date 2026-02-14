/**
 * 测试积分 API 是否正常工作
 * 使用方法：node test-points-api.js
 */

const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = '你的测试token'; // 需要替换为真实的 token

async function testPointsAPI() {
  console.log('=== 测试积分系统 API ===\n');

  try {
    // 1. 测试获取用户积分信息
    console.log('1. 测试 GET /api/points');
    try {
      const res1 = await axios.get(`${BASE_URL}/points`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      console.log('✅ 成功:', res1.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    console.log('\n2. 测试 GET /api/points/records');
    try {
      const res2 = await axios.get(`${BASE_URL}/points/records`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        params: {
          page: 1,
          pageSize: 10
        }
      });
      console.log('✅ 成功:', res2.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    console.log('\n3. 测试 GET /api/points/ranking');
    try {
      const res3 = await axios.get(`${BASE_URL}/points/ranking`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        params: {
          limit: 10
        }
      });
      console.log('✅ 成功:', res3.data);
    } catch (error) {
      console.log('❌ 失败:', error.response?.data || error.message);
    }

    console.log('\n=== 测试完成 ===');
    console.log('\n提示：');
    console.log('1. 如果提示 401 错误，请替换脚本中的 TEST_TOKEN');
    console.log('2. 如果提示连接失败，请确保后端服务已启动');
    console.log('3. 如果提示字段不存在，请执行数据库更新脚本\n');

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 运行测试
testPointsAPI();
