import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Characters from "./views/Characters.vue";
import CharacterSheet from "./views/CharacterSheet.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/characters", component: Characters },
  { path: "/characters/:id", component: CharacterSheet, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;