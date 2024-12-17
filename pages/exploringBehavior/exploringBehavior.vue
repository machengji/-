<template>
	<view class="container">
		<!-- 目标展示区域 -->
		<view class="goal-card">
			<div class="goal-text">愿望：{{plan.name}}</div>
			<button class="edit-goal-btn" @tap="goshowGoalModal">...</button>
		</view>

		<!-- AI探索行为标签区 -->
		<view class="card tag-section">
			<view class="card-header">
				<text class="section-title bold-title">AI探索行为标签</text>
				<view class="header-buttons">
					<button class="clear-tags-btn" @tap="clearAiTags">清空</button>
					<button class="reexplore-btn" @tap="reExplore">探索</button>
				</view>
			</view>

			<!-- 加载动画或标签列表 -->
			<view class="tag-content">
				<view v-if="loading" class="loading-container">
					<image src="/static/loading.gif" class="loading-gif"></image>
					<text class="loading-text">tips：稍等10秒钟 有时候自己想到的行为才是最符合自己的哦</text>
				</view>
				<scroll-view v-else scroll-y class="tag-scroll">
					<view class="tags-container">
						<view v-for="(item, index) in aiTags" :key="'aiTag-' + index" class="tag-item" :class="{ active: activeTagIndex === index }"
							@tap="onTagClick(item, index)">
							{{ item }}
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="fade-out"></view>
		</view>

		<!-- 选择的行为区域头部 -->
		<view class="card behavior-header">
			<text class="section-title bold-title">选择的行为</text>
			<button class="add-action-btn" @tap="showInput = true">添加行为</button>
		</view>

		<!-- 输入框 -->
		<view v-if="showInput" class="input-container">
			<input v-model="newAction" placeholder="请输入新行为" class="action-input" />
			<view class="button-group">
				<button class="confirm-btn" @tap="addAction">确认</button>
				<button class="cancel-btn" @tap="showInput = false">取消</button>
			</view>
		</view>

		<!-- 选择的行为区域 -->
		<scroll-view scroll-y class="behavior-section" :scroll-into-view="currentScrollId" :scroll-with-animation="true"
			:show-scrollbar="false" :enhanced="true">
			<view v-for="(action, idx) in chosenBehaviors" :key="'chosen-' + idx" :id="'behavior-chosen-' + idx"
				class="behavior-card">
				<view class="checkbox" @tap="toggleCompletion(idx, 'chosen')">
					<text class="checkbox-icon">
						{{ action.completed ? '✔️' : '⬜️' }}
					</text>
				</view>
				<view class="behavior-content">
					<view class="behavior-title">
						{{ idx + 1 }}. {{ action.title }}
					</view>

					<view class="behavior-options">
						<button class="behavior-btn primary" @tap="continueExplore(action)">细化探索</button>
						<button class="behavior-btn secondary" @tap="scrollToBehavior(action)">去绑定锚点</button>
						<button class="behavior-btn secondary" @tap="editAction(action, idx)">编辑</button>
						<button class="behavior-btn danger" @tap="deleteAction(idx)">删除</button>
					</view>
				</view>
			</view>

			<!-- 已完成的行为列表 -->
			<view class="completed-header">
				<text class="section-title">已完成的行为</text>
			</view>
			<view v-for="(action, idx) in completedBehaviors" :key="'completed-' + idx"
				:id="'behavior-completed-' + idx" class="behavior-card completed-card">
				<view class="checkbox" @tap="toggleCompletion(idx, 'completed')">
					<text class="checkbox-icon">
						{{ action.completed ? '✔️' : '⬜️' }}
					</text>
				</view>
				<view class="behavior-content">
					<view class="behavior-title">
						{{ idx + 1 }}. {{ action.title }}
						<span v-if="action.repeat"> (完成 {{ action.completedCount }} 次)</span>
					</view>
				</view>
			</view>
		</scroll-view>
		<edit-action-modal :visible="showEditModal" :action="currentAction" @close="closeEditModal"
			@confirm="handleEditConfirm"></edit-action-modal>
		<success-popup :visible="showPopup"   :description="description"
      type="action" @close="handleClosePopup"></success-popup>
		<GoalModal :visible="showGoalModalone" :plan="plan" @close="closeGoalModal" @confirm="handleGoalConfirm" @delete="handleGoalDelete"></GoalModal>
	</view>
