"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      email: "",
      showModal: false,
      timeRange: Array.from({ length: 24 }, (_, i) => i),
      minuteRange: Array.from({ length: 60 }, (_, i) => i),
      newAnchor: {
        name: "",
        hour: null,
        minute: null
      },
      anchorList: [],
      todaysAnchor: null
    };
  },
  onShow() {
    this.email = common_vendor.index.getStorageSync("userEmail") || "";
    if (this.email) {
      this.loadAnchorList();
    } else {
      common_vendor.index.showToast({
        title: "请先设置邮箱",
        icon: "none"
      });
    }
  },
  methods: {
    updateTodaysAnchor() {
      const today = /* @__PURE__ */ new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      this.todaysAnchor = {
        name: `${formattedDate} 今日微小安排`,
        hour: null,
        minute: null
      };
      this.anchorList = this.anchorList.filter((anchor) => !anchor.name.includes("今日微小安排"));
      this.anchorList.unshift(this.todaysAnchor);
      this.saveAnchorList();
    },
    async loadAnchorList() {
      if (!this.email)
        return;
      try {
        const res = await utils_api.getAnchorList(this.email);
        common_vendor.index.__f__("log", "at pages/createPlan/createPlan.vue:115", res, "84444118888");
        if (res.code === 200) {
          this.anchorList = res.data || [];
          common_vendor.index.setStorageSync("anchorList", this.anchorList);
        } else {
          const savedList = common_vendor.index.getStorageSync("anchorList");
          this.anchorList = savedList || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/createPlan/createPlan.vue:124", "获取锚点列表失败:", error);
        const savedList = common_vendor.index.getStorageSync("anchorList");
        this.anchorList = savedList || [];
      }
      this.updateTodaysAnchor();
    },
    saveAnchorList() {
      common_vendor.index.setStorageSync("anchorList", this.anchorList);
    },
    toggleModal() {
      this.showModal = !this.showModal;
      if (!this.showModal) {
        this.newAnchor = {
          name: "",
          hour: null,
          minute: null
        };
      }
    },
    goToBehaviors(anchor) {
      common_vendor.index.navigateTo({
        url: `/pages/anchor-behaviors/anchor-behaviors?anchor=${JSON.stringify(anchor)}`
      });
    },
    padZero(num) {
      return num.toString().padStart(2, "0");
    },
    onTimeChange(event) {
      const [hour, minute] = event.detail.value;
      this.newAnchor.hour = parseInt(hour);
      this.newAnchor.minute = parseInt(minute);
    },
    async addAnchor() {
      if (!this.newAnchor.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入锚点名称",
          icon: "none"
        });
        return;
      }
      if (!this.email) {
        common_vendor.index.showToast({
          title: "请先设置邮箱",
          icon: "none"
        });
        return;
      }
      this.anchorList.push({
        name: this.newAnchor.name,
        hour: this.newAnchor.hour,
        minute: this.newAnchor.minute
      });
      try {
        const res = await utils_api.saveAnchorList(this.email, this.anchorList);
        if (res.code === 200) {
          this.saveAnchorList();
          this.toggleModal();
          common_vendor.index.showToast({
            title: "添加成功",
            icon: "success"
          });
        } else {
          await this.loadAnchorList();
          common_vendor.index.showToast({
            title: "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/createPlan/createPlan.vue:202", "添加失败:", error);
        await this.loadAnchorList();
        common_vendor.index.showToast({
          title: "添加失败，请检查网络",
          icon: "none"
        });
      }
    },
    async deleteAnchor(index) {
      if (!this.email) {
        common_vendor.index.showToast({
          title: "请先设置邮箱",
          icon: "none"
        });
        return;
      }
      try {
        this.anchorList.splice(index, 1);
        const res = await utils_api.saveAnchorList(this.email, this.anchorList);
        if (res.code === 200) {
          this.saveAnchorList();
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
        } else {
          await this.loadAnchorList();
          common_vendor.index.showToast({
            title: "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/createPlan/createPlan.vue:237", "删除失败:", error);
        await this.loadAnchorList();
        common_vendor.index.showToast({
          title: "删除失败，请检查网络",
          icon: "none"
        });
      }
    },
    handleSwipeOptionClick(index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这个锚点吗？",
        success: (res) => {
          if (res.confirm) {
            this.deleteAnchor(index);
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_up_swipe_action_item2 = common_vendor.resolveComponent("up-swipe-action-item");
  const _easycom_up_swipe_action2 = common_vendor.resolveComponent("up-swipe-action");
  const _easycom_up_popup2 = common_vendor.resolveComponent("up-popup");
  (_easycom_up_swipe_action_item2 + _easycom_up_swipe_action2 + _easycom_up_popup2)();
}
const _easycom_up_swipe_action_item = () => "../../uni_modules/uview-plus/components/u-swipe-action-item/u-swipe-action-item.js";
const _easycom_up_swipe_action = () => "../../uni_modules/uview-plus/components/u-swipe-action/u-swipe-action.js";
const _easycom_up_popup = () => "../../uni_modules/uview-plus/components/u-popup/u-popup.js";
if (!Math) {
  (_easycom_up_swipe_action_item + _easycom_up_swipe_action + _easycom_up_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.anchorList.length === 0
  }, $data.anchorList.length === 0 ? {} : {}, {
    b: common_vendor.f($data.anchorList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: item.hour !== null && item.minute !== null
      }, item.hour !== null && item.minute !== null ? {
        c: common_vendor.t($options.padZero(item.hour)),
        d: common_vendor.t($options.padZero(item.minute))
      } : {}, {
        e: item.name.includes("今日微小安排") ? 1 : "",
        f: common_vendor.o(($event) => $options.goToBehaviors(item), index),
        g: common_vendor.o(($event) => $options.handleSwipeOptionClick(index), index),
        h: "ad7c18a5-1-" + i0 + "," + ("ad7c18a5-0-" + i0),
        i: index,
        j: "ad7c18a5-0-" + i0
      });
    }),
    c: common_vendor.p({
      options: [{
        text: "删除",
        style: {
          backgroundColor: "#dd524d"
        }
      }]
    }),
    d: $data.showModal ? 1 : "",
    e: common_vendor.o((...args) => $options.toggleModal && $options.toggleModal(...args)),
    f: $data.newAnchor.name,
    g: common_vendor.o(($event) => $data.newAnchor.name = $event.detail.value),
    h: $data.newAnchor.hour === null || $data.newAnchor.minute === null
  }, $data.newAnchor.hour === null || $data.newAnchor.minute === null ? {} : {
    i: common_vendor.t($options.padZero($data.newAnchor.hour)),
    j: common_vendor.t($options.padZero($data.newAnchor.minute))
  }, {
    k: [$data.timeRange, $data.minuteRange],
    l: [$data.newAnchor.hour, $data.newAnchor.minute],
    m: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args)),
    n: common_vendor.o((...args) => $options.toggleModal && $options.toggleModal(...args)),
    o: common_vendor.o((...args) => $options.addAnchor && $options.addAnchor(...args)),
    p: common_vendor.o($options.toggleModal),
    q: common_vendor.p({
      show: $data.showModal,
      round: 10
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ad7c18a5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createPlan/createPlan.js.map
