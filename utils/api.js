// api/plans.js
import axios from '@/utils/axios.js';

/**
 * 获取用户的行动计划数据
 * @param {String} userId - 用户的唯一标识
 * @returns {Promise<Object>} - 返回计划数据
 */
export function getPlanData(userId) {
  return axios.get(`/api/plans/${userId}`);
}

/**
 * 保存用户的行动计划数据
 * @param {Object} planData - 计划数据
 * @returns {Promise<Object>} - 返回保存结果
 */
export function saveUserPlan(planData) {
  return axios.post('/api/plans/save', planData);
}


/**
 * 获取ai行为
 * @param {Object}  - 目标数据
 * @returns {Promise<Object>} - 返回保存结果
 */
export function getPlan(message) {
  return axios.post('/api/ask', message);
}
