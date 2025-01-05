"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      email: ""
      // 用于双向绑定邮箱输入框的值
    };
  },
  onLoad() {
    this.loadEmail();
  },
  onShareAppMessage() {
    return {
      title: "梦想笔记本",
      // 使用 "梦想起航" 作为推广名词
      path: "/pages/dreamList/dreamList",
      // 分享的页面路径
      imageUrl: "/static/WechatIMG169.jpg"
      // 使用静态分享图片
    };
  },
  methods: {
    navigateToManual() {
      common_vendor.index.navigateTo({
        url: "/pages/book/book"
        // 替换为你的使用手册页面路径
      });
    },
    navigateToAbout() {
      common_vendor.index.navigateTo({
        url: "/pages/about/about"
        // 替换为你的关于页面路径
      });
    },
    navigateTdream() {
      common_vendor.index.navigateTo({
        url: "/pages/dreamList/dreamList"
        // 替换为你的关于页面路径
      });
    },
    saveEmail() {
      common_vendor.index.setStorageSync("userEmail", this.email);
      common_vendor.index.showToast({
        title: "邮箱已保存",
        icon: "success",
        duration: 1e3
      });
    },
    loadEmail() {
      const savedEmail = common_vendor.index.getStorageSync("userEmail");
      if (savedEmail) {
        this.email = savedEmail;
      }
    }
  }
};
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $options.saveEmail && $options.saveEmail(...args)),
    c: $data.email,
    d: common_vendor.o(($event) => $data.email = $event.detail.value),
    e: common_vendor.p({
      type: "forward",
      size: "18",
      color: "#999"
    }),
    f: common_vendor.o((...args) => $options.navigateToManual && $options.navigateToManual(...args)),
    g: common_vendor.p({
      type: "forward",
      size: "18",
      color: "#999"
    }),
    h: common_vendor.o((...args) => $options.navigateTdream && $options.navigateTdream(...args)),
    i: common_vendor.p({
      type: "forward",
      size: "18",
      color: "#999"
    }),
    j: common_vendor.o((...args) => $options.navigateToAbout && $options.navigateToAbout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/anotherPage/anotherPage.js.map
