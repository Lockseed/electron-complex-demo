import './styles/main.css';

import { createApp } from 'vue';

import log from '@/renderer/js/logger.js';

import App from './App.vue';
import { buildVueErrorLogMessage } from './errorHandling.js';
import router from './router';

log.info('Main window loaded');

const app = createApp(App);

app.config.errorHandler = (error, instance, info) => {
  log.error(
    buildVueErrorLogMessage({
      error,
      info,
      instance,
      source: 'app.config.errorHandler',
    })
  );
};

app.use(router);

app.mount('#app');
log.info('Main window Vue instance mounted');
