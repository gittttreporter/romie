import { createRouter, createWebHashHistory } from 'vue-router'

import LibraryHomeView from '@/views/LibraryHomeView.vue'
// import FavoritesView from '@/views/FavoritesView.vue'
// import ConsoleView from '@/views/ConsoleView.vue'
// import DeviceView from '@/views/DeviceView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LibraryHomeView,
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: LibraryHomeView,
  },
  {
    path: '/console/:console',
    name: 'console',
    component: LibraryHomeView,
    props: true,
  },
  {
    path: '/device/:device',
    name: 'device',
    component: LibraryHomeView,
    props: true,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
