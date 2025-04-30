import { createRouter, createWebHashHistory } from "vue-router";
import EventListView from "../views/EventListView.vue";
import EventLayout from "../views/event/EventLayout.vue";
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
      path: "/event/:id",
      name: "EventLayout",
      component: EventLayout,
      props: true,
      children: [
        {
          path: "",
          name: "EventDetails",
          component: () => import("../views/event/EventDetails.vue"),
        },
        {
          path: "edit",
          name: "EventEdit",
          component: () => import("../views/event/EventEdit.vue"),
        },
        {
          path: "register",
          name: "EventRegister",
          component: () => import("../views/event/EventRegister.vue"),
        }
      ],
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