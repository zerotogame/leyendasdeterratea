<template>
  <div>
    <h1>Leyendas de Terratea</h1>
    <div v-if="character">
      <h1>{{ character.name }}</h1>
      <p>Raza: {{ character.race }}</p>
      <p>Clase: {{ character.class }}</p>
      <div class="left-column">
        <h2>Atributos</h2>
        <ul>
          <li v-for="(attr, name) in character.attributes" :key="name">
            {{ name }}: {{ attr.value }} (Modificador: {{ attr.modifier }})
          </li>
        </ul>
      </div>
      <div class="center-column">
        <h2>Tiradas de Salvación</h2>
        <ul>
          <li v-for="(value, name) in character.rollSalvations" :key="name">
            {{ name }}: {{ value }}
          </li>
        </ul>
      </div>
      <div class="right-column">
        <h2>Movimientos</h2>
        <ul>
          <li v-for="(value, name) in character.rollMovements" :key="name">
            {{ name }}: {{ value }}
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      Cargando...
    </div>
  </div>
</template>

<style scoped>
.left-column, .center-column, .right-column {
  display: inline-block;
  vertical-align: top;
  margin: 2%;
}
</style>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const token = ref("");
const character = ref(null);
let socket = null;

async function get_character(id) {
  const charRes = await axios.get(
    `http://localhost:3000/characters/${id}`
  );

  character.value = charRes.data;
}


onMounted(() => get_character(4));
</script>