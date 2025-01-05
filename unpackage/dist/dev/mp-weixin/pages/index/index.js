"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const SuccessPopup = () => "../../components/SuccessPopup.js";
const _sfc_main = {
  components: {
    SuccessPopup
  },
  data() {
    return {
      plans: [],
      isPopupVisible: false,
      isInputMode: false,
      showPopup: false,
      description: "",
      newPlanName: "",
      email: ""
      // 用于存储用户邮箱
    };
  },
  computed: {
    ongoingPlans() {
      return this.plans.filter((plan) => plan.status !== "已完成");
    },
    completedPlans() {
      return this.plans.filter((plan) => plan.status === "已完成");
    }
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/index/index.vue:111", "获取计划");
    this.email = common_vendor.index.getStorageSync("userEmail") || "";
    this.loadPlans();
  },
  methods: {
    expandInput() {
      this.isInputMode = true;
    },
    collapseInput() {
      this.isInputMode = false;
      this.newPlanName = "";
    },
    handleClosePopup() {
      this.showPopup = false;
    },
    navigateToPlanDetail(plan) {
      const planWithIsExplored = {
        ...plan,
        isExplored: plan.isExplored === void 0 ? false : plan.isExplored
      };
      common_vendor.index.__f__("log", "at pages/index/index.vue:131", planWithIsExplored);
      common_vendor.index.navigateTo({
        url: `/pages/exploringBehavior/exploringBehavior?plan=${JSON.stringify(planWithIsExplored)}`
      });
    },
    openInputPopup() {
      this.isPopupVisible = true;
    },
    closePopup() {
      this.isPopupVisible = false;
      this.newPlanName = "";
    },
    addNewPlan(e) {
      const value = e.detail.value.trim();
      if (value) {
        const newPlan = {
          id: Date.now(),
          name: value,
          status: "未开始",
          isExplored: false
        };
        this.plans.push(newPlan);
        this.savePlans();
        this.newPlanName = "";
        this.isInputMode = false;
      }
    },
    statusClass(status) {
      switch (status) {
        case "进行中":
          return "status-active";
        case "已完成":
          return "status-completed";
        case "未开始":
          return "status-pending";
        default:
          return "";
      }
    },
    togglePlanStatus(index, listType) {
      let targetPlan;
      if (listType === "ongoing") {
        targetPlan = this.ongoingPlans[index];
      } else {
        targetPlan = this.completedPlans[index];
      }
      const originalIndex = this.plans.findIndex((plan) => plan.id === targetPlan.id);
      if (originalIndex !== -1) {
        if (this.plans[originalIndex].status === "已完成") {
          this.plans[originalIndex].status = "进行中";
        } else {
          this.plans[originalIndex].status = "已完成";
          this.description = targetPlan.name;
          this.showPopup = true;
        }
        this.savePlans();
      }
    },
    async loadPlans() {
      if (this.email) {
        try {
          const response = await utils_api.getPlanData(this.email);
          if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
            this.plans = response.data.map((plan) => ({
              ...plan,
              isExplored: plan.isExplored === void 0 ? false : plan.isExplored
            }));
            this.savePlansToStorage();
            return;
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:206", "从后端获取计划数据失败:", error);
        }
      }
      this.loadPlansFromStorage();
    },
    loadPlansFromStorage() {
      try {
        const storedPlans = common_vendor.index.getStorageSync("plans");
        if (storedPlans) {
          this.plans = JSON.parse(storedPlans);
          this.plans = this.plans.map((plan) => ({
            ...plan,
            isExplored: plan.isExplored === void 0 ? false : plan.isExplored
          }));
        } else {
          this.plans = [];
        }
        common_vendor.index.__f__("log", "at pages/index/index.vue:225", "从本地存储加载计划数据:", this.plans);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:227", "读取计划数据失败", e);
        this.plans = [];
      }
    },
    async savePlans() {
      try {
        this.savePlansToStorage();
        if (this.email) {
          let storedPlans = common_vendor.index.getStorageSync("plans");
          let plansToSave = [];
          if (storedPlans) {
            plansToSave = JSON.parse(storedPlans);
          } else {
            plansToSave = this.plans;
          }
          await utils_api.saveUserPlan(this.email, plansToSave);
          common_vendor.index.__f__("log", "at pages/index/index.vue:244", "计划数据保存到后端成功");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:248", "保存计划数据失败:", error);
      }
    },
    savePlansToStorage() {
      try {
        common_vendor.index.setStorageSync("plans", JSON.stringify(this.plans));
        common_vendor.index.__f__("log", "at pages/index/index.vue:254", "计划数据保存到本地存储成功");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:256", "保存计划数据到本地存储失败", e);
      }
    },
    handleSwipeOptionClick(id, event) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:260", "Swipe action button clicked:", event, "for item ID:", id);
      if (event.index === 0) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:263", "删除按钮被点击, ID:", id);
        this.deletePlan(id);
      } else if (event.index === 1) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:267", "置顶按钮被点击, ID:", id);
        this.pinPlan(id);
      }
    },
    deletePlan(id) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:272", "8888");
      this.plans = this.plans.filter((plan) => plan.id !== id);
      this.savePlans();
    },
    pinPlan(id) {
      const index = this.plans.findIndex((plan) => plan.id === id);
      if (index > -1) {
        const planToPin = this.plans.splice(index, 1)[0];
        this.plans.unshift(planToPin);
        this.savePlans();
      }
    }
  }
};
if (!Array) {
  const _easycom_up_swipe_action_item2 = common_vendor.resolveComponent("up-swipe-action-item");
  const _easycom_up_swipe_action2 = common_vendor.resolveComponent("up-swipe-action");
  const _component_success_popup = common_vendor.resolveComponent("success-popup");
  (_easycom_up_swipe_action_item2 + _easycom_up_swipe_action2 + _component_success_popup)();
}
const _easycom_up_swipe_action_item = () => "../../uni_modules/uview-plus/components/u-swipe-action-item/u-swipe-action-item.js";
const _easycom_up_swipe_action = () => "../../uni_modules/uview-plus/components/u-swipe-action/u-swipe-action.js";
if (!Math) {
  (_easycom_up_swipe_action_item + _easycom_up_swipe_action)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.ongoingPlans.length === 0
  }, $options.ongoingPlans.length === 0 ? {} : {
    b: common_vendor.f($options.ongoingPlans, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.status === "已完成" ? "✔️" : "⬜️"),
        b: common_vendor.o(($event) => $options.togglePlanStatus(index, "ongoing"), item.id),
        c: common_vendor.t(index + 1),
        d: common_vendor.t(item.name),
        e: common_vendor.t(item.status),
        f: common_vendor.n($options.statusClass(item.status)),
        g: item.status === "已完成" ? 1 : "",
        h: common_vendor.o(($event) => $options.navigateToPlanDetail(item), item.id),
        i: common_vendor.o(($event) => $options.handleSwipeOptionClick(item.id, $event), item.id),
        j: "1cf27b2a-1-" + i0 + "," + ("1cf27b2a-0-" + i0),
        k: "1cf27b2a-0-" + i0,
        l: index < $options.ongoingPlans.length - 1
      }, index < $options.ongoingPlans.length - 1 ? {} : {}, {
        m: item.id
      });
    }),
    c: common_vendor.p({
      options: [{
        text: "删除",
        style: {
          backgroundColor: "#dd524d"
        }
      }, {
        text: "置顶",
        style: {
          backgroundColor: "#4caf50"
        }
      }],
      threshold: 80
    })
  }, {
    d: common_vendor.f($options.completedPlans, (item, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.togglePlanStatus(index, "completed"), item.id),
        b: common_vendor.t(index + 1),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.status),
        e: common_vendor.n($options.statusClass(item.status)),
        f: common_vendor.o(($event) => $options.handleSwipeOptionClick(item.id, $event), item.id),
        g: "1cf27b2a-3-" + i0 + "," + ("1cf27b2a-2-" + i0),
        h: "1cf27b2a-2-" + i0,
        i: item.id
      };
    }),
    e: common_vendor.p({
      options: [{
        text: "删除",
        style: {
          backgroundColor: "#dd524d"
        }
      }]
    }),
    f: $data.isInputMode
  }, $data.isInputMode ? {
    g: common_vendor.o((...args) => $options.collapseInput && $options.collapseInput(...args)),
    h: common_vendor.o((...args) => $options.addNewPlan && $options.addNewPlan(...args)),
    i: $data.newPlanName,
    j: common_vendor.o(($event) => $data.newPlanName = $event.detail.value)
  } : {}, {
    k: $data.isInputMode ? 1 : "",
    l: common_vendor.o((...args) => $options.expandInput && $options.expandInput(...args)),
    m: common_vendor.o($options.handleClosePopup),
    n: common_vendor.p({
      visible: $data.showPopup,
      description: $data.description,
      type: "dream"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
