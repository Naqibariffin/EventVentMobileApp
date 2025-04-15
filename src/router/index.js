import { createRouter, createWebHistory } from "@ionic/vue-router";

const Home = () => import("../views/Events.vue");
const Register = () => import("../views/Register.vue");
const Login = () => import("../views/Login.vue");
const AddEvent = () => import("../views/AddEvent.vue");
const ManageEvents = () => import("../views/ManageEvents.vue");
const MyProfile = () => import("../views/MyProfile.vue");
const EditEvent = () => import("../views/EditEvent.vue");
const Support = () => import("../views/LoginFAQ.vue");

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/add-event",
    component: AddEvent,
  },
  {
    path: "/manage-events",
    component: ManageEvents,
  },
  {
    path: "/my-profile",
    component: MyProfile,
    meta: { requiresAuth: true },
  },
  {
    path: "/edit-event/:eventId",
    name: "EditEvent",
    component: EditEvent,
    props: true,
  },
  {
    path: "/faq",
    name: "Support",
    component: Support,
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
