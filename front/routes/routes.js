import Index from "../views/Index.vue";
import AddTicket from "../views/AddTicket.vue";
import SearchTicket from "../views/SearchTicket.vue";
import { createRouter, createWebHashHistory } from "vue-router";

export const routes = [
  {
    path: "/",
    component: Index,
  },
  {
    path: "/index",
    component: Index,
  },
  {
    path: "/add-ticket",
    component: AddTicket,
  },
  {
    path: "/search-ticket",
    component: SearchTicket,
  },
];

// Crear el router
export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
