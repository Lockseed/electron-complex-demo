import { createRouter, createWebHashHistory, type RouteLocationNormalizedLoaded } from 'vue-router';
import EventListView from '../views/EventListView.vue';
import EventLayout from '../views/event/EventLayout.vue';
import DaisyUIView from '../views/DaisyUIView.vue';

function resolvePage(route: RouteLocationNormalizedLoaded): { page: number } {
  const pageQuery = route.query.page;
  const page = Array.isArray(pageQuery)
    ? (pageQuery[0] ?? '1')
    : typeof pageQuery === 'string'
      ? pageQuery
      : '1';

  return { page: Number.parseInt(page, 10) || 1 };
}

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'EventList',
      component: EventListView,
      props: resolvePage,
    },
    {
      path: '/event/:id',
      name: 'EventLayout',
      component: EventLayout,
      props: true,
      children: [
        {
          path: '',
          name: 'EventDetails',
          component: () => import('../views/event/EventDetails.vue'),
        },
        {
          path: 'edit',
          name: 'EventEdit',
          component: () => import('../views/event/EventEdit.vue'),
        },
        {
          path: 'register',
          name: 'EventRegister',
          component: () => import('../views/event/EventRegister.vue'),
        },
      ],
    },
    {
      path: '/daisyui',
      name: 'DaisyUI',
      component: DaisyUIView,
    },
    {
      path: '/about-us',
      alias: '/about',
      name: 'About',
      component: () => import('../views/AboutView.vue'),
    },
  ],
});

export default router;
