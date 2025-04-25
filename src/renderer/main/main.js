import "./styles/main.css";

import { createApp } from 'vue';

import log from "@/renderer/js/logger.js";

import App from './App.vue';
import router from './router';

log.info("Main window loaded");

const app = createApp(App);

app.use(router);

app.mount('#app');
log.info("Main window Vue instance mounted");