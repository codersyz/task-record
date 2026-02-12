"use strict";
const utils_request = require("../utils/request.js");
function getAchievements() {
  return utils_request.request.get("/achievements");
}
exports.getAchievements = getAchievements;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/achievement.js.map
