<!-- pages/anchor-list/index.vue -->
<template>
	<view class="anchor-list-container">
		<!-- 锚点列表 -->
		<view class="anchor-list">
			<!-- 当anchorList为空时显示提示信息 -->
			<view class="empty-list" v-if="anchorList.length === 0">
				<view class="empty-text">还没有添加锚点</view>
				<view class="empty-tips">
					tips：生活锚点是生活中一定会发生的事情，比如说早上起床、吃完午饭、晚上刷牙
				</view>
			</view>

			<up-swipe-action v-for="(item, index) in anchorList" :key="index" class="my-swipe-action">
				<up-swipe-action-item :options="[{ text: '删除', style: { backgroundColor: '#dd524d', } }]"
					@click="handleSwipeOptionClick(index)">
					<view class="anchor-item" :class="{ 'todays-anchor': item.name.includes('今日微小安排') }"
						@tap="goToBehaviors(item)">
						<view class="anchor-content">
							<view class="anchor-name">{{ item.name }}</view>
							<view class="anchor-time" v-if="item.hour !== null && item.minute !== null">
								提醒时间: {{ padZero(item.hour) }}:{{ padZero(item.minute) }}
							</view>
						</view>
					</view>
				</up-swipe-action-item>
			</up-swipe-action>
		</view>

		<!-- 悬浮添加按钮 -->
		<view class="add-btn" :class="{ 'add-btn-active': showModal }" @tap="toggleModal">
			<text class="add-icon">+</text>
		</view>

		<!-- 添加锚点模态框 -->
		<up-popup :show="showModal" @close="toggleModal" :round="10">
			<view class="modal-content">
				<view class="modal-title">添加生活锚点</view>
				<view class="input-group">
					<input class="input" type="text" v-model="newAnchor.name" placeholder="请输入锚点名称（如：早上刷牙后）" />

					<!-- 微信小程序使用 up-datetime-picker -->
					<!--  #ifdef  H5 || MP-WEIXIN-->
					<up-datetime-picker :show="showTimePicker" v-model="newAnchor.datetime" mode="datetime"
						@change="onTimeChange"></up-datetime-picker>



					<view class="picker-text" @click="showTimePicker = true">
						<text v-if="!newAnchor.datetime">
							设置提醒时间（可选）
						</text>
						<text v-else>
							提醒时间：{{ formatDateTime(newAnchor.datetime) }}
						</text>
					</view>
					<!-- 这里可以添加安卓特定的时间选择逻辑 -->
					<!--  #endif -->

				</view>
				<!--  #ifdef  H5 || MP-WEIXIN-->
				<view class="modal-tips">
					tips：设置时间后会通过邮箱消息提醒你。在我的页面里面选择提醒的邮箱
				</view>
				<!--  #endif -->
				<view class="modal-btns">
					<button class="btn cancel" @tap="toggleModal">取消</button>
					<button class="btn confirm" @tap="addAnchor">确定</button>
				</view>
			</view>
		</up-popup>
	</view>
</template>

