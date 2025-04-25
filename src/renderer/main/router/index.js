import { createRouter, createWebHashHistory } from "vue-router";
import EventListView from "../views/EventListView.vue";
import AboutView from "../views/AboutView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: "/",
      name: "EventList",
      component: EventListView,
      props: (route) => {
        let /** @type {string} */ page;
        const pageQuery = route.query.page;
        if (Array.isArray(pageQuery)) {
          page = pageQuery[0] || "1";
        } else {
          page = pageQuery || "1";
        }

        return { page: parseInt(page) || 1 };
      },
    },
    {
      path: "/about-us",
      alias: "/about",
      name: "About",
      component: () => import("../views/AboutView.vue")
    },
  ],
});

export default router;