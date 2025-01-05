<template>
	<view class="behaviors-container">
		<!-- 锚点信息 -->
		<view class="anchor-info">
			<view class="anchor-name">{{ anchorInfo.name }}</view>
			<view class="anchor-time" v-if="anchorInfo.hour">{{ padZero(anchorInfo.hour) }}:{{ padZero(anchorInfo.minute) }}</view>
		</view>

		<!-- 行为列表 -->
		<scroll-view scroll-y class="behavior-list" scroll-with-animation="true">
			<up-swipe-action v-for="(item, index) in behaviorList" :key="item.id" class="my-swipe-action">
				<up-swipe-action-item
					:options="[{ text: '删除', style: { backgroundColor: '#dd524d', } }]"
					@click="handleSwipeOptionClick(index)"
				>
					<view class="behavior-item">
						<view class="behavior-index">{{ index + 1 }}</view>
						<view class="behavior-content">
							<view class="behavior-name">{{ item.name }}</view>
							<view class="behavior-desc">{{ item.description }}</view>
						</view>
					</view>
				</up-swipe-action-item>
			</up-swipe-action>
		</scroll-view>
		<!-- 拖动提示 -->

		<!-- 返回行为探索页面的悬浮按钮 -->
		<!-- <view class="back-btn" @tap="goBackToExplore">
			<text class="back-icon">←</text>
		</view> -->
	</view>
</template>