</template>
<script>
	import {
		getPlan
	} from '@/utils/api.js';
	import EditActionModal from '@/components/EditActionModal.vue';
	import SuccessPopup from '@/components/SuccessPopup.vue'; // 引入模态框组件
	import GoalModal from '@/components/GoalModal.vue'; // 引入目标编辑模态框

	function deepClone(obj) {
		if (typeof obj !== 'object' || obj === null) {
			return obj;
		}

		const clonedObj = Array.isArray(obj) ? [] : {};

		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				clonedObj[key] = deepClone(obj[key]);
			}
		}

		return clonedObj;
	}

	export default {
		components: {
			EditActionModal,
			SuccessPopup,
			GoalModal
		},
		data() {
			return {
				aiTags: [],
				chosenBehaviors: [],
				plan: {},
				completedBehaviors: [],
				currentScrollId: "",
				showInput: false,
				newAction: "",
				loading: false,
				showPopup: false,
				showEditModal: false, // 控制模态框显示
				currentAction: {},
				 description:'',// 当前编辑的 action
				currentEditIndex: -1, // 当前编辑的 action 的索引
				showGoalModalone: false, // 控制目标编辑模态框显示
				isFetching: false, // 添加一个标志位，表示是否正在请求
			}
		},

		onLoad(options) {
			if (options.plan) {
				this.plan = JSON.parse(options.plan);
				// 检查是否已经初次探索
				if (this.plan.isExplored) {
					this.loadBehaviorsFromStorage();
					return; // 如果已经探索过，则不执行后续的请求
				}
			}
		},

		mounted() {
			console.log(this.plan.isExplored)
			// 检查是否已经初次探索
			if (!this.plan.isExplored) {
				this.fetchPlanData();
			}
		},
		methods: {
			async fetchPlanData(message) {
				// 如果正在请求，则直接返回，避免重复请求
				if (this.isFetching) {
					uni.showToast({
						title: "请等待上一个AI回答完成",
						icon: "none",
						duration: 2000
					});
					return;
				}
				this.isFetching = true; // 设置正在请求的标志
				this.loading = true;
				try {
					const response = await getPlan({
						message: message || this.plan.name // 如果没有传递 message，则使用 plan.name
					});
					console.log(response);
					if (response.response && Array.isArray(response.response)) {
						this.aiTags = response.response.map(item => item.text);

						// 设置 isExplored 为 true 并更新本地缓存
						if (!message) {
							this.plan.isExplored = true;
							this.plan.status = "进行中"
							this.updatePlanInStorage();
						}
					} else {
						uni.showToast({
							title: "数据格式错误",
							icon: "none",
							duration: 2000
						});
					}
				} catch (error) {
					console.error('获取计划数据失败:', error);
					uni.showToast({
						title: "获取计划数据失败",
						icon: "none",
						duration: 2000
					});
				} finally {
					this.loading = false;
					this.isFetching = false; // 请求完成后，重置标志
				}
			},
			handleClosePopup() {
				this.showPopup = false;
			},
			goshowGoalModal(){
				
				this.showGoalModalone=true
				// console.log("88888")
			},
			
			onTagClick(tag, index) {
				this.activeTagIndex = index;
				      setTimeout(() => {
				        this.activeTagIndex = -1;
				        this.aiTags.splice(index, 1);
				        this.chosenBehaviors.unshift({
				          title: tag,
				          completed: false,
				        });
				        this.currentScrollId = `behavior-chosen-0`;
				        this.updatePlanInStorage();
				      }, 200);
			},
			clearAiTags() {
				this.aiTags = [];
			},
			continueExplore(action) {
				
				 this.fetchPlanData(`${String(action.title)}`);
			},

			editAction(action, idx) {
				this.currentAction = {
					...action
				}; // 复制 action 对象
				this.currentEditIndex = idx;
				this.showEditModal = true;
			},

			closeEditModal() {
				this.showEditModal = false;
				this.currentAction = {};
				this.currentEditIndex = -1;
			},

			handleEditConfirm(editedAction) {
				if (this.currentEditIndex > -1) {
					this.chosenBehaviors[this.currentEditIndex] = {
						...this.chosenBehaviors[this.currentEditIndex],
						title: editedAction.title,
						repeat: editedAction.repeat
					};
					this.updatePlanInStorage();
				}
				this.closeEditModal();
			},

			// 跳转到某个行为
			scrollToBehavior(action) {
				const targetId = `behavior-chosen-${this.chosenBehaviors.indexOf(action)}`;
				this.currentScrollId = targetId;
				const clonedAction = deepClone(action);
				console.log(clonedAction);
				uni.navigateTo({
					url: `/pages/anchorList/anchorList?anchor=${JSON.stringify(clonedAction)}`
				});
			},

			deleteAction(idx) {
				this.chosenBehaviors.splice(idx, 1);
				uni.showToast({
					title: "已删除",
					icon: "none",
					duration: 2000
				});
				this.updatePlanInStorage();
			},

			addAction() {
				if (this.newAction.trim() === "") {
					// uni.showToast({
					// 	title: "请输入有效的行为",
					// 	icon: "none",
					// 	duration: 2000
					// });
					return;
				}
				this.chosenBehaviors.unshift({
					title: this.newAction,
					completed: false
				});
				this.currentScrollId = `behavior-chosen-0`;
				uni.showToast({
					title: "已添加行为：" + this.newAction,
					icon: "none",
					duration: 2000
				});
				this.newAction = "";
				this.showInput = false;
				this.updatePlanInStorage();
			},

			reExplore() {
				this.fetchPlanData();
			},

			toggleCompletion(idx, listType) {
				if (listType === 'chosen') {
					const action = this.chosenBehaviors[idx];
					if (action.repeat) {
						const completedIndex = this.completedBehaviors.findIndex(
							(item) => item.title === action.title
						);
						if (completedIndex === -1) {
							// 已完成列表不存在相同行为，移动到已完成列表并设置完成次数为 1, completed = true
							const newCompletedAction = {
								...action,
								completedCount: 1,
								completed: true
							};
							this.completedBehaviors.unshift(newCompletedAction);
						} else {
							// 已完成列表存在相同行为，完成次数加 1
							this.completedBehaviors[completedIndex].completedCount++;
						}
					} else {
						// 非重复行为，移动到已完成列表
						const [completedAction] = this.chosenBehaviors.splice(idx, 1);
						completedAction.completed = true;
						this.completedBehaviors.unshift(completedAction);
					}
					 this.description = action.title; // Set the description here
					this.showPopup = true;
					
				} else if (listType === 'completed') {
					const action = this.completedBehaviors[idx];
					if (action.repeat) {
						const chosenIndex = this.chosenBehaviors.findIndex(
							(item) => item.title === action.title
						);
						if (chosenIndex === -1) {
							// 未完成列表不存在相同行为，移动到未完成列表
							this.chosenBehaviors.unshift(action);
							this.completedBehaviors.splice(idx, 1);
						} else {
							// 未完成列表存在相同行为，提示用户
							uni.showToast({
								title: "该行为已在未完成列表中",
								icon: "none",
								duration: 2000,
							});
						}
					} else {
						// 非重复行为，移动到未完成列表
						const [chosenAction] = this.completedBehaviors.splice(idx, 1);
						chosenAction.completed = false;
						this.chosenBehaviors.unshift(chosenAction);
						uni.showToast({
							title: "行为已恢复为未完成",
							icon: "none",
							duration: 2000,
						});
						this.currentScrollId = `behavior-chosen-0`;
					}
				}
				this.updatePlanInStorage();
			},

			loadBehaviorsFromStorage() {
				let plans = uni.getStorageSync('plans');
				if (plans) {
					plans = JSON.parse(plans);
					const currentPlan = plans.find(p => p.id === this.plan.id);
					if (currentPlan && currentPlan.chosenBehaviors) {
						this.chosenBehaviors = currentPlan.chosenBehaviors;
					}
					if (currentPlan && currentPlan.completedBehaviors) {
						this.completedBehaviors = currentPlan.completedBehaviors;
					}
				}
			},
			updatePlanInStorage() {
				let plans = uni.getStorageSync('plans');
				if (plans) {
					plans = JSON.parse(plans);
					const planIndex = plans.findIndex(p => p.id === this.plan.id);
					if (planIndex > -1) {
						plans[planIndex] = {
							...this.plan,
							chosenBehaviors: this.chosenBehaviors,
							completedBehaviors: this.completedBehaviors
						};
						uni.setStorageSync('plans', JSON.stringify(plans));
					}
				}
			},
			// 显示目标编辑模态框
			showGoalModal() {
				this.showGoalModal = true;
			},
			// 关闭目标编辑模态框
			closeGoalModal() {
				this.showGoalModalone = false;
			},
			// 处理目标编辑模态框的确认
			handleGoalConfirm(updatedPlan) {
				this.plan = { ...this.plan, ...updatedPlan };
				this.updatePlanInStorage();
				this.closeGoalModal();
			},
			// 处理目标删除
			handleGoalDelete() {
				let plans = uni.getStorageSync('plans');
				if (plans) {
					plans = JSON.parse(plans);
					const planIndex = plans.findIndex(p => p.id === this.plan.id);
					if (planIndex > -1) {
						plans.splice(planIndex, 1);
						uni.setStorageSync('plans', JSON.stringify(plans));
						uni.navigateBack();
					}
				}
			}
		}
	}
