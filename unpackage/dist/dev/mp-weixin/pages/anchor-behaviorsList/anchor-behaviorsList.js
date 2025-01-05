"use strict";
const common_vendor = require("../../common/vendor.js");
function deepClone(obj) {
  if (typeof obj !== "object" || obj === null) {
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
const _sfc_main = {
  data() {
    return {
      anchorInfo: {
        name: "",
        hour: void 0,
        minute: void 0
      },
      behaviorList: [],
      draggingIndex: null,
      startY: 0,
      scrollOffset: 0,
      lastScrollTop: 0,
      itemHeights: [],
      // 存储每个 item 的高度
      tempBehaviorList: [],
      // 临时保存行为列表
      tempBehavior: {
        name: ""
      }
      // 临时行为数据
    };
  },
  onLoad(options) {
    if (options.anchor) {
      this.anchorInfo = JSON.parse(options.anchor);
      common_vendor.index.__f__("log", "at pages/anchor-behaviorsList/anchor-behaviorsList.vue:92", this.anchorInfo);
      this.getBehaviorList();
    }
    if (options.tempBehavior) {
      this.tempBehavior = deepClone(JSON.parse(options.tempBehavior));
      common_vendor.index.__f__("log", "at pages/anchor-behaviorsList/anchor-behaviorsList.vue:98", "11", this.tempBehavior);
    }
  },
  onUnload() {
    this.saveTempBehaviorList();
  },
  mounted() {
    this.calculateItemHeights();
  },
  updated() {
    this.calculateItemHeights();
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
    // 添加行为
    addBehavior(name, description) {
      if (!name.trim()) {
        common_vendor.index.showToast({
          title: "请输入行为名称",
          icon: "none"
        });
        return;
      }
      const isDuplicate = this.behaviorList.some((item) => item.name === name);
      if (isDuplicate) {
        common_vendor.index.showToast({
          title: "该行为已存在",
          icon: "none"
        });
        return;
      }
      const newId = this.behaviorList.length > 0 ? Math.max(...this.behaviorList.map((item) => item.id)) + 1 : 1;
      this.behaviorList.push({
        id: newId,
        name,
        description,
        translateY: 0,
        isDragging: false
      });
      common_vendor.index.showToast({
        title: "添加成功",
        icon: "success"
      });
      this.saveTempBehaviorList();
    },
    // 删除行为
    deleteBehavior(index) {
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
    // 处理添加行为按钮点击事件
    handleAddBehavior() {
      this.addBehavior(this.tempBehavior.title, this.tempBehavior.description);
      this.uploadBehaviors();
    },
    // 上传行为数据
    // 上传行为数据
    async uploadBehaviors() {
      const email = common_vendor.index.getStorageSync("userEmail");
      if (!email) {
        common_vendor.index.showToast({
          title: "请先设置邮箱",
          icon: "none"
        });
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
        common_vendor.index.__f__("error", "at pages/anchor-behaviorsList/anchor-behaviorsList.vue:265", "上传失败", error);
      }
    },
    // Helper function to get the time for a given anchor name
    getAnchorTime(anchorName) {
      if (this.anchorInfo.name === anchorName) {
        return `${this.padZero(this.anchorInfo.hour)}:${this.padZero(this.anchorInfo.minute)}`;
      }
      return null;
    },
    // 拖拽开始
    handleTouchStart(e, index) {
      this.draggingIndex = index;
      this.startY = e.touches[0].clientY;
      this.behaviorList[index].isDragging = true;
      this.calculateItemHeights();
    },
    // 拖拽移动
    handleTouchMove(e, index) {
      if (this.draggingIndex === null)
        return;
      const moveY = e.changedTouches[0].clientY;
      const diffY = moveY - this.startY;
      this.behaviorList[index].translateY = diffY;
      this.moveItem(index, diffY);
    },
    // 拖拽结束
    handleTouchEnd(e, index) {
      if (this.draggingIndex === null)
        return;
      this.behaviorList[index].isDragging = false;
      this.behaviorList[index].translateY = 0;
      this.draggingIndex = null;
      this.sortList();
      this.saveTempBehaviorList();
    },
    // 移动元素
    moveItem(currentIndex, diffY) {
      let targetIndex = currentIndex;
      let movedDistance = 0;
      if (diffY > 0) {
        for (let i = currentIndex + 1; i < this.behaviorList.length; i++) {
          movedDistance += this.itemHeights[i - 1];
          if (diffY > movedDistance) {
            targetIndex = i;
          } else {
            break;
          }
        }
      } else if (diffY < 0) {
        for (let i = currentIndex - 1; i >= 0; i--) {
          movedDistance += this.itemHeights[i];
          if (-diffY > movedDistance) {
            targetIndex = i;
          } else {
            break;
          }
        }
      }
      if (targetIndex !== currentIndex) {
        const temp = this.behaviorList.splice(currentIndex, 1)[0];
        this.behaviorList.splice(targetIndex, 0, temp);
        this.draggingIndex = targetIndex;
        this.startY = this.startY + (targetIndex > currentIndex ? movedDistance : -movedDistance);
      }
    },
    // 排序列表
    sortList() {
      this.behaviorList.forEach((item) => {
        item.translateY = 0;
      });
    },
    // 监听滚动事件
    handleScroll(e) {
      this.scrollOffset = e.detail.scrollTop;
      this.lastScrollTop = e.detail.scrollTop;
    },
    // 返回行为探索页面
    goBackToExplore() {
      common_vendor.index.navigateBack({
        delta: 2
        // 返回前两页
      });
    },
    // 计算每个 item 的高度
    calculateItemHeights() {
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.selectAll(".behavior-item").boundingClientRect((data) => {
        this.itemHeights = data.map((item) => item.height);
      }).exec();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.anchorInfo.name),
    b: $data.anchorInfo.hour
  }, $data.anchorInfo.hour ? {
    c: common_vendor.t($options.padZero($data.anchorInfo.hour)),
    d: common_vendor.t($options.padZero($data.anchorInfo.minute))
  } : {}, {
    e: common_vendor.o((...args) => $options.handleAddBehavior && $options.handleAddBehavior(...args)),
    f: common_vendor.f($data.behaviorList, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.description),
        d: common_vendor.o(($event) => $options.deleteBehavior(index), item.id),
        e: item.id,
        f: common_vendor.o(($event) => $options.handleTouchStart($event, index), item.id),
        g: common_vendor.o(($event) => $options.handleTouchMove($event, index), item.id),
        h: common_vendor.o(($event) => $options.handleTouchEnd($event, index), item.id),
        i: item.translateY ? `translateY(${item.translateY}px)` : "",
        j: item.isDragging ? 0.5 : 1,
        k: item.isDragging ? 10 : 1,
        l: item.isDragging ? "none" : "transform 0.3s ease",
        m: index
      };
    }),
    g: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args)),
    h: common_vendor.o((...args) => $options.goBackToExplore && $options.goBackToExplore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bda5aa8d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/anchor-behaviorsList/anchor-behaviorsList.js.map
