"use strict";
const common_vendor = require("../common/vendor.js");
function hideLoading() {
  common_vendor.index.hideLoading();
}
function showToast(options = { title: "操作成功", icon: "success", duration: 1500 }) {
  common_vendor.index.showToast({
    title: options.title,
    icon: options.icon,
    duration: options.duration
  });
}
exports.hideLoading = hideLoading;
exports.showToast = showToast;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/ui.js.map
