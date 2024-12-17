"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    action: {
      type: Object,
      default: () => ({
        title: "",
        repeat: false
      })
    }
  },
  data() {
    return {
      editedTitle: this.action.title,
      repeat: this.action.repeat || false
    };
  },
  watch: {
    action: {
      handler(newVal) {
        this.editedTitle = newVal.title;
        this.repeat = newVal.repeat || false;
      },
      deep: true
    }
  },
  methods: {
    toggleRepeat() {
      this.repeat = !this.repeat;
    },
    confirmEdit() {
      this.$emit("confirm", {
        title: this.editedTitle,
        repeat: this.repeat
      });
      this.closeModal();
    },
    cancelEdit() {
      this.closeModal();
    },
    closeModal() {
      this.$emit("close");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: $data.editedTitle,
    c: common_vendor.o(($event) => $data.editedTitle = $event.detail.value),
    d: common_vendor.t($data.repeat ? "✔️" : "⬜️"),
    e: $data.repeat ? 1 : "",
    f: common_vendor.o((...args) => $options.toggleRepeat && $options.toggleRepeat(...args)),
    g: common_vendor.o((...args) => $options.confirmEdit && $options.confirmEdit(...args)),
    h: common_vendor.o((...args) => $options.cancelEdit && $options.cancelEdit(...args)),
    i: $props.visible ? 1 : "",
    j: common_vendor.o(() => {
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4a6f6c1a"]]);
wx.createComponent(Component);
