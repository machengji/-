"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/createPlan/createPlan.js";
  "./pages/anotherPage/anotherPage.js";
  "./pages/exploringBehavior/exploringBehavior.js";
  "./pages/anchor-behaviors/anchor-behaviors.js";
  "./pages/anchorList/anchorList.js";
  "./pages/anchor-behaviorsList/anchor-behaviorsList.js";
  "./pages/book/book.js";
  "./pages/about/about.js";
  "./pages/dreamList/dreamList.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
