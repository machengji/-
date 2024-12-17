"use strict";
const utils_axios = require("./axios.js");
function getPlan(message) {
  return utils_axios.instance.post("/api/ask", message);
}
exports.getPlan = getPlan;
