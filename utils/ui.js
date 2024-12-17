// utils/ui.js

/**
 * UI 工具文件
 * 封装常用的 UI 操作，如显示加载动画、隐藏加载动画、显示提示信息等。
 */

/**
 * 显示加载动画
 * @param {Object} options - 配置选项
 * @param {String} options.title - 加载动画的标题，默认值为 '加载中...'
 * @param {Boolean} options.mask - 是否显示透明蒙层，防止触摸穿透，默认值为 true
 */
export function showLoading(options = { title: '加载中...', mask: true }) {
  uni.showLoading({
    title: options.title,
    mask: options.mask,
  });
}

/**
 * 隐藏加载动画
 */
export function hideLoading() {
  uni.hideLoading();
}

/**
 * 显示提示信息
 * @param {Object} options - 配置选项
 * @param {String} options.title - 提示信息的内容，默认值为 '操作成功'
 * @param {String} options.icon - 提示信息的图标，可选值为 'success', 'loading', 'none'，默认值为 'success'
 * @param {Number} options.duration - 提示信息显示的时长，单位为毫秒，默认值为 1500
 */
export function showToast(options = { title: '操作成功', icon: 'success', duration: 1500 }) {
  uni.showToast({
    title: options.title,
    icon: options.icon,
    duration: options.duration,
  });
}

/**
 * 显示模态对话框
 * @param {Object} options - 配置选项
 * @param {String} options.title - 对话框的标题
 * @param {String} options.content - 对话框的内容
 * @param {String} options.confirmText - 确认按钮的文字，默认值为 '确定'
 * @param {String} options.cancelText - 取消按钮的文字，默认值为 '取消'
 * @returns {Promise} - 返回一个 Promise，resolve 为用户点击确认，reject 为用户点击取消或关闭
 */
export function showModal(options = { title: '提示', content: '', confirmText: '确定', cancelText: '取消' }) {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: options.title,
      content: options.content,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      success(res) {
        if (res.confirm) {
          resolve();
        } else if (res.cancel) {
          reject();
        }
      },
      fail() {
        reject();
      },
    });
  });
}

/**
 * 显示动作表
 * @param {Object} options - 配置选项
 * @param {String} options.title - 动作表的标题，默认值为 '请选择'
 * @param {Array} options.items - 动作表的选项列表
 * @returns {Promise} - 返回一个 Promise，resolve 为用户选择的选项，reject 为用户取消
 */
export function showActionSheet(options = { title: '请选择', items: [] }) {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList: options.items,
      success(res) {
        resolve(res.tapIndex);
      },
      fail() {
        reject();
      },
    });
  });
}

/**
 * 显示通知
 * @param {Object} options - 配置选项
 * @param {String} options.title - 通知的标题
 * @param {String} options.description - 通知的描述
 */
export function showNotification(options = { title: '', description: '' }) {
  uni.showNotification({
    title: options.title,
    description: options.description,
  });
}
