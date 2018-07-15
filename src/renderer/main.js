import Vue from 'vue';
import VueNotification from 'vue-notification';
import api from '@/modules/api';
import { i18n } from '@/modules/i18n';
import { init as initAuth } from '@/modules/aniList';

import store from './store';
import App from './App';
import router from './router';
import getDate from './plugins/getDate';
import './assets/fontawesome/css/fontawesome-all.css';
import './assets/semantic.min.css';
import './assets/semantic.min';

Vue.http = Vue.prototype.$http = api;
Vue.config.productionTip = false;

Vue.use(require('vue-electron'));
Vue.use(VueNotification);
Vue.use(getDate);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  ...App,
});

initAuth(store);

/* Enable webpack hot reloading */
if (module.hot) {
  module.hot.accept();
}
