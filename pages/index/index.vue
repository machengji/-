<template>
  <view class="container">
    <!-- Content Container -->
    <view class="content-wrapper">
      <!-- 彩虹屁 -->
   <!--   <view class="cheer-section">
        <text class="cheer-text">
          今天也是元气满满的一天！
        </text>
      </view> -->

      <!-- 分割线 -->
     <view class="divider"></view>

      <!-- 进行中的计划列表 -->
      <view class="plan-list">
        <block v-if="ongoingPlans.length === 0">
          <text class="no-plans-message">
            还没开始追逐梦想吗？快来添加你的愿望清单吧！
          </text>
        </block>
        <block v-else v-for="(item, index) in ongoingPlans" :key="item.id">
          <view class="plan-item" :class="{ completed: item.status === '已完成' }" @tap="navigateToPlanDetail(item)">
            <view class="checkbox" @tap.stop="togglePlanStatus(index, 'ongoing')">
              <text class="checkbox-icon">
                {{ item.status === '已完成' ? '✔️' : '⬜️' }}
              </text>
            </view>
            <view class="plan-content">
              <text class="plan-name">{{ index + 1 }}. {{ item.name }}</text>
              <view class="plan-status-wrapper">
                <text class="plan-status" :class="statusClass(item.status)">
                  {{ item.status }}
                </text>
              </view>
            </view>
          </view>
          <view class="item-divider" v-if="index < ongoingPlans.length - 1"></view>
        </block>
      </view>

      <!-- 分隔线 -->
      <view class="divider"></view>

      <!-- 已完成的计划列表 -->
      <view class="plan-list completed-plans">
        <block v-for="(item, index) in completedPlans" :key="item.id">
          <view class="plan-item completed">
            <view class="checkbox" @tap="togglePlanStatus(index, 'completed')">
              <text class="checkbox-icon">✔️</text>
            </view>
            <view class="plan-content">
              <div class="plan-name">{{ index + 1 }}. {{ item.name }}</div>
              <view class="plan-status-wrapper">
                <text class="plan-status" :class="statusClass(item.status)">
                  {{ item.status }}
                </text>
              </view>
            </view>
          </view>
        </block>
      </view>
    </view>

    <!-- 修改添加新计划区域 -->
    <view class="add-section" :class="{ 'expanded': isInputMode }" @tap="expandInput">
      <input v-if="isInputMode" v-model="newPlanName" class="add-input" placeholder="输入你的愿望，按回车确认"
        @blur="collapseInput" @confirm="addNewPlan" focus confirm-type="done" />
      <text v-else class="add-text">➕ 添加新愿望</text>
    </view>
    <!-- 使用弹窗组件 -->
    <success-popup :visible="showPopup" :description="description" type="dream" @close="handleClosePopup"></success-popup>
  </view>
</template>