<script>
	import {
		saveAnchorList,
		getAnchorList
	} from '@/utils/api.js';

	export default {
		data() {
			return {
				email: '',
				showModal: false,
				showTimePicker: false,
				newAnchor: {
					name: '',
					datetime: null
				},
				anchorList: [],
				todaysAnchor: null
			}
		},
		onShow() {
			this.email = uni.getStorageSync('userEmail') || '';
			if (this.email) {
				this.loadAnchorList();

			} else {
				uni.showToast({
					title: '请先设置邮箱',
					icon: 'none'
				});
			}
		},
		methods: {
			updateTodaysAnchor() {
				const today = new Date();
				const formattedDate =
					`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
				this.todaysAnchor = {
					name: `${formattedDate} 今日微小安排`,
					hour: null,
					minute: null
				};
				this.anchorList = this.anchorList.filter(anchor => !anchor.name.includes('今日微小安排'));
				this.anchorList.unshift(this.todaysAnchor);
				this.saveAnchorList();
			},
			async loadAnchorList() {
				if (!this.email) return;

				try {
					const res = await getAnchorList(this.email);
					console.log(res, "84444118888")
					if (res.code === 200) {
						this.anchorList = res.data || [];
						uni.setStorageSync('anchorList', this.anchorList);
					} else {
						const savedList = uni.getStorageSync('anchorList');
						this.anchorList = savedList || [];
					}
				} catch (error) {
					console.error('获取锚点列表失败:', error);
					const savedList = uni.getStorageSync('anchorList');
					this.anchorList = savedList || [];
				}
				this.updateTodaysAnchor();
			},
			saveAnchorList() {
				uni.setStorageSync('anchorList', this.anchorList);
			},
			toggleModal() {
				this.showModal = !this.showModal;
				if (!this.showModal) {
					this.newAnchor = {
						name: '',
						datetime: null
					}
				}
			},
			goToBehaviors(anchor) {
				uni.navigateTo({
					url: `/pages/anchor-behaviors/anchor-behaviors?anchor=${JSON.stringify(anchor)}`
				})
			},
			padZero(num) {
				return num.toString().padStart(2, '0')
			},
			onTimeChange(value) {
				this.newAnchor.datetime = value;
			},
			formatDateTime(datetime) {
				if (!datetime) return '';
				const date = new Date(datetime);
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			},
			async addAnchor() {
				if (!this.newAnchor.name.trim()) {
					uni.showToast({
						title: '请输入锚点名称',
						icon: 'none'
					});
					return;
				}

				if (!this.email) {
					uni.showToast({
						title: '请先设置邮箱',
						icon: 'none'
					});
					return;
				}

				this.anchorList.push({
					name: this.newAnchor.name,
					hour: this.newAnchor.hour,
					minute: this.newAnchor.minute
				});

				try {

					const res = await saveAnchorList(this.email, this.anchorList);


					if (res.code === 200) {

						this.saveAnchorList();

						this.toggleModal();

						uni.showToast({
							title: '添加成功',
							icon: 'success'
						});
					} else {
						await this.loadAnchorList();
						uni.showToast({
							title: '添加失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('添加失败:', error);
					await this.loadAnchorList();
					uni.showToast({
						title: '添加失败，请检查网络',
						icon: 'none'
					});
				}
			},
			async deleteAnchor(index) {
				if (!this.email) {
					uni.showToast({
						title: '请先设置邮箱',
						icon: 'none'
					});
					return;
				}

				try {
					this.anchorList.splice(index, 1);
					const res = await saveAnchorList(this.email, this.anchorList);

					if (res.code === 200) {
						this.saveAnchorList();
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					} else {
						await this.loadAnchorList();
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('删除失败:', error);
					await this.loadAnchorList();
					uni.showToast({
						title: '删除失败，请检查网络',
						icon: 'none'
					});
				}
			},
			handleSwipeOptionClick(index) {
				uni.showModal({
					title: '提示',
					content: '确定要删除这个锚点吗？',
					success: (res) => {
						if (res.confirm) {
							this.deleteAnchor(index);
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.anchor-list-container {
		padding: 20rpx;
		min-height: 100vh;
		background: #f5f5f5;
	}

	.anchor-list {
		padding-bottom: 120rpx;
	}

	.my-swipe-action {
		overflow: hidden;
		margin-bottom: 20rpx;
		/* This is the correct place */
	}

	.up-swipe-action-item {
		overflow: hidden;
		margin-bottom: 20rpx;
		/* Add this line */
		/* Add this to hide the swipe options by default */
	}

	.anchor-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: #ffffff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		/* 	margin-bottom: 20rpx; */
		position: relative;
		/* Ensure proper stacking context for swipe actions */
		z-index: 1;
		/* Ensure the content is above the swipe actions */
	}

	.anchor-item:active {
		transform: scale(0.98);
	}

	.anchor-content {
		flex: 1;
	}

	.anchor-name {
		font-size: 32rpx;
		color: #333;
		/* margin-bottom: 10rpx; */
	}

	.anchor-time {
		font-size: 26rpx;
		color: #666;
	}

	.add-btn {
		position: fixed;
		right: 40rpx;
		bottom: 40rpx;
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #ff5722, #ff9800);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 16rpx rgba(255, 87, 34, 0.3);
		transition: all 0.3s ease;
	}

	.add-btn:active {
		transform: scale(0.95);
	}

	.add-btn-active {
		transform: rotate(45deg);
		background: linear-gradient(135deg, #f44336, #ff5722);
	}

	.add-icon {
		color: #fff;
		font-size: 60rpx;
		font-weight: 300;
		line-height: 60rpx;
		margin-top: -4rpx;
		/* 微调加号垂直位置 */
		margin-left: -2rpx;
		/* 微调加号水平位置 */
	}

	.modal-content {
		padding: 20rpx;
	}

	.modal-title {
		font-size: 24rpx;
		font-weight: 500;
		text-align: center;
		margin-bottom: 10rpx;
	}

	.input-group {
		margin-bottom: 15rpx;
	}

	.input {
		/* width: 100%; */
		height: 80rpx;
		border: 2rpx solid #eee;
		border-radius: 8rpx;
		padding: 0 20rpx;
		margin-bottom: 20rpx;
	}

	.time-picker {
		/* width: 100%; */
		height: 80rpx;
		border: 2rpx solid #eee;
		border-radius: 8rpx;
		padding: 0 20rpx;
	}

	.picker-text {
		line-height: 80rpx;
		color: #333;
	}

	.modal-tips {
		font-size: 12rpx;
		color: #888;
		margin-bottom: 20rpx;
		text-align: center;

	}

	.modal-btns {
		display: flex;
		justify-content: space-between;
	}

	.btn {
		width: 45%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 8rpx;
		font-size: 32rpx;
	}

	.cancel {
		background: #f5f5f5;
		color: #666;
	}

	.confirm {
		background: #007AFF;
		color: #fff;
	}

	/* 空列表提示样式 */
	.empty-list {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}

	.empty-text {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.empty-tips {
		font-size: 28rpx;
		color: #ccc;
		text-align: center;
		line-height: 1.5;
	}

	.todays-anchor .anchor-name {
		font-weight: bold;
		color: #ff5722;
	}
</style>