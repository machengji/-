"use strict";
const common_vendor = require("../../common/vendor.js");
const tags = [
  "送礼物",
  "被送礼物",
  "暗恋",
  "明恋",
  "失恋",
  "表白",
  "被表白",
  "留长发",
  "剪短发",
  "染发",
  "漂发",
  "烫发",
  "化妆",
  "做美甲",
  "放下一个人",
  "有过遗憾",
  "爱而不得",
  "双向奔赴",
  "拒绝他人表白",
  "表白被拒",
  "被渣",
  "犯过傻",
  "装糊涂",
  "打架",
  "迟到",
  "上课睡觉",
  "被叫家长",
  "喝酒",
  "去清吧",
  "和朋友去KTV",
  "断片",
  "失眠",
  "睡一天",
  "吵架",
  "绝交",
  "晚上一个人哭",
  "晕倒",
  "会做饭",
  "做一桌菜",
  "做饭给家人",
  "做甜品给喜欢的人",
  "有超过10年的好朋友",
  "有个无条件可信任的朋友",
  "买花",
  "被送花",
  "给自己买礼物",
  "通宵补作业",
  "一个人散步",
  "夜跑",
  "深夜散心",
  "向陌生人吐露心声",
  "一个人出去吃饭",
  "一个人看电影",
  "摄影",
  "一个人去酒吧",
  "一个人过生日",
  "一个人逛超市",
  "一个人去图书馆",
  "一个人看病",
  "一个人去唱歌",
  "社死过",
  "一个人出门逛",
  "一个人在外难过",
  "给自己写信",
  "出国一个人旅游",
  "跟朋友旅游",
  "拥有要好的异性朋友",
  "谈恋爱",
  "考试不及格",
  "考试第一名",
  "当班干部",
  "竞选学生会",
  "上电视",
  "上报纸",
  "登台演出",
  "主持节目",
  "演讲",
  "野性消费",
  "买东西被坑",
  "被老师点名表扬",
  "被老师点名批评",
  "全校表扬",
  "被背叛",
  "被坚定选择",
  "获奖",
  "学一种语言",
  "写论文",
  "写书",
  "写诗",
  "写日记",
  "写剧本",
  "写歌",
  "拍影片",
  "参加比赛",
  "拍写真",
  "买相机",
  "会一种乐器",
  "有超过5年的兴趣爱好",
  "参加志愿活动",
  "自己一个人在外面住过",
  "看恐怖片",
  "去密室",
  "去鬼屋",
  "去游乐场",
  "去看现场演唱会",
  "去音乐节",
  "偶遇明星",
  "去签售会",
  "在图书馆待一天",
  "兼职",
  "打工",
  "看画展",
  "捐款",
  "道歉",
  "释怀",
  "失望",
  "淋雨",
  "种花",
  "养宠物",
  "泡温泉",
  "跳伞",
  "坐过山车",
  "蹦极",
  "骑马",
  "卡车",
  "攀岩",
  "游泳",
  "滑雪",
  "滑冰",
  "旱冰",
  "滑板",
  "去野炊",
  "登山",
  "看雪",
  "看海",
  "看日出",
  "看日落",
  "拿驾照",
  "自驾游",
  "给父母买衣服",
  "当伴娘/郎",
  "摆地摊",
  "和同学打水仗",
  "社团活动",
  "组建社团",
  "写信",
  "独自坐飞机",
  "拼拼图",
  "办生日会",
  "健身",
  "买名牌",
  "开网店",
  "练字",
  "做一次公益",
  "学会一项新技能",
  "挑战自己",
  "克服一个恐惧",
  "看一场话剧",
  "去一次海边",
  "看一次日出",
  "看一次日落",
  "写一封情书",
  "给家人做一顿饭",
  "学会游泳",
  "学会开车",
  "学会骑自行车",
  "学会滑板",
  "学会跳舞",
  "学会唱歌",
  "学会乐器",
  "学会摄影",
  "学会绘画",
  "学会编程",
  "学会外语",
  "学会理财",
  "学会做饭",
  "学会烘焙",
  "学会化妆",
  "学会穿搭",
  "学会演讲",
  "学会沟通",
  "学会独立思考",
  "学会时间管理",
  "学会情绪管理",
  "学会自我反省",
  "学会感恩",
  "学会原谅",
  "学会放下",
  "学会爱自己",
  "学会爱别人",
  "学会接受不完美",
  "学会享受孤独",
  "学会与人相处",
  "学会表达自己",
  "学会倾听",
  "学会合作",
  "学会解决问题",
  "学会承担责任",
  "学会坚持",
  "学会放弃",
  "学会成长",
  "学会拥抱变化",
  "学会面对失败",
  "学会从失败中学习",
  "学会庆祝成功",
  "学会活在当下",
  "学会珍惜拥有",
  "学会追求梦想",
  "学会享受生活",
  "学会爱",
  "学会被爱",
  "学会放手",
  "学会勇敢",
  "学会坚强",
  "学会温柔",
  "学会善良",
  "学会自信",
  "学会乐观",
  "学会积极",
  "学会耐心",
  "学会宽容",
  "学会理解",
  "学会尊重",
  "学会包容",
  "学会同情",
  "学会帮助",
  "学会分享",
  "学会付出",
  "学会接受",
  "学会改变",
  "学会适应",
  "学会创新",
  "学会探索",
  "学会发现",
  "学会创造",
  "学会欣赏",
  "学会感恩",
  "学会珍惜",
  "学会享受",
  "学会生活",
  "学会做自己",
  "学会成为更好的自己",
  "学会成为自己想成为的人",
  "学会成为一个完整的人",
  "学会成为一个幸福的人"
];
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const shuffledTags = shuffleArray(tags);
const _sfc_main = {
  data() {
    return {
      shuffledTags,
      plans: []
      // 使用 plans 存储梦想
    };
  },
  methods: {
    addDream(tag) {
      const newPlan = {
        id: Date.now(),
        name: tag,
        status: "未开始",
        isExplored: false
      };
      this.plans.push(newPlan);
      this.savePlansToStorage();
      common_vendor.index.showToast({
        title: "已加入梦想计划",
        icon: "success",
        duration: 1e3
      });
    },
    savePlansToStorage() {
      try {
        common_vendor.index.setStorageSync("plans", JSON.stringify(this.plans));
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/dreamList/dreamList.vue:106", "保存计划数据失败", e);
      }
    },
    loadPlansFromStorage() {
      try {
        const savedPlans = common_vendor.index.getStorageSync("plans");
        if (savedPlans) {
          this.plans = JSON.parse(savedPlans);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/dreamList/dreamList.vue:116", "加载计划数据失败", e);
      }
    }
  },
  onLoad() {
    this.loadPlansFromStorage();
  }
};
if (!Array) {
  const _component_list = common_vendor.resolveComponent("list");
  _component_list();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.shuffledTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index,
        c: common_vendor.o(($event) => $options.addDream(tag), index)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/dreamList/dreamList.js.map
