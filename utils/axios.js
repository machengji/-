// utils/axios.js
import axios from 'axios';
import wxAdapter from './axiosAdapter';
import { showLoading, hideLoading, showToast } from '@/utils/ui'; // 假设你有一个 UI 工具文件

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'https://tip.yjdweb.cn', // 替换为你的后端 API 基础路径
  timeout: 40000, // 请求超时设置
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: wxAdapter, // 使用自定义适配器
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做一些处理，例如添加 token
    const token = uni.getStorageSync('token'); // 从本地存储获取 token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // 添加 token 到请求头
    }
    // showLoading({ title: '加载中...' }); // 请求开始时显示加载动画
    return config;
  },
  (error) => {
    hideLoading(); // 请求错误时关闭加载动画
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // hideLoading(); // 请求完成后隐藏加载动画
	console.log(response)
    if (response.status !== 200) {
      // 根据后端的错误状态码进行处理
      showToast({
        title: response.data.message || '请求失败',
        icon: 'none',
      });
      return Promise.reject(new Error(response.data.message || '请求失败'));
    }

    return response.data; // 返回正常数据
  },
  (error) => {
    hideLoading(); // 响应错误时隐藏加载动画
    let errorMsg = '网络错误';
    if (error.response) {
      // 服务器返回的错误
      errorMsg = `错误代码：${error.response.status}`;
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMsg = '请求超时，请稍后重试';
    }

    showToast({
      title: errorMsg,
      icon: 'none',
    });
    return Promise.reject(error);
  }
);

export default instance;
