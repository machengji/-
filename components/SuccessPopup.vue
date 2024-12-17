<template>
  <view v-if="visible" class="popup" :class="{ 'popup-closing': isClosing }">
    <view class="popup-content" :class="{ 'popup-content-closing': isClosing }">
      <!-- <image src="/static/fireworks.gif" class="icon"></image> -->
      <text class="title">🎉 恭喜你完成！ 🎉</text>
      <text class="description">{{ description }}</text>
      <text v-if="rainbowFart" class="rainbow-fart">{{ rainbowFart }}</text>
      <view class="details">
        <text>完成时间：{{ formattedCompletionTime }}</text>
        <text>成就徽章：{{ badge }}</text>
        <text>已完成：{{ completedCount }} 个{{ type === 'dream' ? '梦想' : '小行为' }}</text>
      </view>
      <!-- 关闭按钮 -->
      <button class="close-button" @click="closePopup">✌️</button>
    </view>
    <!-- 烟花效果 -->
    <view class="fireworks" v-if="visible">
      <view class="firework" v-for="n in 10" :key="n" :style="fireworkStyle(n)"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'action', // 'dream' or 'action'
      validator: (value) => ['dream', 'action'].includes(value)
    }
  },
  data() {
    return {
      completionTime: '',
      badge: '',
      completedCount: 0,
      iconSrc: '/static/success-icon.png',
      rainbowFart: '稍等一下，彩虹屁马上就来！',
      isClosing: false, // 用于控制关闭动画
    };
  },
  computed: {
    formattedCompletionTime() {
      return this.formatTime(this.completionTime);
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializePopup();
        this.isClosing = false; // 确保打开时关闭动画类被移除
      }
    }
  },
  methods: {
    initializePopup() {
      this.completionTime = new Date();
      this.badge = this.type === 'dream' ? '梦想家 🏅' : '初级行动者 🏅';
      this.updateCompletedCount();
      this.iconSrc = this.type === 'dream' ? '/static/dream-icon.png' : '/static/success-icon.png';
      this.fetchRainbowFart();
    },
    formatTime(date) {
      if (!date) return '';
      const now = new Date(date);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    updateCompletedCount() {
      const storageKey = this.type === 'dream' ? 'completedDreams' : 'completedActions';
      let completedItems = uni.getStorageSync(storageKey) || [];
      completedItems.push({
        time: this.completionTime,
        description: this.description
      });
      uni.setStorageSync(storageKey, completedItems);
      this.completedCount = completedItems.length;
    },
    closePopup() {
      this.isClosing = true; // 启动关闭动画
      setTimeout(() => {
        this.$emit('close'); // 动画结束后关闭弹窗
        this.isClosing = false; // 重置关闭状态
      }, 300); // 动画时间，与 CSS 中设置的动画时间一致
    },
    fireworkStyle(index) {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomSize = Math.random() * 5 + 2;
      const randomDelay = Math.random() * 2;
      const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

      return {
        left: `${randomX}vw`,
        top: `${randomY}vh`,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        backgroundColor: randomColor,
        animationDelay: `${randomDelay}s`,
      };
    },
    async fetchRainbowFart() {
      try {
        const response = await new Promise((resolve, reject) => {
          uni.request({
            url: 'https://zenquotes.io/api/random',
            method: 'GET',
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res.data);
              } else {
                reject(new Error(`HTTP error! status: ${res.statusCode}`));
              }
            },
            fail: (err) => {
              reject(err);
            },
          });
        });

        if (response && response.length > 0) {
          this.rainbowFart = `${response[0].q}！哇！你真是太棒了！`;
          setTimeout(() => {
            this.$nextTick(() => {
              // 确保 DOM 更新后执行动画
            });
          }, 100);
        } else {
          this.rainbowFart = '你太棒了！';
        }
      } catch (error) {
        console.error('Failed to fetch rainbow fart:', error);
        this.rainbowFart = '你太棒了！';
      }
    },
  }
};
</script>

<style scoped>
/* 弹窗样式 */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.3s ease; /* 添加透明度过渡 */
}

.popup-closing {
  opacity: 0; /* 关闭时透明度变为0 */
}

/* 弹窗内容 */
.popup-content {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  width: 80%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, opacity 0.3s ease; /* 添加过渡 */
}

.popup-content-closing {
  transform: scale(0.8);
  opacity: 0;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0.5;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 图标 */
.icon {
  width: 120px;
  height: 60px;
  margin-bottom: 20px;
}

/* 标题样式 */
.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

/* 描述文字 */
.description {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

/* 彩虹屁文字 */
.rainbow-fart {
  font-size: 18px;
  color: #ff69b4;
  font-weight: bold;
  margin-bottom: 15px;
  animation: rainbowFartAnimation 1s ease-in-out;
  will-change: transform, opacity;
}

@keyframes rainbowFartAnimation {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  10% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 详细信息 */
.details {
  margin: 10px 0;
  text-align: left;
  font-size: 14px;
  color: #444;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 关闭按钮 */
.close-button {
  background-color: #ff6347;
  color: #fff;
  padding: 10px 25px;
  border-radius: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-button:hover {
  background-color: #ff4500;
}

/* 烟花效果 */
.fireworks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.firework {
  position: absolute;
  border-radius: 50%;
  animation: firework 2s ease-out infinite;
}

@keyframes firework {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(2);
  }
}
</style>
