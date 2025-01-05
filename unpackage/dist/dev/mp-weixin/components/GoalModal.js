"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    plan: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      editedPlan: {
        name: "",
        description: ""
      }
    };
  },
  watch: {
    plan: {
      handler(newPlan) {
        this.editedPlan = { ...newPlan };
      },
      immediate: true
    },
    visible(newValue, oldValue) {
      common_vendor.index.__f__("log", "at components/GoalModal.vue:57", "GoalModal visible changed:", oldValue, "=>", newValue);
    }
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    confirmEdit() {
      this.$emit("confirm", this.editedPlan);
    },
    deleteGoal() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个愿望吗？",
        success: (res) => {
          if (res.confirm) {
            this.$emit("delete");
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    c: $data.editedPlan.name,
    d: common_vendor.o(($event) => $data.editedPlan.name = $event.detail.value),
    e: $data.editedPlan.description,
    f: common_vendor.o(($event) => $data.editedPlan.description = $event.detail.value),
    g: common_vendor.o((...args) => $options.deleteGoal && $options.deleteGoal(...args)),
    h: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    i: common_vendor.o((...args) => $options.confirmEdit && $options.confirmEdit(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ed2b2257"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/GoalModal.js.map
