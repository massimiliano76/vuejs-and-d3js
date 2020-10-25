import Vue from 'vue'
// import App from './App.vue'
import Vuetify from "vuetify";
import D3 from './D3.vue'

Vue.config.productionTip = false
Vue.use(Vuetify)

new Vue({
  render: h => h(D3),
}).$mount('#app')