</script>


<style scoped lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		background-color: #f0f2f5;
		max-height: 100vh;
		overflow: hidden;
		position: relative;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.card,
	.goal-card {
		background: #fff;
		border-radius: 15rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 15rpx;
		padding: 20rpx;
	}

	.goal-card {
		text-align: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
	}

	.goal-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		word-wrap: break-word;
		white-space: normal;
		max-width: 100%;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	uni-button:after {
		border: none;
	}
  button::after{ border: none;} 

.edit-goal-btn {
    border: none;
    background: transparent;
    font-size: 40rpx;
    color: #999;
    padding: 0;
    margin: 0;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
	padding-bottom: 20rpx; /* 尝试调整 padding-top */
    &:active {
        transform: scale(0.9);
    }
    // &::before {
    //     content: "...";
        
    // }
}



	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.header-buttons {
		display: flex;
		gap: 8rpx;
	}

	.tag-section {
		position: relative;
		margin-bottom: 15rpx;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		padding-bottom: 30rpx;
	}

	.tag-item {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background: #e0e0e0;
		border-radius: 20rpx;
		font-size: 28rpx;
		transition: background 0.3s, transform 0.2s;
		cursor: pointer;
		white-space: normal;
		word-wrap: break-word;
		overflow: visible;
		text-overflow: unset;

		&:active {
			// background: #d0d0d0;
			transform: scale(0.98);
		}
	}

	.fade-out {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 30rpx;
		background: linear-gradient(to top, rgba(240, 242, 245, 1), rgba(240, 242, 245, 0));
		pointer-events: none;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #444;
	}

	.bold-title {
		font-weight: 700;
	}

	.reexplore-btn,
	.clear-tags-btn,
	// .add-action-btn,
	.confirm-btn,
	.cancel-btn,
	.behavior-btn {
		border: none;
		border-radius: 15rpx;
		padding: 8rpx 20rpx;
		font-size: 26rpx;
		transition: background 0.3s, transform 0.2s;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50rpx;
		line-height: 1;
		color: #fff;
	}

	.reexplore-btn {
		background: #52c41a;

		&:active {
			background: #389e0d;
			transform: scale(0.98);
		}
	}

	.clear-tags-btn {
		background: #ff4d4f;

		&:active {
			background: #d9363e;
			transform: scale(0.98);
		}
	}

	// .add-action-btn {
	// 	background: #1890ff;

	// 	&:active {
	// 		background: #096dd9;
	// 		transform: scale(0.98);
	// 	}
	// }

	.input-container {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background: #fff;
		border-radius: 15rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		margin: 10rpx 20rpx;
		gap: 10rpx;
	}

	.action-input {
		flex: 1;
		padding: 4rpx 10rpx;
		border: 1rpx solid #d9d9d9;
		border-radius: 10rpx;
		font-size: 26rpx;
		height: 40rpx;
		line-height: 1;
	}

	.button-group {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10rpx;
	}

	.confirm-btn {
		background: #52c41a;

		&:hover {
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.cancel-btn {
		background: #ff4d4f;

		&:hover {
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.behavior-section {
		flex: 1;
		background: #fff;
		padding: 20rpx;
		overflow-y: auto;
		border-radius: 15rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		box-sizing: border-box;
	}

	.behavior-card {
		display: flex;
		align-items: flex-start;
		margin-bottom: 15rpx;
		padding: 15rpx;
		border-radius: 10rpx;
		background: #fff;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		opacity: 1;
		transition: all 0.3s ease;
	}

	.behavior-card.completed-card {
		background: #f0f0f0;
		color: #999;
	}

	.checkbox {
		margin-right: 16rpx;
		font-size: 28rpx;
		cursor: pointer;
		user-select: none;
	}

	.checkbox-icon {
		font-size: 32rpx;
		color: #52c41a;
	}

	.behavior-content {
		flex: 1;
	}

	.behavior-title {
		font-size: 30rpx;
		margin-bottom: 10rpx;
		font-weight: bold;
		color: #333;
		word-break: break-word;
	}

	.behavior-options {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 10rpx;
		margin-top: 10rpx;
		align-items: center;
	}

	.behavior-btn {
		border-radius: 12rpx;
		font-size: 26rpx;
		line-height: 1;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease, transform 0.2s ease;
		cursor: pointer;
		padding: 10rpx 20rpx;
		border: 1rpx solid transparent;

		&:hover {
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.98);
		}
	}

	.behavior-btn.primary {
		background: #1890ff;
		color: #fff;
	}

	.behavior-btn.secondary {
		background: transparent;
		color: #1890ff;
		border-color: #1890ff;
	}

	.behavior-btn.danger {
		background: transparent;
		color: #ff4d4f;
		border-color: #ff4d4f;
	}

	.completed-header {
		padding: 10rpx 0;
	}

	.behavior-header {
		display: flex;
		justify-content: space-between;
		/* 使元素两端对齐 */
		align-items: center;
		/* 垂直居中对齐 */
		padding: 20rpx;
		/* 添加内边距，与 .card-header 保持一致 */
		background: #fff;
		/* 添加背景色，与 .card-header 保持一致 */
		border-radius: 15rpx;
		/* 添加圆角，与 .card-header 保持一致 */
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		/* 添加阴影，与 .card-header 保持一致 */
		margin-bottom: 15rpx;
		/* 添加下外边距，与 .card-header 保持一致 */
	}

	.add-action-btn {
		margin: 0;
		/* 移除按钮的默认 margin */
		border: none;
		border-radius: 15rpx;
		padding: 8rpx 20rpx;
		font-size: 26rpx;
		transition: background 0.3s, transform 0.2s;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50rpx;
		line-height: 1;
		color: #fff;
		background: #1890ff;

		&:active {
			background: #096dd9;
			transform: scale(0.98);
		}
	}


	.completed-header .section-title {
		color: #555;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 120px;
	}

	.loading-gif {
		width: 100px;
		height: 128px;
		margin-bottom: 10rpx;
	}

	.loading-text {
		font-size: 28rpx;
		color: #888;
	}
</style>
