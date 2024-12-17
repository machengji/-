<template>
  <view class="modal-overlay" v-if="visible">
    <view class="modal-content">
      <view class="modal-header">
        <text class="modal-title">编辑愿望</text>
        <button class="close-btn" @tap="closeModal">×</button>
      </view>
      <view class="modal-body">
        <view class="input-group">
          <text class="label">愿望名称</text>
          <input type="text" v-model="editedPlan.name" class="input-field" placeholder="请输入愿望名称" />
        </view>
        <view class="input-group">
          <text class="label">描述信息</text>
          <textarea v-model="editedPlan.description" class="textarea-field" placeholder="请输入描述信息"></textarea>
        </view>
        <button class="delete-btn" @tap="deleteGoal">删除愿望</button>
      </view>
      <view class="modal-footer">
        <view class="button-group">
          <button class="cancel-btn" @tap="closeModal">取消</button>
          <button class="confirm-btn" @tap="confirmEdit">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      editedPlan: {
        name: '',
        description: '',
      },
    };
  },
  watch: {
    plan: {
      handler(newPlan) {
        this.editedPlan = { ...newPlan };
      },
      immediate: true,
    },
    visible(newValue, oldValue) {
      console.log('GoalModal visible changed:', oldValue, '=>', newValue);
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    confirmEdit() {
      this.$emit('confirm', this.editedPlan);
    },
    deleteGoal() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个愿望吗？',
        success: (res) => {
          if (res.confirm) {
            this.$emit('delete');
          }
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
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
button::after{ border: none;} 
.modal-content {
  background-color: #fff;
  border-radius: 15rpx;
  width: 80%;
  max-width: 600rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 40rpx;
  color: #999;
  padding: 0;
  margin: 0;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  &:active {
    transform: scale(0.9);
  }
}

.modal-body {
  padding: 20rpx;
  position: relative; /* 添加相对定位 */
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #555;
  margin-bottom: 8rpx;
}

.input-field {
  border: 1rpx solid #d9d9d9;
  border-radius: 10rpx;
  padding: 10rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
  min-height: 80rpx;
  height: auto;
}
.textarea-field {
  border: 1rpx solid #d9d9d9;
  border-radius: 10rpx;
  padding: 10rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
}

.textarea-field {
  height: 150rpx;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
}

.button-group {
  display: flex;
  gap: 10rpx;
}

.confirm-btn,
.cancel-btn,
.delete-btn {
  border: none;
  border-radius: 15rpx;
  padding: 10rpx 20rpx;
  font-size: 26rpx;
  transition: background 0.3s, transform 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  // justify-content: center;
  width: 100rpx;
  height: 50rpx;
  line-height: 1;
  color: #fff;
}

.confirm-btn {
  background: #52c41a;
  &:active {
    background: #389e0d;
    transform: scale(0.98);
  }
}

.cancel-btn {
  background: #ff4d4f;
  &:active {
    background: #d9363e;
    transform: scale(0.98);
  }
}
.delete-btn {
  background: transparent;
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
  width: fit-content;
  padding: 10rpx 15rpx;
  text-align: left;
  margin-left: 20rpx; /* 与输入框左侧对齐 */
  margin-top: 10rpx; /* 调整与输入框的间距 */
  margin-bottom: 10rpx;
}
</style>
