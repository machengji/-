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
      // 控制模态框显示
      currentAction: {},
      description: "",
      // 当前编辑的 action
      currentEditIndex: -1,
      // 当前编辑的 action 的索引
      showGoalModalone: false,
      // 控制目标编辑模态框显示
      isFetching: false
      // 添加一个标志位，表示是否正在请求
    };
  },
  onLoad(options) {
    if (options.plan) {
      this.plan = JSON.parse(options.plan);
      if (this.plan.isExplored) {
        this.loadBehaviorsFromStorage();
        return;
      }
    }
  },
  mounted() {
    console.log(this.plan.isExplored);
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
          // 如果没有传递 message，则使用 plan.name
        });
        console.log(response);
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
        console.error("获取计划数据失败:", error);
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
    // 跳转到某个行为
    scrollToBehavior(action) {
      const targetId = `behavior-chosen-${this.chosenBehaviors.indexOf(action)}`;
      this.currentScrollId = targetId;
      const clonedAction = deepClone(action);
      console.log(clonedAction);
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
      if (this.newAction.trim() === "") {
        return;
      }
      this.chosenBehaviors.unshift({
        title: this.newAction,
        completed: false
      });
      this.currentScrollId = `behavior-chosen-0`;
      common_vendor.index.showToast({
        title: "已添加行为：" + this.newAction,
        icon: "none",
        duration: 2e3
      });
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
        if (currentPlan && currentPlan.chosenBehaviors) {
          this.chosenBehaviors = currentPlan.chosenBehaviors;
        }
        if (currentPlan && currentPlan.completedBehaviors) {
          this.completedBehaviors = currentPlan.completedBehaviors;
        }
      }
    },
    updatePlanInStorage() {
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
    },
    // 显示目标编辑模态框
    showGoalModal() {
      this.showGoalModal = true;
    },
    // 关闭目标编辑模态框
    closeGoalModal() {
      this.showGoalModalone = false;
    },
    // 处理目标编辑模态框的确认
    handleGoalConfirm(updatedPlan) {
      this.plan = { ...this.plan, ...updatedPlan };
      this.updatePlanInStorage();
      this.closeGoalModal();
    },
    // 处理目标删除
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
    }
  }
};
if (!Array) {
  const _component_edit_action_modal = common_vendor.resolveComponent("edit-action-modal");
  const _component_success_popup = common_vendor.resolveComponent("success-popup");
  const _component_GoalModal = common_vendor.resolveComponent("GoalModal");
  (_component_edit_action_modal + _component_success_popup + _component_GoalModal)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.plan.name),
    b: common_vendor.o((...args) => $options.goshowGoalModal && $options.goshowGoalModal(...args)),
    c: common_vendor.o((...args) => $options.clearAiTags && $options.clearAiTags(...args)),
    d: common_vendor.o((...args) => $options.reExplore && $options.reExplore(...args)),
    e: $data.loading
  }, $data.loading ? {
    f: common_assets._imports_0$1
  } : {
    g: common_vendor.f($data.aiTags, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: "aiTag-" + index,
        c: _ctx.activeTagIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.onTagClick(item, index), "aiTag-" + index)
      };
    })
  }, {
    h: common_vendor.o(($event) => $data.showInput = true),
    i: $data.showInput
  }, $data.showInput ? {
    j: $data.newAction,
    k: common_vendor.o(($event) => $data.newAction = $event.detail.value),
    l: common_vendor.o((...args) => $options.addAction && $options.addAction(...args)),
    m: common_vendor.o(($event) => $data.showInput = false)
  } : {}, {
    n: common_vendor.f($data.chosenBehaviors, (action, idx, i0) => {
      return {
        a: common_vendor.t(action.completed ? "✔️" : "⬜️"),
        b: common_vendor.o(($event) => $options.toggleCompletion(idx, "chosen"), "chosen-" + idx),
        c: common_vendor.t(idx + 1),
        d: common_vendor.t(action.title),
        e: common_vendor.o(($event) => $options.continueExplore(action), "chosen-" + idx),
        f: common_vendor.o(($event) => $options.scrollToBehavior(action), "chosen-" + idx),
        g: common_vendor.o(($event) => $options.editAction(action, idx), "chosen-" + idx),
        h: common_vendor.o(($event) => $options.deleteAction(idx), "chosen-" + idx),
        i: "chosen-" + idx,
        j: "behavior-chosen-" + idx
      };
    }),
    o: common_vendor.f($data.completedBehaviors, (action, idx, i0) => {
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
    p: $data.currentScrollId,
    q: common_vendor.o($options.closeEditModal),
    r: common_vendor.o($options.handleEditConfirm),
    s: common_vendor.p({
      visible: $data.showEditModal,
      action: $data.currentAction
    }),
    t: common_vendor.o($options.handleClosePopup),
    v: common_vendor.p({
      visible: $data.showPopup,
      description: $data.description,
      type: "action"
    }),
    w: common_vendor.o($options.closeGoalModal),
    x: common_vendor.o($options.handleGoalConfirm),
    y: common_vendor.o($options.handleGoalDelete),
    z: common_vendor.p({
      visible: $data.showGoalModalone,
      plan: $data.plan
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-82a82ead"]]);
wx.createPage(MiniProgramPage);
