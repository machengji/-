<template>
	<view class="container">
		<!-- Content Container -->
		<view class="content-wrapper">
			<!-- 进行中的计划列表 -->
			<view class="plan-list">
				<block v-if="ongoingPlans.length === 0">
					<text class="no-plans-message">还没开始追逐梦想吗？快来添加你的愿望清单吧！</text>
				</block>
				<block v-else v-for="(item, index) in ongoingPlans" :key="item.id">
					<up-swipe-action>
						<up-swipe-action-item :options="[
								{
									text: '删除',
									style: { backgroundColor: '#dd524d' }
								},
								{ text: '置顶', style: { backgroundColor: '#4caf50' } }
							]" :threshold="80" @click="handleSwipeOptionClick(item.id, $event)">
							<view class="plan-item" :class="{ completed: item.status === '已完成' }"
								@tap="navigateToPlanDetail(item)">
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
						</up-swipe-action-item>
					</up-swipe-action>
					<view class="item-divider" v-if="index < ongoingPlans.length - 1"></view>
				</block>
			</view>

			<!-- 分隔线 -->
			<view class="divider"></view>

			<!-- 已完成的计划列表 -->
			<view class="plan-list completed-plans">
				<block v-for="(item, index) in completedPlans" :key="item.id">
					<up-swipe-action>
						<up-swipe-action-item :options="[{ text: '删除', style: { backgroundColor: '#dd524d' } }]"
							@click="handleSwipeOptionClick(item.id, $event)">
							<view class="plan-item completed">
								<view class="checkbox" @tap.stop="togglePlanStatus(index, 'completed')">
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
						</up-swipe-action-item>
					</up-swipe-action>
				</block>
			</view>
		</view>

		<!-- 修改添加新计划区域 -->
		<view class="add-section" :class="{ expanded: isInputMode }" @tap="expandInput">
			<input v-if="isInputMode" v-model="newPlanName" class="add-input" placeholder="输入你的愿望，按回车确认"
				@blur="collapseInput" @confirm="addNewPlan" focus confirm-type="done" />
			<text v-else class="add-text">➕ 添加新愿望</text>
		</view>
		<!-- 使用弹窗组件 -->
		<success-popup :visible="showPopup" :description="description" type="dream"
			@close="handleClosePopup"></success-popup>
	</view>
</template>
<script>
	import SuccessPopup from '@/components/SuccessPopup.vue';
	import {
		getPlanData,
		saveUserPlan
	} from '@/utils/api.js';; // 引入 API 函数

	export default {
		components: {
			SuccessPopup
		},
		data() {
			return {
				plans: [],
				isPopupVisible: false,
				isInputMode: false,
				showPopup: false,
				description: '',
				newPlanName: '',
				email: '' // 用于存储用户邮箱
			};
		},
		computed: {
			ongoingPlans() {
				return this.plans.filter((plan) => plan.status !== '已完成');
			},
			completedPlans() {
				return this.plans.filter((plan) => plan.status === '已完成');
			}
		},
		onShow() {
			console.log("获取计划")
			this.email = uni.getStorageSync('userEmail') || ''; // 获取用户邮箱
			this.loadPlans(); // 加载计划数据
		},
		methods: {
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
				const planWithIsExplored = {
					...plan,
					isExplored: plan.isExplored === undefined ? false : plan.isExplored
				};
				console.log(planWithIsExplored);
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
						isExplored: false
					};
					this.plans.push(newPlan);
					this.savePlans(); // 保存计划数据
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

				const originalIndex = this.plans.findIndex((plan) => plan.id === targetPlan.id);

				if (originalIndex !== -1) {
					if (this.plans[originalIndex].status === '已完成') {
						this.plans[originalIndex].status = '进行中';
					} else {
						this.plans[originalIndex].status = '已完成';
						this.description = targetPlan.name;
						this.showPopup = true;
					}
					this.savePlans(); // 保存计划数据
				}
			},
			async loadPlans() {
				if (this.email) {
					try {
						const response = await getPlanData(this.email);
						// console.log("uuuu", response.data);
						if (response && response.success && Array.isArray(response.data)&& response.data.length > 0) {
							this.plans = response.data.map(plan => ({
								...plan,
								isExplored: plan.isExplored === undefined ? false : plan.isExplored
							}));
							this.savePlansToStorage();
							// console.log('从后端获取计划数据成功:', this.plans);
							return; // 如果从后端获取成功，则不加载本地数据
						}
					} catch (error) {
						console.error('从后端获取计划数据失败:', error);
					}
				}
				// 如果没有邮箱或从后端获取失败，则加载本地数据
				this.loadPlansFromStorage();
			},

			loadPlansFromStorage() {
				try {
					const storedPlans = uni.getStorageSync('plans');
					if (storedPlans) {
						this.plans = JSON.parse(storedPlans);
						this.plans = this.plans.map((plan) => ({
							...plan,
							isExplored: plan.isExplored === undefined ? false : plan.isExplored
						}));
					} else {
						this.plans = [];
					}
					console.log('从本地存储加载计划数据:', this.plans);
				} catch (e) {
					console.error('读取计划数据失败', e);
					this.plans = [];
				}
			},
			async savePlans() {
				try {
					this.savePlansToStorage(); // 保存到本地存储
					if (this.email) {
						// 先从本地存储获取 plans
											let storedPlans = uni.getStorageSync('plans');
											let plansToSave = [];
											if (storedPlans) {
												plansToSave = JSON.parse(storedPlans);
											} else {
												plansToSave = this.plans;
											}
						await saveUserPlan(this.email, plansToSave);
						console.log('计划数据保存到后端成功');
					}
					
				} catch (error) {
					console.error('保存计划数据失败:', error);
				}
			},
			savePlansToStorage() {
				try {
					uni.setStorageSync('plans', JSON.stringify(this.plans));
					console.log('计划数据保存到本地存储成功');
				} catch (e) {
					console.error('保存计划数据到本地存储失败', e);
				}
			},
			handleSwipeOptionClick(id, event) {
				console.log('Swipe action button clicked:', event, 'for item ID:', id);
				if (event.index === 0) {
					// 删除按钮被点击
					console.log('删除按钮被点击, ID:', id);
					this.deletePlan(id);
				} else if (event.index === 1) {
					// 置顶按钮被点击
					console.log('置顶按钮被点击, ID:', id);
					this.pinPlan(id);
				}
			},
			deletePlan(id) {
				console.log('8888');
				this.plans = this.plans.filter((plan) => plan.id !== id);
				this.savePlans(); // 保存计划数据
			},
			pinPlan(id) {
				const index = this.plans.findIndex((plan) => plan.id === id);
				if (index > -1) {
					const planToPin = this.plans.splice(index, 1)[0];
					this.plans.unshift(planToPin);
					this.savePlans(); // 保存计划数据
				}
			}
		}
	};
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
		flex: 1;
		/* Allow content to take up available space */
		overflow-y: auto;
		/* Enable scrolling if content overflows */
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
		/* margin-bottom: 8rpx; */
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