<script>
import { getBehaviorList } from '@/utils/api'; // 引入 getBehaviorList 函数

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
		// components: {
		// 	upSwipeAction,
		// 	upSwipeActionItem
		// },
		data() {
			return {
				anchorInfo: {
					name: '',
					hour: undefined,
					minute: undefined
				},
				behaviorList: [],
				// draggingIndex: null, // 移除拖拽相关
				// startY: 0,
				// scrollOffset: 0,
				// lastScrollTop: 0,
				// itemHeights: [], // 移除拖拽相关
				tempBehaviorList: [], // 临时保存行为列表
			}
		},

		onLoad(options) {
			// 获取传递过来的锚点信息
			if (options.anchor) {
				this.anchorInfo = JSON.parse(options.anchor)
				// 获取该锚点下的行为列表
				this.getBehaviorList()
			}
		},
		onUnload() {
			// 页面卸载时保存临时数据
			this.saveTempBehaviorList();
		},
		mounted() {
			// this.calculateItemHeights(); // 移除拖拽相关
		},
		updated() {
			// this.calculateItemHeights(); // 移除拖拽相关
		},
		onShow() {
			// 获取用户的邮箱
			const email = uni.getStorageSync('userEmail');
			console.log(email, this.anchorInfo.name)
			if (email && this.anchorInfo.name) {
				// 使用 encodeURIComponent 对 anchorInfo.name 进行编码
				const encodedAnchorName = encodeURIComponent(this.anchorInfo.name);
				getBehaviorList(email, encodedAnchorName)
					.then(response => {
						// console.log(response, "99999");
						if (response.success) {
							this.behaviorList = response.data[0].behaviorList; // 更新 behaviorList
						} else {
							uni.showToast({
								title: response.data.message,
								icon: 'none'
							});
						}
					})
					.catch(error => {
						// console.error('获取行为列表失败', error);
						// uni.showToast({
						// 	title: '获取行为列表失败，请检查网络',
						// 	icon: 'none'
						// });
					});
			}
		},
		methods: {
			// 补零函数
			padZero(num) {
				return String(num).padStart(2, '0')
			},

			// 获取行为列表
			getBehaviorList() {
				// 这里替换为实际的获取行为列表的逻辑
				this.behaviorList = [

				]
				this.loadTempBehaviorList();
			},
			// 加载临时保存的行为列表
			loadTempBehaviorList() {
				const tempKey = `tempBehaviorList_${this.anchorInfo.name}`;
				const savedList = uni.getStorageSync(tempKey);
				if (savedList) {
					this.behaviorList = savedList;
				}
			},
			// 保存临时保存的行为列表
			saveTempBehaviorList() {
				const tempKey = `tempBehaviorList_${this.anchorInfo.name}`;
				uni.setStorageSync(tempKey, this.behaviorList);
			},
			// 删除行为 (通过 swipe action)
			handleSwipeOptionClick(index) {
				uni.showModal({
					title: '提示',
					content: '确定要删除这个行为吗？',
					success: (res) => {
						if (res.confirm) {
							this.behaviorList.splice(index, 1)
							// 这里添加实际的删除逻辑
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
							this.saveTempBehaviorList();
							this.uploadBehaviors(); // Call uploadBehaviors after deletion
						}
					}
				})
			},
			// 上传行为数据
			async uploadBehaviors() {
				const email = uni.getStorageSync('userEmail'); // 从本地存储获取邮箱
				if (!email) {
					// uni.showToast({
					//   title: '请先设置邮箱',
					//   icon: 'none'
					// });
					return;
				}

				const allBehaviors = [];
				const keys = uni.getStorageInfoSync().keys;
				keys.forEach(key => {
					if (key.startsWith('tempBehaviorList_')) {
						const anchorName = key.replace('tempBehaviorList_', '');
						const behaviorList = uni.getStorageSync(key);
						if (behaviorList && behaviorList.length > 0) {
							// Get the time from the anchor info
							const anchorTime = this.getAnchorTime(anchorName);
							allBehaviors.push({
								anchorName: anchorName,
								behaviorList: behaviorList,
								time: anchorTime
							});
						}
					}
				});
				// if (allBehaviors.length === 0) {
				//   uni.showToast({
				//     title: '没有需要上传的行为数据',
				//     icon: 'none'
				//   });
				//   return;
				// }
				// uni.showLoading({
				// 	title: '上传中...'
				// });
				try {
					const res = await uni.request({
						url: 'https://tip.yjdweb.cn/api/uploadBehaviors', // 替换为你的上传接口地址
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						data: {
							email: email,
							behaviors: allBehaviors
						}
					});
					uni.hideLoading();
					if (res.statusCode === 200 && res.data.code === 200) {
						// uni.showToast({
						// 	title: '上传成功',
						// 	icon: 'success'
						// });
					} else {
						// uni.showToast({
						// 	title: '上传失败',
						// 	icon: 'none'
						// });
					}
				} catch (error) {
					uni.hideLoading();
					// uni.showToast({
					// 	title: '上传失败，请检查网络',
					// 	icon: 'none'
					// });
					console.error('上传失败', error);
				}
			},
			// Helper function to get the time for a given anchor name
			getAnchorTime(anchorName) {
				if (this.anchorInfo.name === anchorName) {
					return `${this.padZero(this.anchorInfo.hour)}:${this.padZero(this.anchorInfo.minute)}`;
				}
				return null; // Or handle cases where the anchor name doesn't match
			},

			// // 拖拽开始 // 移除拖拽相关
			// handleTouchStart(e, index) {
			// 	this.draggingIndex = index;
			// 	this.startY = e.touches[0].clientY;
			// 	this.behaviorList[index].isDragging = true;
			// 	this.calculateItemHeights();
			// },

			// // 拖拽移动 // 移除拖拽相关
			// handleTouchMove(e, index) {
			// 	if (this.draggingIndex === null) return;
			// 	const moveY = e.changedTouches[0].clientY;
			// 	const diffY = moveY - this.startY;
			// 	this.behaviorList[index].translateY = diffY;
			// 	this.moveItem(index, diffY)
			// },

			// // 拖拽结束 // 移除拖拽相关
			// handleTouchEnd(e, index) {
			// 	if (this.draggingIndex === null) return;
			// 	this.behaviorList[index].isDragging = false;
			// 	this.behaviorList[index].translateY = 0;
			// 	this.draggingIndex = null;
			// 	this.sortList()
			// 	this.saveTempBehaviorList();
			// },

			// // 移动元素 // 移除拖拽相关
			// moveItem(currentIndex, diffY) {
			// 	let targetIndex = currentIndex;
			// 	let movedDistance = 0;

			// 	if (diffY > 0) { // 向下拖动
			// 		for (let i = currentIndex + 1; i < this.behaviorList.length; i++) {
			// 			movedDistance += this.itemHeights[i - 1];
			// 			if (diffY > movedDistance) {
			// 				targetIndex = i;
			// 			} else {
			// 				break;
			// 			}
			// 		}
			// 	} else if (diffY < 0) { // 向上拖动
			// 		for (let i = currentIndex - 1; i >= 0; i--) {
			// 			movedDistance += this.itemHeights[i];
			// 			if (-diffY > movedDistance) {
			// 				targetIndex = i;
			// 			} else {
			// 				break;
			// 			}
			// 		}
			// 	}

			// 	if (targetIndex !== currentIndex) {
			// 		const temp = this.behaviorList.splice(currentIndex, 1)[0];
			// 		this.behaviorList.splice(targetIndex, 0, temp);
			// 		this.draggingIndex = targetIndex;
			// 		this.startY = this.startY + (targetIndex > currentIndex ? movedDistance : -movedDistance);
			// 	}
			// },

			// // 排序列表 // 移除拖拽相关
			// sortList() {
			// 	this.behaviorList.forEach(item => {
			// 		item.translateY = 0
			// 	})
			// },

			// 监听滚动事件
			// handleScroll(e) { // 移除拖拽相关
			// 	this.scrollOffset = e.detail.scrollTop;
			// 	this.lastScrollTop = e.detail.scrollTop;
			// },
			// 返回行为探索页面
			goBackToExplore() {
				uni.navigateBack({
					delta: 2 // 返回前两页
				})
			},
			// 计算每个 item 的高度 // 移除拖拽相关
			// calculateItemHeights() {
			// 	const query = uni.createSelectorQuery().in(this);
			// 	query.selectAll('.behavior-item').boundingClientRect(data => {
			// 		this.itemHeights = data.map(item => item.height);
			// 	}).exec();
			// }
		}
	}
