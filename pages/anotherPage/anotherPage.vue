<template>
  <view class="container">
    <!-- 用户信息 -->
    <view class="user-info-card">
      <image class="avatar" src="/static/Dancing kitty.gif"></image>
      <text class="username">mama</text>
    </view>

    <!-- 输入邮箱 -->
    <view class="email-input-card">
      <input type="text" class="email-input" placeholder="请输入您的邮箱" v-model="email" @blur="saveEmail" />
    </view>

    <!-- 使用手册 -->
    <view class="menu-item-card" @tap="navigateToManual">
      <text class="menu-text">使用手册</text>
      <view class="right-content">
        <uni-icons type="forward" size="18" color="#999"></uni-icons>
      </view>
    </view>
    <view class="menu-item-card" @tap="navigateTdream">
      <text class="menu-text">梦想清单</text>
      <view class="right-content">
        <uni-icons type="forward" size="18" color="#999"></uni-icons>
      </view>
    </view>
    <!-- 关于 -->
    <view class="menu-item-card" @tap="navigateToAbout">
      <text class="menu-text">关于</text>
      <view class="right-content">
        <uni-icons type="forward" size="18" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 分享按钮 -->
    <button class="share-btn" open-type="share">分享给朋友</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      email: '' // 用于双向绑定邮箱输入框的值
    };
  },
  onLoad() {
    // 页面加载时尝试从本地存储读取邮箱
    this.loadEmail();
  },
  onShareAppMessage() {
    return {
      title: '梦想笔记本', // 使用 "梦想起航" 作为推广名词
      path: '/pages/dreamList/dreamList', // 分享的页面路径
      imageUrl: '/static/WechatIMG169.jpg' // 使用静态分享图片
    };
  },
  methods: {
    navigateToManual() {
      // 这里可以添加跳转到使用手册页面的逻辑
      uni.navigateTo({
        url: '/pages/book/book' // 替换为你的使用手册页面路径
      });
    },
    navigateToAbout() {
      // 这里可以添加跳转到关于页面的逻辑
      uni.navigateTo({
        url: '/pages/about/about' // 替换为你的关于页面路径
      });
    },
    navigateTdream() {
      // 这里可以添加跳转到关于页面的逻辑
      uni.navigateTo({
        url: '/pages/dreamList/dreamList' // 替换为你的关于页面路径
      });
    },
    saveEmail() {
      // 将邮箱保存到本地存储
      uni.setStorageSync('userEmail', this.email);
      uni.showToast({
        title: '邮箱已保存',
        icon: 'success',
        duration: 1000
      });
    },
    loadEmail() {
      // 从本地存储读取邮箱
      const savedEmail = uni.getStorageSync('userEmail');
      if (savedEmail) {
        this.email = savedEmail;
      }
    }
  }
};
</script>

<style>
.container {
  padding: 0 30rpx;
  background-color: #f8f8f8;
}

.user-info-card {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 0 20rpx;
}

.username {
  font-size: 32rpx;
}

/* 邮箱输入框样式 */
.email-input-card {
  padding: 0 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.email-input {
  height: 80rpx;
  font-size: 32rpx;
  line-height: 80rpx;
}

.menu-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.menu-text {
  font-size: 32rpx;
}

.right-content {
  display: flex;
  align-items: center;
}

.share-btn {
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 60rpx;
  background: #07c160;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
}
</style>
