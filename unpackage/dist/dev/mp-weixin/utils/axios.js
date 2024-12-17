"use strict";
const common_vendor = require("../common/vendor.js");
const utils_axiosAdapter = require("./axiosAdapter.js");
const utils_ui = require("./ui.js");
const instance = common_vendor.axios.create({
  baseURL: "https://tip.yjdweb.cn",
  // 替换为你的后端 API 基础路径
  timeout: 4e4,
  // 请求超时设置
  headers: {
    "Content-Type": "application/json"
  },
  adapter: utils_axiosAdapter.wxAdapter
  // 使用自定义适配器
});
instance.interceptors.request.use(
  (config) => {
    const token = common_vendor.index.getStorageSync("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    utils_ui.hideLoading();
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (response) => {
    console.log(response);
    if (response.status !== 200) {
      utils_ui.showToast({
        title: response.data.message || "请求失败",
        icon: "none"
      });
      return Promise.reject(new Error(response.data.message || "请求失败"));
    }
    return response.data;
  },
  (error) => {
    utils_ui.hideLoading();
    let errorMsg = "网络错误";
    if (error.response) {
      errorMsg = `错误代码：${error.response.status}`;
    } else if (error.request) {
      errorMsg = "请求超时，请稍后重试";
    }
    utils_ui.showToast({
      title: errorMsg,
      icon: "none"
    });
    return Promise.reject(error);
  }
);
exports.instance = instance;
