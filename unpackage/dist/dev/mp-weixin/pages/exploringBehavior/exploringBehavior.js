"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const EditActionModal = () => "../../components/EditActionModal.js";
const SuccessPopup = () => "../../components/SuccessPopup.js";
const GoalModal = () => "../../components/GoalModal.js";
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
  components: {
    EditActionModal,
    SuccessPopup,
    GoalModal
  },
  data() {
    return {
      aiTags: [],
      chosenBehaviors: [],
      plan: {},
      completedBehaviors: [],
      currentScrollId: "",
      showInput: false,
      newAction: "",
      loading: false,
      showPopup: false,
      showEditModal: false,
      currentAction: {},
      description: "",
      currentEditIndex: -1,
      showGoalModalone: false,
      isFetching: false,
      email: ""
      // 用户邮箱
    };
  },
  onLoad(options) {
    if (options.plan) {
      try {
        const parsedPlan = JSON.parse(options.plan);
        this.plan = deepClone(parsedPlan);
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:173", "plan56565", this.plan);
        this.loadBehaviorsFromStorage();
        if (this.plan.isExplored) {
          return;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/exploringBehavior/exploringBehavior.vue:181", "解析 plan 数据失败:", error);
      }
    }
  },
  mounted() {
    this.email = common_vendor.index.getStorageSync("userEmail") || "";
    common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:190", this.plan.isExplored);
    if (!this.plan.isExplored) {
      this.fetchPlanData();
    }
  },
  methods: {
    async fetchPlanData(message) {
      if (this.isFetching) {
        common_vendor.index.showToast({
          title: "请等待上一个AI回答完成",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      this.isFetching = true;
      this.loading = true;
      try {
        const response = await utils_api.getPlan({
          message: message || this.plan.name
        });
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:211", response);
        if (response.response && Array.isArray(response.response)) {
          this.aiTags = response.response.map((item) => item.text);
          if (!message) {
            this.plan.isExplored = true;
            this.plan.status = "进行中";
            this.updatePlanInStorage();
          }
        } else {
          common_vendor.index.showToast({
            title: "数据格式错误",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/exploringBehavior/exploringBehavior.vue:227", "获取计划数据失败:", error);
        common_vendor.index.showToast({
          title: "获取计划数据失败",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.loading = false;
        this.isFetching = false;
      }
    },
    handleClosePopup() {
      this.showPopup = false;
    },
    goshowGoalModal() {
      this.showGoalModalone = true;
    },
    onTagClick(tag, index) {
      this.activeTagIndex = index;
      setTimeout(() => {
        this.activeTagIndex = -1;
        this.aiTags.splice(index, 1);
        this.chosenBehaviors.unshift({
          title: tag,
          completed: false
        });
        this.currentScrollId = `behavior-chosen-0`;
        this.updatePlanInStorage();
      }, 200);
    },
    clearAiTags() {
      this.aiTags = [];
    },
    continueExplore(action) {
      this.fetchPlanData(`${String(action.title)}`);
    },
    editAction(action, idx) {
      this.currentAction = {
        ...action
      };
      this.currentEditIndex = idx;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.currentAction = {};
      this.currentEditIndex = -1;
    },
    handleEditConfirm(editedAction) {
      if (this.currentEditIndex > -1) {
        this.chosenBehaviors[this.currentEditIndex] = {
          ...this.chosenBehaviors[this.currentEditIndex],
          title: editedAction.title,
          repeat: editedAction.repeat
        };
        this.updatePlanInStorage();
      }
      this.closeEditModal();
    },
    scrollToBehavior(action) {
      const targetId = `behavior-chosen-${this.chosenBehaviors.indexOf(action)}`;
      this.currentScrollId = targetId;
      const clonedAction = deepClone(action);
      common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:298", clonedAction);
      common_vendor.index.navigateTo({
        url: `/pages/anchorList/anchorList?anchor=${JSON.stringify(clonedAction)}`
      });
    },
    deleteAction(idx) {
      this.chosenBehaviors.splice(idx, 1);
      common_vendor.index.showToast({
        title: "已删除",
        icon: "none",
        duration: 2e3
      });
      this.updatePlanInStorage();
    },
    addAction() {
      common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:315", "newAction", this.newAction);
      if (this.newAction.trim() === "") {
        return;
      }
      this.chosenBehaviors.unshift({
        title: this.newAction,
        completed: false
      });
      this.currentScrollId = `behavior-chosen-0`;
      this.newAction = "";
      this.showInput = false;
      this.updatePlanInStorage();
    },
    reExplore() {
      this.fetchPlanData();
    },
    toggleCompletion(idx, listType) {
      if (listType === "chosen") {
        const action = this.chosenBehaviors[idx];
        if (action.repeat) {
          const completedIndex = this.completedBehaviors.findIndex(
            (item) => item.title === action.title
          );
          if (completedIndex === -1) {
            const newCompletedAction = {
              ...action,
              completedCount: 1,
              completed: true
            };
            this.completedBehaviors.unshift(newCompletedAction);
          } else {
            this.completedBehaviors[completedIndex].completedCount++;
          }
        } else {
          const [completedAction] = this.chosenBehaviors.splice(idx, 1);
          completedAction.completed = true;
          this.completedBehaviors.unshift(completedAction);
        }
        this.description = action.title;
        this.showPopup = true;
      } else if (listType === "completed") {
        const action = this.completedBehaviors[idx];
        if (action.repeat) {
          const chosenIndex = this.chosenBehaviors.findIndex(
            (item) => item.title === action.title
          );
          if (chosenIndex === -1) {
            this.chosenBehaviors.unshift(action);
            this.completedBehaviors.splice(idx, 1);
          } else {
            common_vendor.index.showToast({
              title: "该行为已在未完成列表中",
              icon: "none",
              duration: 2e3
            });
          }
        } else {
          const [chosenAction] = this.completedBehaviors.splice(idx, 1);
          chosenAction.completed = false;
          this.chosenBehaviors.unshift(chosenAction);
          common_vendor.index.showToast({
            title: "行为已恢复为未完成",
            icon: "none",
            duration: 2e3
          });
          this.currentScrollId = `behavior-chosen-0`;
        }
      }
      this.updatePlanInStorage();
    },
    loadBehaviorsFromStorage() {
      let plans = common_vendor.index.getStorageSync("plans");
      if (plans) {
        plans = JSON.parse(plans);
        const currentPlan = plans.find((p) => p.id === this.plan.id);
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:400", "kkkkplan", currentPlan);
        if (currentPlan && currentPlan.chosenBehaviors) {
          this.chosenBehaviors = currentPlan.chosenBehaviors;
        }
        if (currentPlan && currentPlan.completedBehaviors) {
          this.completedBehaviors = currentPlan.completedBehaviors;
        }
      }
    },
    async updatePlanInStorage() {
      let plans = common_vendor.index.getStorageSync("plans");
      if (plans) {
        plans = JSON.parse(plans);
        const planIndex = plans.findIndex((p) => p.id === this.plan.id);
        if (planIndex > -1) {
          plans[planIndex] = {
            ...this.plan,
            chosenBehaviors: this.chosenBehaviors,
            completedBehaviors: this.completedBehaviors
          };
          common_vendor.index.setStorageSync("plans", JSON.stringify(plans));
        }
      }
      if (this.email) {
        let storedPlans = common_vendor.index.getStorageSync("plans");
        let plansToSave = [];
        if (storedPlans) {
          plansToSave = JSON.parse(storedPlans);
        } else {
          plansToSave = this.plans;
        }
        await utils_api.saveUserPlan(this.email, plansToSave);
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:433", "计划数据保存到后端成功");
      }
    },
    showGoalModal() {
      this.showGoalModal = true;
    },
    closeGoalModal() {
      this.showGoalModalone = false;
    },
    handleGoalConfirm(updatedPlan) {
      this.plan = {
        ...this.plan,
        ...updatedPlan
      };
      this.updatePlanInStorage();
      this.closeGoalModal();
    },
    handleGoalDelete() {
      let plans = common_vendor.index.getStorageSync("plans");
      if (plans) {
        plans = JSON.parse(plans);
        const planIndex = plans.findIndex((p) => p.id === this.plan.id);
        if (planIndex > -1) {
          plans.splice(planIndex, 1);
          common_vendor.index.setStorageSync("plans", JSON.stringify(plans));
          common_vendor.index.navigateBack();
        }
      }
    },
    handleSwipeOptionClick(action, idx, event) {
      common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:463", "Swipe action button clicked for action:", action);
      if (event.index === 0) {
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:466", "细化探索按钮被点击, ID:", action.id);
        this.continueExplore(action);
      } else if (event.index === 1) {
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:470", "去绑定锚点按钮被点击, ID:", action.id);
        this.scrollToBehavior(action);
      } else if (event.index === 2) {
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:474", "编辑按钮被点击, ID:", action.id);
        this.editAction(action, idx);
      } else if (event.index === 3) {
        common_vendor.index.__f__("log", "at pages/exploringBehavior/exploringBehavior.vue:478", "删除按钮被点击, ID:", action.id);
        this.deleteAction(idx);
      }
    }
  }
};
if (!Array) {
  const _easycom_up_icon2 = common_vendor.resolveComponent("up-icon");
  const _easycom_up_swipe_action_item2 = common_vendor.resolveComponent("up-swipe-action-item");
  const _easycom_up_swipe_action2 = common_vendor.resolveComponent("up-swipe-action");
  const _component_edit_action_modal = common_vendor.resolveComponent("edit-action-modal");
  const _component_success_popup = common_vendor.resolveComponent("success-popup");
  const _component_GoalModal = common_vendor.resolveComponent("GoalModal");
  (_easycom_up_icon2 + _easycom_up_swipe_action_item2 + _easycom_up_swipe_action2 + _component_edit_action_modal + _component_success_popup + _component_GoalModal)();
}
const _easycom_up_icon = () => "../../uni_modules/uview-plus/components/u-icon/u-icon.js";
const _easycom_up_swipe_action_item = () => "../../uni_modules/uview-plus/components/u-swipe-action-item/u-swipe-action-item.js";
const _easycom_up_swipe_action = () => "../../uni_modules/uview-plus/components/u-swipe-action/u-swipe-action.js";
if (!Math) {
  (_easycom_up_icon + _easycom_up_swipe_action_item + _easycom_up_swipe_action)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.plan.name),
    b: common_vendor.o((...args) => $options.goshowGoalModal && $options.goshowGoalModal(...args)),
    c: common_vendor.p({
      name: "reload",
      color: "#ffffff"
    }),
    d: common_vendor.o((...args) => $options.clearAiTags && $options.clearAiTags(...args)),
    e: common_vendor.p({
      name: "search",
      color: "#ffffff"
    }),
    f: common_vendor.o((...args) => $options.reExplore && $options.reExplore(...args)),
    g: $data.loading
  }, $data.loading ? {
    h: common_assets._imports_0$1
  } : {
    i: common_vendor.f($data.aiTags, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: "aiTag-" + index,
        c: _ctx.activeTagIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.onTagClick(item, index), "aiTag-" + index)
      };
    })
  }, {
    j: !$data.showInput
  }, !$data.showInput ? {
    k: common_vendor.p({
      name: "plus",
      color: "#ffffff"
    }),
    l: common_vendor.o(($event) => $data.showInput = true)
  } : {
    m: common_vendor.o((...args) => $options.addAction && $options.addAction(...args)),
    n: common_vendor.o(($event) => $data.showInput = false),
    o: $data.newAction,
    p: common_vendor.o(($event) => $data.newAction = $event.detail.value)
  }, {
    q: common_vendor.f($data.chosenBehaviors, (action, idx, i0) => {
      return {
        a: common_vendor.t(action.completed ? "✔️" : "⬜️"),
        b: common_vendor.o(($event) => $options.toggleCompletion(idx, "chosen"), "chosen-" + idx),
        c: common_vendor.t(idx + 1),
        d: common_vendor.t(action.title),
        e: common_vendor.o(($event) => $options.handleSwipeOptionClick(action, idx, $event), "chosen-" + idx),
        f: "82a82ead-4-" + i0 + "," + ("82a82ead-3-" + i0),
        g: "82a82ead-3-" + i0,
        h: "chosen-" + idx,
        i: "behavior-chosen-" + idx
      };
    }),
    r: common_vendor.p({
      options: [
        {
          icon: "search",
          style: {
            background: "linear-gradient(135deg, #e64a19, #ff9800)",
            width: "70rpx",
            height: "70rpx",
            borderRadius: "35rpx",
            marginRight: "10rpx"
          }
        },
        // 细化探索
        {
          icon: "plus",
          style: {
            background: "linear-gradient(135deg, #ff3d00, #ffb300)",
            width: "70rpx",
            height: "70rpx",
            borderRadius: "35rpx",
            marginRight: "10rpx"
          }
        },
        // 去绑定锚点
        {
          icon: "edit-pen-fill",
          style: {
            background: "linear-gradient(135deg, #ff8e22, #ffcc00)",
            width: "70rpx",
            height: "70rpx",
            borderRadius: "35rpx",
            marginRight: "10rpx"
          }
        },
        // 编辑
        {
          icon: "trash",
          style: {
            background: "linear-gradient(135deg, #ff3d00, #ff0000)",
            width: "70rpx",
            height: "70rpx",
            borderRadius: "35rpx"
          }
        }
        // 删除
      ],
      threshold: 80
    }),
    s: common_vendor.f($data.completedBehaviors, (action, idx, i0) => {
      return common_vendor.e({
        a: common_vendor.t(action.completed ? "✔️" : "⬜️"),
        b: common_vendor.o(($event) => $options.toggleCompletion(idx, "completed"), "completed-" + idx),
        c: common_vendor.t(idx + 1),
        d: common_vendor.t(action.title),
        e: action.repeat
      }, action.repeat ? {
        f: common_vendor.t(action.completedCount)
      } : {}, {
        g: "completed-" + idx,
        h: "behavior-completed-" + idx
      });
    }),
    t: $data.currentScrollId,
    v: common_vendor.o($options.closeEditModal),
    w: common_vendor.o($options.handleEditConfirm),
    x: common_vendor.p({
      visible: $data.showEditModal,
      action: $data.currentAction
    }),
    y: common_vendor.o($options.handleClosePopup),
    z: common_vendor.p({
      visible: $data.showPopup,
      description: $data.description,
      type: "action"
    }),
    A: common_vendor.o($options.closeGoalModal),
    B: common_vendor.o($options.handleGoalConfirm),
    C: common_vendor.o($options.handleGoalDelete),
    D: common_vendor.p({
      visible: $data.showGoalModalone,
      plan: $data.plan
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-82a82ead"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/exploringBehavior/exploringBehavior.js.map
