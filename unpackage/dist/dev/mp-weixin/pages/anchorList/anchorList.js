"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
        name: "",
        hour: null,
        // 初始值设为 null
        minute: null
        // 初始值设为 null
      },
      anchorList: [],
      tempBehavior: {}
      // 接收传递过来的行为列表
    };
  },
  onLoad(options) {
    this.loadAnchorList();
    if (options.anchor) {
      this.tempBehavior = JSON.parse(options.anchor);
      console.log("接收到的行为列表:", this.tempBehavior);
    }
  },
  methods: {
    loadAnchorList() {
      const savedList = common_vendor.index.getStorageSync("anchorList");
      if (savedList) {
        this.anchorList = savedList;
      }
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
        url: `/pages/anchor-behaviorsList/anchor-behaviorsList?anchor=${JSON.stringify(anchor)}&tempBehavior=${JSON.stringify(this.tempBehavior)}`
      });
    },
    padZero(num) {
      return num.toString().padStart(2, "0");
    },
    onTimeChange(e) {
      const [hour, minute] = e.detail.value;
      this.newAnchor.hour = parseInt(hour);
      this.newAnchor.minute = parseInt(minute);
    },
    addAnchor() {
      if (!this.newAnchor.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入锚点名称",
          icon: "none"
        });
        return;
      }
      this.anchorList.push({
        name: this.newAnchor.name,
        hour: this.newAnchor.hour,
        minute: this.newAnchor.minute
      });
      this.saveAnchorList();
      this.toggleModal();
      common_vendor.index.showToast({
        title: "添加成功",
        icon: "success"
      });
    }
  }
};
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
        e: index,
        f: common_vendor.o(($event) => $options.goToBehaviors(item), index)
      });
    }),
    c: $data.showModal ? 1 : "",
    d: common_vendor.o((...args) => $options.toggleModal && $options.toggleModal(...args)),
    e: $data.showModal
  }, $data.showModal ? {
    f: common_vendor.o((...args) => $options.toggleModal && $options.toggleModal(...args))
  } : {}, {
    g: $data.newAnchor.name,
    h: common_vendor.o(($event) => $data.newAnchor.name = $event.detail.value),
    i: $data.newAnchor.hour === null || $data.newAnchor.minute === null
  }, $data.newAnchor.hour === null || $data.newAnchor.minute === null ? {} : {
    j: common_vendor.t($options.padZero($data.newAnchor.hour)),
    k: common_vendor.t($options.padZero($data.newAnchor.minute))
  }, {
    l: [$data.timeRange, $data.minuteRange],
    m: [$data.newAnchor.hour, $data.newAnchor.minute],
    n: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args)),
    o: common_vendor.o((...args) => $options.toggleModal && $options.toggleModal(...args)),
    p: common_vendor.o((...args) => $options.addAnchor && $options.addAnchor(...args)),
    q: $data.showModal ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5d331a9c"]]);
wx.createPage(MiniProgramPage);
