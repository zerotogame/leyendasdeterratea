import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Characters from "./views/Characters.vue";
import CharacterSheet from "./views/CharacterSheet.vue";
import CharacterForm from "./views/CharacterForm.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/characters", component: Characters },
  { path: "/characters/new", component: CharacterForm },
  { path: "/characters/:id/edit", component: CharacterForm },
  { path: "/characters/:id", component: CharacterSheet, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;