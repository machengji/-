"use strict";
const common_vendor = require("../../common/vendor.js");
const SuccessPopup = () => "../../components/SuccessPopup.js";
const _sfc_main = {
  components: {
    SuccessPopup
  },
  data() {
    return {
      // currentDate: this.getCurrentDate(), // 移除日期
      plans: [],
      isPopupVisible: false,
      isInputMode: false,
      showPopup: false,
      description: "",
      newPlanName: ""
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
  // onLoad() {
  // },
  onShow() {
    this.loadPlansFromStorage();
  },
  methods: {
    // getCurrentDate() { // 移除日期方法
    // 	const date = new Date();
    // 	const options = {
    // 		year: 'numeric',
    // 		month: 'long',
    // 		day: 'numeric',
    // 		weekday: 'long'
    // 	};
    // 	return date.toLocaleDateString('zh-CN', options);
    // },
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
      console.log(planWithIsExplored);
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
          // 新增计划时设置 isExplored 为 false
        };
        this.plans.push(newPlan);
        this.savePlansToStorage();
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
        this.savePlansToStorage();
      }
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
      } catch (e) {
        console.error("读取计划数据失败", e);
        this.plans = [];
      }
    },
    savePlansToStorage() {
      try {
        common_vendor.index.setStorageSync("plans", JSON.stringify(this.plans));
      } catch (e) {
        console.error("保存计划数据失败", e);
      }
    }
  }
};
if (!Array) {
  const _component_success_popup = common_vendor.resolveComponent("success-popup");
  _component_success_popup();
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
        i: index < $options.ongoingPlans.length - 1
      }, index < $options.ongoingPlans.length - 1 ? {} : {}, {
        j: item.id
      });
    })
  }, {
    c: common_vendor.f($options.completedPlans, (item, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.togglePlanStatus(index, "completed"), item.id),
        b: common_vendor.t(index + 1),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.status),
        e: common_vendor.n($options.statusClass(item.status)),
        f: item.id
      };
    }),
    d: $data.isInputMode
  }, $data.isInputMode ? {
    e: common_vendor.o((...args) => $options.collapseInput && $options.collapseInput(...args)),
    f: common_vendor.o((...args) => $options.addNewPlan && $options.addNewPlan(...args)),
    g: $data.newPlanName,
    h: common_vendor.o(($event) => $data.newPlanName = $event.detail.value)
  } : {}, {
    i: $data.isInputMode ? 1 : "",
    j: common_vendor.o((...args) => $options.expandInput && $options.expandInput(...args)),
    k: common_vendor.o($options.handleClosePopup),
    l: common_vendor.p({
      visible: $data.showPopup,
      description: $data.description,
      type: "dream"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
