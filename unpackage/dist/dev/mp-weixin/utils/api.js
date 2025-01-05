"use strict";
const utils_axios = require("./axios.js");
function getPlanData(email) {
  return utils_axios.instance.get(`/api/plans/${email}`);
}
function saveUserPlan(email, planData) {
  return utils_axios.instance.post(`/api/plans/${email}`, planData);
}
function getPlan(message) {
  return utils_axios.instance.post("/api/ask", message);
}
function saveAnchorList(email, anchorList) {
  return utils_axios.instance.post(`/api/anchors`, {
    email,
    anchorList: anchorList.map((anchor) => ({
      name: anchor.name,
      hour: anchor.hour,
      minute: anchor.minute
    }))
  });
}
function getAnchorList(email) {
  return utils_axios.instance.get(`/api/anchors?email=${email}`);
}
function getBehaviorList(email, anchorName) {
  return utils_axios.instance.get(`/api/behaviors/${email}/${anchorName}`);
}
exports.getAnchorList = getAnchorList;
exports.getBehaviorList = getBehaviorList;
exports.getPlan = getPlan;
exports.getPlanData = getPlanData;
exports.saveAnchorList = saveAnchorList;
exports.saveUserPlan = saveUserPlan;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
