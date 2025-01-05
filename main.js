import App from './App'

// 将 uViewPlus 的导入移到条件编译块外部
import uviewPlus from '@/uni_modules/uview-plus'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
  ...App
})

// 注册 uViewPlus (Vue 2)
Vue.use(uviewPlus)

app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)

  // 注册 uViewPlus (Vue 3)
  app.use(uviewPlus)

  return {
    app
  }
}
// #endif
