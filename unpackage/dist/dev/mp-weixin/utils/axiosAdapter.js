"use strict";
const common_vendor = require("../common/vendor.js");
const wxAdapter = (config) => {
  return new Promise((resolve, reject) => {
    let url = config.url;
    if (!/^https?:\/\//i.test(url)) {
      if (config.baseURL) {
        const separator = config.baseURL.endsWith("/") || config.url.startsWith("/") ? "" : "/";
        url = config.baseURL + separator + config.url;
      }
    }
    common_vendor.wx$1.request({
      url,
      method: config.method,
      data: config.data,
      header: config.headers,
      success: (res) => {
        resolve({
          data: res.data,
          status: res.statusCode,
          statusText: res.statusCode === 200 ? "OK" : "Error",
          headers: res.header,
          config,
          request: {}
        });
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
exports.wxAdapter = wxAdapter;
