// api/plans.js
import axios from '@/utils/axios.js';

// /**
//  * 获取用户的行动计划数据
//  * @param {String} userId - 用户的唯一标识
//  * @returns {Promise<Object>} - 返回计划数据
//  */
// export function getPlanData(userId) {
//   return axios.get(`/api/plans/${userId}`);
// }


/**
 * 获取用户的行动计划数据
 * @param {String} email - 用户的邮箱
 * @returns {Promise<Object>} - 返回计划数据
 */
export function getPlanData(email) {
  return axios.get(`/api/plans/${email}`);
}

/**
 * 保存用户的行动计划数据
 * @param {String} email - 用户的邮箱
 * @param {Object} planData - 计划数据
 * @returns {Promise<Object>} - 返回保存结果
 */
export function saveUserPlan(email, planData) {
  return axios.post(`/api/plans/${email}`, planData);
}


// /**
//  * 保存用户的行动计划数据
//  * @param {Object} planData - 计划数据
//  * @returns {Promise<Object>} - 返回保存结果
//  */
// export function saveUserPlan(planData) {
//   return axios.post('/api/plans/save', planData);
// }


/**
 * 获取ai行为
 * @param {Object}  - 目标数据
 * @returns {Promise<Object>} - 返回保存结果
 */
export function getPlan(message) {
  return axios.post('/api/ask', message);
}

/**
 * 获取用户的行为数据
 * @param {String} email - 用户的邮箱
 * @returns {Promise<Object>} - 返回用户行为数据
 */
export function getUserBehaviors(email) {
  return axios.get(`/api/behaviors?email=${email}`);
}

/**
 * 保存锚点列表
 * @param {String} email - 用户邮箱
 * @param {Array} anchorList - 锚点列表数据
 * @returns {Promise<Object>} - 返回保存结果
 */
export function saveAnchorList(email, anchorList) {
  return axios.post(`/api/anchors`, {
    email,
    anchorList: anchorList.map(anchor => ({
      name: anchor.name,
      hour: anchor.hour,
      minute: anchor.minute
    }))
  });
}

/**
 * 获取锚点列表
 * @param {String} email - 用户邮箱
 * @returns {Promise<Object>} - 返回锚点列表数据
 */
export function getAnchorList(email) {
  return axios.get(`/api/anchors?email=${email}`);
}

/**
 * 获取用户的行为列表
 * @param {String} email - 用户的邮箱
 * @param {String} anchorName - 锚点名称
 * @returns {Promise<Object>} - 返回行为列表数据
 */
export function getBehaviorList(email, anchorName) {
  return axios.get(`/api/behaviors/${email}/${anchorName}`);
}
