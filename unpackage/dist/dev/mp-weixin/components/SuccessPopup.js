"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "action",
      // 'dream' or 'action'
      validator: (value) => ["dream", "action"].includes(value)
    }
  },
  data() {
    return {
      completionTime: "",
      badge: "",
      completedCount: 0,
      iconSrc: "/static/success-icon.png",
      rainbowFart: "稍等一下，彩虹屁马上就来！",
      isClosing: false
      // 用于控制关闭动画
    };
  },
  computed: {
    formattedCompletionTime() {
      return this.formatTime(this.completionTime);
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializePopup();
        this.isClosing = false;
      }
    }
  },
  methods: {
    initializePopup() {
      this.completionTime = /* @__PURE__ */ new Date();
      this.badge = this.type === "dream" ? "梦想家 🏅" : "初级行动者 🏅";
      this.updateCompletedCount();
      this.iconSrc = this.type === "dream" ? "/static/dream-icon.png" : "/static/success-icon.png";
      this.fetchRainbowFart();
    },
    formatTime(date) {
      if (!date)
        return "";
      const now = new Date(date);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    updateCompletedCount() {
      const storageKey = this.type === "dream" ? "completedDreams" : "completedActions";
      let completedItems = common_vendor.index.getStorageSync(storageKey) || [];
      completedItems.push({
        time: this.completionTime,
        description: this.description
      });
      common_vendor.index.setStorageSync(storageKey, completedItems);
      this.completedCount = completedItems.length;
    },
    closePopup() {
      this.isClosing = true;
      setTimeout(() => {
        this.$emit("close");
        this.isClosing = false;
      }, 300);
    },
    fireworkStyle(index) {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomSize = Math.random() * 5 + 2;
      const randomDelay = Math.random() * 2;
      const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      return {
        left: `${randomX}vw`,
        top: `${randomY}vh`,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        backgroundColor: randomColor,
        animationDelay: `${randomDelay}s`
      };
    },
    async fetchRainbowFart() {
      try {
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: "https://zenquotes.io/api/random",
            method: "GET",
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res.data);
              } else {
                reject(new Error(`HTTP error! status: ${res.statusCode}`));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        if (response && response.length > 0) {
          this.rainbowFart = `${response[0].q}！哇！你真是太棒了！`;
          setTimeout(() => {
            this.$nextTick(() => {
            });
          }, 100);
        } else {
          this.rainbowFart = "你太棒了！";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/SuccessPopup.vue:144", "Failed to fetch rainbow fart:", error);
        this.rainbowFart = "你太棒了！";
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: common_vendor.t($props.description),
    c: $data.rainbowFart
  }, $data.rainbowFart ? {
    d: common_vendor.t($data.rainbowFart)
  } : {}, {
    e: common_vendor.t($options.formattedCompletionTime),
    f: common_vendor.t($data.badge),
    g: common_vendor.t($data.completedCount),
    h: common_vendor.t($props.type === "dream" ? "梦想" : "小行为"),
    i: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args)),
    j: $data.isClosing ? 1 : "",
    k: $props.visible
  }, $props.visible ? {
    l: common_vendor.f(10, (n, k0, i0) => {
      return {
        a: n,
        b: common_vendor.s($options.fireworkStyle(n))
      };
    })
  } : {}, {
    m: $data.isClosing ? 1 : ""
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b17bdff1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/SuccessPopup.js.map
