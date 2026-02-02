<template>
  <div>
    <h1>Lista de Personajes</h1>
    <ul>
      <li v-for="character in characters" :key="character.id">
        
        <router-link
      :to="`/characters/${character.id}`"
      custom
      v-slot="{ navigate }"
    >
      <button
        @click="navigate"
        role="link"
      >
        {{ character.name }}
      </button>
    </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const characters = ref([]);

onMounted(async () => {
  const res = await axios.get("http://localhost:3000/characters");
  console.log(res)
  characters.value = res.data;
});
</script>