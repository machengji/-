// uni.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://tip.yjdweb.cn', // 你的后端 API 地址
        changeOrigin: true, // 必须设置为 true，才能正确处理跨域
        pathRewrite: {
          '^/api': '', // 将请求路径中的 /api 替换为空
        },
      },
    },
  },
};
