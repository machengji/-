<template>
  <view class="container">
    <view class="header">
      <text class="title">欢迎使用“微行动计划助手”！</text>
      <text class="subtitle">改变始于微小行动，让我们一起轻松达成目标。</text>
    </view>

    <view class="section">
      <text class="section-title">1. 添加你的愿望</text>
      <text class="content">在首页点击“添加愿望”按钮，填写你的长期愿望或具体目标。</text>
    </view>

    <view class="section">
      <text class="section-title">2. 探索微小行动</text>
      <text class="content">进入愿望详情页，系统会自动探索微小行动。选择一个你觉得最容易执行的行动。</text>
      <text class="content">如果觉得太大，可以点击“继续探索”缩小行动规模。</text>
    </view>

    <view class="section">
      <text class="section-title">3. 绑定生活锚点</text>
      <text class="content">在锚点设置页面，输入你日常的习惯性事件，并将微小行动绑定到锚点之后。设置时间后，会在这个时间通过邮件提醒你</text>
    </view>

    <view class="section">
      <text class="section-title">4. 执行并庆祝</text>
      <text class="content">当锚点事件发生时，执行你的微小行动，并在小程序中点击“完成”。</text>
      <text class="content">每次完成，都会有惊喜的“彩虹屁”鼓励你！</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>

<style>
.container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

.content {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 10px;
  line-height: 1.6;
}
</style>
