import Vue from 'vue'
import App from './App4.vue'
import JsonViewer from "vue-json-viewer"
import "./plugins/element"

Vue.use(JsonViewer)
Vue.config.productionTip = false
Vue.config.devtools = true
new Vue({
  render: h => h(App),
}).$mount('#app')
