/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'
import pinia from './stores'

// import './styles/index.css';
import './styles/reset.less'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app');
