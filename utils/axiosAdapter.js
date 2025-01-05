// utils/axiosAdapter.js
const wxAdapter = (config) => {
  return new Promise((resolve, reject) => {
    // 确保 URL 是完整的
    let url = config.url;
    if (!/^https?:\/\//i.test(url)) {
      // 如果是相对路径，结合 baseURL
      if (config.baseURL) {
        // 确保 baseURL 以 '/' 结尾或 config.url 以 '/' 开头，以避免 URL 拼接错误
        const separator = config.baseURL.endsWith('/') || config.url.startsWith('/') ? '' : '/';
        url = config.baseURL + separator + config.url;
      }
    }

    wx.request({
      url: url,
      method: config.method,
      data: config.data,
      header: config.headers,
      success: (res) => {
        resolve({
          data: res.data,
          status: res.statusCode,
          statusText: res.statusCode === 200 ? 'OK' : 'Error',
          headers: res.header,
          config,
          request: {},
        });
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export default wxAdapter;