</script>




<style lang="scss" scoped>
	.behaviors-container {
		padding: 20rpx;
		background-color: #f8f8f8;
		/* 添加背景色 */
		max-height: 100vh;
		/* 确保容器至少占据整个视口高度 */
		box-sizing: border-box;
		/* 添加这一行 */
		/* overflow: hidden;  移除这一行 */
		/* 禁止页面整体滚动 */

		.anchor-info {
			background: #fff;
			padding: 30rpx;
			border-radius: 16rpx;
			/* 增加圆角 */
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
			/* 添加阴影 */

			.anchor-name {
				font-size: 34rpx;
				/* 稍微增大字体 */
				font-weight: 600;
				/* 加粗字体 */
				// margin-bottom: 12rpx;
				color: #333;
				/* 深色文字 */
			}

			.anchor-time {
				font-size: 28rpx;
				color: #888;
				/* 稍微浅色 */
			}
		}

		.behavior-list {
			/* height: 600rpx;  移除这一行 */
			height: calc(100vh - 200rpx);
			/* 添加这一行 */
			overflow-y: auto;
			// padding: 0 10rpx;
			/* 增加左右内边距 */

			.my-swipe-action {
				margin-bottom: 20rpx;
				border-radius: 16rpx;
				overflow: hidden; // 确保 swipe action item 的圆角生效
			}

			.behavior-item {
				background: #fff;
				padding: 20rpx;
				/* border-radius: 16rpx; 移到 swipe action 上 */
				display: flex;
				justify-content: space-between;
				align-items: center;
				transition: all 0.3s ease;
				position: relative;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
				/* 添加阴影 */
				margin-bottom: 0; // 移除 behavior-item 的 margin-bottom，防止双重 margin

				.behavior-index {
					width: 40rpx;
					text-align: center;
					font-size: 30rpx;
					color: #333;
					margin-right: 10rpx;
				}

				.behavior-content {
					flex: 1;

					.behavior-name {
						font-size: 30rpx;
						// margin-bottom: 8rpx;
						color: #333;
						/* 深色文字 */
					}

					.behavior-desc {
						font-size: 26rpx;
						color: #888;
						/* 稍微浅色 */
					}
				}
			}
		}

		.drag-tips {
			text-align: center;
			color: #999;
			font-size: 24rpx;
			margin-top: 10rpx;
		}

		.back-btn {
			position: fixed;
			right: 40rpx;
			bottom: 40rpx;
			width: 100rpx;
			height: 100rpx;
			background: #007AFF;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
			transition: all 0.3s ease;
			z-index: 100;
			/* 提高层级 */

			.back-icon {
				color: #fff;
				font-size: 60rpx;
				font-weight: 300;
				line-height: 60rpx;
				margin-top: -4rpx;
				margin-left: -2rpx;
			}
		}

		.back-btn:active {
			transform: scale(0.95);
		}
	}
</style>