<script>
	import SuccessPopup from '@/components/SuccessPopup.vue';

	export default {
		components: {
			SuccessPopup
		},
		data() {
			return {
				// currentDate: this.getCurrentDate(), // 移除日期
				plans: [],
				isPopupVisible: false,
				isInputMode: false,
				showPopup: false,
				description:"",
				newPlanName: '',
			};
		},
		computed: {
			ongoingPlans() {
				return this.plans.filter(plan => plan.status !== '已完成');
			},
			completedPlans() {
				return this.plans.filter(plan => plan.status === '已完成');
			}
		},
		// onLoad() {

		// },
		onShow() {
			this.loadPlansFromStorage();
		},
		methods: {
			// getCurrentDate() { // 移除日期方法
			// 	const date = new Date();
			// 	const options = {
			// 		year: 'numeric',
			// 		month: 'long',
			// 		day: 'numeric',
			// 		weekday: 'long'
			// 	};
			// 	return date.toLocaleDateString('zh-CN', options);
			// },
			expandInput() {
				this.isInputMode = true;
			},
			collapseInput() {
				this.isInputMode = false;
				this.newPlanName = '';
			},
			handleClosePopup() {
				this.showPopup = false;
			},
			navigateToPlanDetail(plan) {
				// 确保传递的 plan 对象包含 isExplored 属性
				const planWithIsExplored = {
					...plan,
					isExplored: plan.isExplored === undefined ? false : plan.isExplored
				};
				console.log(planWithIsExplored)
				uni.navigateTo({
					url: `/pages/exploringBehavior/exploringBehavior?plan=${JSON.stringify(planWithIsExplored)}`
				});
			},
			openInputPopup() {
				this.isPopupVisible = true;
			},
			closePopup() {
				this.isPopupVisible = false;
				this.newPlanName = '';
			},
			addNewPlan(e) {
				const value = e.detail.value.trim();
				if (value) {
					const newPlan = {
						id: Date.now(),
						name: value,
						status: '未开始',
						isExplored: false // 新增计划时设置 isExplored 为 false
					};
					this.plans.push(newPlan);
					this.savePlansToStorage();
					this.newPlanName = '';
					this.isInputMode = false;
				}
			},
			statusClass(status) {
				switch (status) {
					case '进行中':
						return 'status-active';
					case '已完成':
						return 'status-completed';
					case '未开始':
						return 'status-pending';
					default:
						return '';
				}
			},
			togglePlanStatus(index, listType) {
				let targetPlan;
				if (listType === 'ongoing') {
					targetPlan = this.ongoingPlans[index];
				} else {
					targetPlan = this.completedPlans[index];
				}

				const originalIndex = this.plans.findIndex(plan => plan.id === targetPlan.id);

				if (originalIndex !== -1) {
					if (this.plans[originalIndex].status === '已完成') {
						this.plans[originalIndex].status = '进行中';
					} else {
						this.plans[originalIndex].status = '已完成';
						this.description=targetPlan.name
						this.showPopup = true;
					}
					this.savePlansToStorage();
				}
			},
			loadPlansFromStorage() {
				try {
					const storedPlans = uni.getStorageSync('plans');
					if (storedPlans) {
						this.plans = JSON.parse(storedPlans);
						// 确保从缓存中读取的 plan 对象包含 isExplored 属性
						this.plans = this.plans.map(plan => ({
							...plan,
							isExplored: plan.isExplored === undefined ? false : plan.isExplored
						}));
					} else {
						this.plans = [];
					}
				} catch (e) {
					console.error('读取计划数据失败', e);
					this.plans = [];
				}
			},
			savePlansToStorage() {
				try {
					uni.setStorageSync('plans', JSON.stringify(this.plans));
				} catch (e) {
					console.error('保存计划数据失败', e);
				}
			}
		}
	}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  position: relative;
}

/* Content Wrapper */
.content-wrapper {
  flex: 1; /* Allow content to take up available space */
  overflow-y: auto; /* Enable scrolling if content overflows */
}

/* 彩虹屁 */
.cheer-section {
  padding: 24rpx 0;
  display: flex;
  justify-content: center;
}

.cheer-text {
  font-size: 36rpx;
  color: #ff6b6b;
  font-weight: bold;
  text-align: center;
}

.no-plans-message {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  margin: 20rpx 0;
}

/* 分割线 */
.divider {
  border-bottom: 1rpx solid #e0e0e0;
  margin-bottom: 24rpx;
}

/* 计划列表 */
.plan-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
}

.completed-plans {
  margin-top: 24rpx;
  margin-bottom: 80rpx;
}

.plan-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;
}

.plan-item.completed {
  background-color: #f0f0f0;
  color: #a0a0a0;
}

/* 勾选框 */
.checkbox {
  margin-right: 16rpx;
  font-size: 28rpx;
  cursor: pointer;
}

.checkbox-icon {
  font-size: 32rpx;
}

/* 计划内容 */
.plan-content {
  flex: 1;
  max-width: 90%;
  position: relative;
}

.plan-status-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4rpx 12rpx;
}

.plan-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  word-wrap: break-word;
  white-space: normal;
  max-width: 70%;
}

.plan-status-wrapper {
  display: flex;
  justify-content: flex-end;
}

.plan-status {
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #fff;
}

.status-active {
  background-color: #ff9800;
}

.status-completed {
  background-color: #4caf50;
}

.status-pending {
  background-color: #9e9e9e;
}

/* 每个计划间的分割线 */
.item-divider {
  height: 16rpx;
}

/* 添加新计划区域，固定在底部 */
.add-section {
  position: fixed;
  bottom: 16rpx;
  left: 16rpx;
  right: 16rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #ff5722, #ff9800);
  border-radius: 44rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.add-section.expanded {
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.add-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
  transition: opacity 0.2s;
}

.add-input {
  flex: 1;
  height: 100%;
  padding: 0 32rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

/* 添加动画效果 */
.add-section {
  transform-origin: center bottom;
  animation: bounce-in 0.3s ease-out;
}

.add-section.expanded {
  animation: expand 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 弹窗的出现动画 */
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes popupAnimation {
  0% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes bounce-in {
  0% {
    transform: translateY(100%);
  }

  70% {
    transform: translateY(-10rpx);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes expand {
  0% {
    transform: scaleY(0.8);
  }

  100% {
    transform: scaleY(1);
  }
}
</style>
