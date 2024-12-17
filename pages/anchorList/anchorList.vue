<!-- pages/anchor-list-no-delete/index.vue -->
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
			<view class="anchor-item" v-for="(item, index) in anchorList" :key="index" @tap="goToBehaviors(item)">
				<view class="anchor-content">
					<view class="anchor-name">{{ item.name }}</view>
					<view class="anchor-time" v-if="item.hour !== null && item.minute !== null">
						提醒时间: {{ padZero(item.hour) }}:{{ padZero(item.minute) }}
					</view>
				</view>
			</view>
		</view>

		<!-- 悬浮添加按钮 -->
		<view class="add-btn" :class="{ 'add-btn-active': showModal }" @tap="toggleModal">
			<text class="add-icon">+</text>
		</view>

		<!-- 添加锚点模态框 -->
		<view class="modal-mask" v-if="showModal" @tap="toggleModal"></view>
		<view class="modal-container" :class="{ 'modal-active': showModal }">
			<view class="modal-content">
				<view class="modal-title">添加生活锚点</view>
				<view class="input-group">
					<input class="input" type="text" v-model="newAnchor.name" placeholder="请输入锚点名称（如：早上刷牙后）" />
					<picker class="time-picker" mode="multiSelector" :range="[timeRange, minuteRange]"
						:value="[newAnchor.hour, newAnchor.minute]" @change="onTimeChange">
						<view class="picker-text">
							<text v-if="newAnchor.hour === null || newAnchor.minute === null">
								设置提醒时间（可选）
							</text>
							<text v-else>
								提醒时间：{{ padZero(newAnchor.hour) }}:{{ padZero(newAnchor.minute) }}
							</text>
						</view>
					</picker>
          
				</view>
        <view class="modal-tips">
					tips：设置时间后会通过邮箱消息提醒你。在我的页面里面选择提醒的邮箱
				</view>
				<view class="modal-btns">
					<button class="btn cancel" @tap="toggleModal">取消</button>
					<button class="btn confirm" @tap="addAnchor">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showModal: false,
				timeRange: Array.from({
					length: 24
				}, (_, i) => i),
				minuteRange: Array.from({
					length: 60
				}, (_, i) => i),
				newAnchor: {
					name: '',
					hour: null, // 初始值设为 null
					minute: null // 初始值设为 null
				},
				anchorList: [],
				tempBehavior: {} // 接收传递过来的行为列表
			}
		},
		onLoad(options) {
			this.loadAnchorList();
			if (options.anchor) {
				this.tempBehavior = JSON.parse(options.anchor);
				console.log('接收到的行为列表:', this.tempBehavior);
			}
		},
		methods: {
			loadAnchorList() {
				const savedList = uni.getStorageSync('anchorList');
				if (savedList) {
					this.anchorList = savedList;
				}
			},
			saveAnchorList() {
				uni.setStorageSync('anchorList', this.anchorList);
			},
			toggleModal() {
				this.showModal = !this.showModal
				if (!this.showModal) {
					this.newAnchor = {
						name: '',
						hour: null,
						minute: null
					}
				}
			},
			goToBehaviors(anchor) {
				uni.navigateTo({
					url: `/pages/anchor-behaviorsList/anchor-behaviorsList?anchor=${JSON.stringify(anchor)}&tempBehavior=${JSON.stringify(this.tempBehavior)}`
				})
			},
			padZero(num) {
				return num.toString().padStart(2, '0')
			},
			onTimeChange(e) {
				const [hour, minute] = e.detail.value
				this.newAnchor.hour = parseInt(hour)
				this.newAnchor.minute = parseInt(minute)
			},
			addAnchor() {
				if (!this.newAnchor.name.trim()) {
					uni.showToast({
						title: '请输入锚点名称',
						icon: 'none'
					})
					return
				}

				this.anchorList.push({
					name: this.newAnchor.name,
					hour: this.newAnchor.hour,
					minute: this.newAnchor.minute
				})

				this.saveAnchorList();
				this.toggleModal()

				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
			},
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

	.anchor-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 30rpx;
		background: #ffffff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
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
		margin-bottom: 10rpx;
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

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 999;
	}

	.modal-container {
		position: fixed;
		left: 50%;
		bottom: -100%;
		transform: translateX(-50%);
		width: 90%;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 1000;
		transition: all 0.3s;
	}

	.modal-active {
		bottom: 0;
	}

	.modal-content {
		padding: 40rpx;
	}

	.modal-title {
		font-size: 36rpx;
		font-weight: 500;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.input-group {
		margin-bottom: 20rpx;
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
		font-size: 24rpx;
		color: #999;
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
</style>
