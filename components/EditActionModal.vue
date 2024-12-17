<template>
  <view class="modal-overlay" v-if="visible" @touchmove.stop.prevent>
    <view class="modal-content" :class="{ 'modal-enter-active': visible }">
      <text class="modal-title">编辑行为</text>
      <input v-model="editedTitle" class="modal-input" placeholder="请输入新行为标题" />
      <view class="checkbox-container">
        <text class="checkbox-label">重复执行：</text>
        <view class="checkbox" @tap="toggleRepeat">
          <text class="checkbox-icon" :class="{ 'checkbox-checked': repeat }">{{ repeat ? '✔️' : '⬜️' }}</text>
        </view>
      </view>
      <view class="modal-actions">
        <button class="modal-button confirm" @tap="confirmEdit">确认</button>
        <button class="modal-button cancel" @tap="cancelEdit">取消</button>
      </view>
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
    action: {
      type: Object,
      default: () => ({
        title: '',
        repeat: false
      })
    }
  },
  data() {
    return {
      editedTitle: this.action.title,
      repeat: this.action.repeat || false
    };
  },
  watch: {
    action: {
      handler(newVal) {
        this.editedTitle = newVal.title;
        this.repeat = newVal.repeat || false;
      },
      deep: true
    }
  },
  methods: {
    toggleRepeat() {
      this.repeat = !this.repeat;
    },
    confirmEdit() {
      this.$emit('confirm', {
        title: this.editedTitle,
        repeat: this.repeat
      });
      this.closeModal();
    },
    cancelEdit() {
      this.closeModal();
    },
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.modal-content {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  width: 85%;
  max-width: 600rpx;
  opacity: 0;
  transform: translateY(-20rpx);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter-active {
  opacity: 1;
  transform: translateY(0);
}

.modal-title {
  font-size: 36rpx;
  font-weight: 500;
  margin-bottom: 24rpx;
  text-align: center;
  color: #333;
}

.modal-input {
  padding: 18rpx;
  font-size: 30rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  outline: none;
  color: #333;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.checkbox-label {
  font-size: 30rpx;
  margin-right: 12rpx;
  color: #555;
}

.checkbox {
  font-size: 30rpx;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
}

.checkbox-icon {
  font-size: 36rpx;
  color: #ccc;
  transition: color 0.2s ease;
}

.checkbox-checked {
  color: #4caf50;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-button {
  padding: 14rpx 28rpx;
  font-size: 30rpx;
  border-radius: 12rpx;
  cursor: pointer;
  width: 48%;
  border: none;
  outline: none;
  transition: background-color 0.2s ease;
}

.confirm {
  background-color: #4caf50;
  color: white;
}

.confirm:hover {
  background-color: #43a047;
}

.cancel {
  background-color: #f44336;
  color: white;
}

.cancel:hover {
  background-color: #d32f2f;
}
</style>
