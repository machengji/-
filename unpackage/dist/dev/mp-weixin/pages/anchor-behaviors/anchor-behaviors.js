"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  // components: {
  // 	upSwipeAction,
  // 	upSwipeActionItem
  // },
  data() {
    return {
      anchorInfo: {
        name: "",
        hour: void 0,
        minute: void 0
      },
      behaviorList: [],
      // draggingIndex: null, // 移除拖拽相关
      // startY: 0,
      // scrollOffset: 0,
      // lastScrollTop: 0,
      // itemHeights: [], // 移除拖拽相关
      tempBehaviorList: []
      // 临时保存行为列表
    };
  },
  onLoad(options) {
    if (options.anchor) {
      this.anchorInfo = JSON.parse(options.anchor);
      this.getBehaviorList();
    }
  },
  onUnload() {
    this.saveTempBehaviorList();
  },
  mounted() {
  },
  updated() {
  },
  onShow() {
    const email = common_vendor.index.getStorageSync("userEmail");
    common_vendor.index.__f__("log", "at pages/anchor-behaviors/anchor-behaviors.vue:97", email, this.anchorInfo.name);
    if (email && this.anchorInfo.name) {
      const encodedAnchorName = encodeURIComponent(this.anchorInfo.name);
      utils_api.getBehaviorList(email, encodedAnchorName).then((response) => {
        if (response.success) {
          this.behaviorList = response.data[0].behaviorList;
        } else {
          common_vendor.index.showToast({
            title: response.data.message,
            icon: "none"
          });
        }
      }).catch((error) => {
      });
    }
  },
  methods: {
    // 补零函数
    padZero(num) {
      return String(num).padStart(2, "0");
    },
    // 获取行为列表
    getBehaviorList() {
      this.behaviorList = [];
      this.loadTempBehaviorList();
    },
    // 加载临时保存的行为列表
    loadTempBehaviorList() {
      const tempKey = `tempBehaviorList_${this.anchorInfo.name}`;
      const savedList = common_vendor.index.getStorageSync(tempKey);
      if (savedList) {
        this.behaviorList = savedList;
      }
    },
    // 保存临时保存的行为列表
    saveTempBehaviorList() {
      const tempKey = `tempBehaviorList_${this.anchorInfo.name}`;
      common_vendor.index.setStorageSync(tempKey, this.behaviorList);
    },
    // 删除行为 (通过 swipe action)
    handleSwipeOptionClick(index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这个行为吗？",
        success: (res) => {
          if (res.confirm) {
            this.behaviorList.splice(index, 1);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            this.saveTempBehaviorList();
            this.uploadBehaviors();
          }
        }
      });
    },
    // 上传行为数据
    async uploadBehaviors() {
      const email = common_vendor.index.getStorageSync("userEmail");
      if (!email) {
        return;
      }
      const allBehaviors = [];
      const keys = common_vendor.index.getStorageInfoSync().keys;
      keys.forEach((key) => {
        if (key.startsWith("tempBehaviorList_")) {
          const anchorName = key.replace("tempBehaviorList_", "");
          const behaviorList = common_vendor.index.getStorageSync(key);
          if (behaviorList && behaviorList.length > 0) {
            const anchorTime = this.getAnchorTime(anchorName);
            allBehaviors.push({
              anchorName,
              behaviorList,
              time: anchorTime
            });
          }
        }
      });
      try {
        const res = await common_vendor.index.request({
          url: "https://tip.yjdweb.cn/api/uploadBehaviors",
          // 替换为你的上传接口地址
          method: "POST",
          header: {
            "Content-Type": "application/json"
          },
          data: {
            email,
            behaviors: allBehaviors
          }
        });
        common_vendor.index.hideLoading();
        if (res.statusCode === 200 && res.data.code === 200) {
        } else {
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/anchor-behaviors/anchor-behaviors.vue:236", "上传失败", error);
      }
    },
    // Helper function to get the time for a given anchor name
    getAnchorTime(anchorName) {
      if (this.anchorInfo.name === anchorName) {
        return `${this.padZero(this.anchorInfo.hour)}:${this.padZero(this.anchorInfo.minute)}`;
      }
      return null;
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
      common_vendor.index.navigateBack({
        delta: 2
        // 返回前两页
      });
    }
    // 计算每个 item 的高度 // 移除拖拽相关
    // calculateItemHeights() {
    // 	const query = uni.createSelectorQuery().in(this);
    // 	query.selectAll('.behavior-item').boundingClientRect(data => {
    // 		this.itemHeights = data.map(item => item.height);
    // 	}).exec();
    // }
  }
};
if (!Array) {
  const _easycom_up_swipe_action_item2 = common_vendor.resolveComponent("up-swipe-action-item");
  const _easycom_up_swipe_action2 = common_vendor.resolveComponent("up-swipe-action");
  (_easycom_up_swipe_action_item2 + _easycom_up_swipe_action2)();
}
const _easycom_up_swipe_action_item = () => "../../uni_modules/uview-plus/components/u-swipe-action-item/u-swipe-action-item.js";
const _easycom_up_swipe_action = () => "../../uni_modules/uview-plus/components/u-swipe-action/u-swipe-action.js";
if (!Math) {
  (_easycom_up_swipe_action_item + _easycom_up_swipe_action)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.anchorInfo.name),
    b: $data.anchorInfo.hour
  }, $data.anchorInfo.hour ? {
    c: common_vendor.t($options.padZero($data.anchorInfo.hour)),
    d: common_vendor.t($options.padZero($data.anchorInfo.minute))
  } : {}, {
    e: common_vendor.f($data.behaviorList, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.description),
        d: common_vendor.o(($event) => $options.handleSwipeOptionClick(index), item.id),
        e: "42e14a12-1-" + i0 + "," + ("42e14a12-0-" + i0),
        f: item.id,
        g: "42e14a12-0-" + i0
      };
    }),
    f: common_vendor.p({
      options: [{
        text: "删除",
        style: {
          backgroundColor: "#dd524d"
        }
      }]
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-42e14a12"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/anchor-behaviors/anchor-behaviors.js.map
