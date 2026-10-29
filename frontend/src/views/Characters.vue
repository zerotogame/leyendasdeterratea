<template>
  <div class="page">
    <h1>Lista de Personajes</h1>

    <router-link to="/characters/new" class="new-button">➕ Nuevo personaje</router-link>

    <ul class="character-list">
      <li v-for="character in characters" :key="character.id" class="character-item">
        <router-link :to="`/characters/${character.id}`" custom v-slot="{ navigate }">
          <button @click="navigate" role="link" class="character-button">
            {{ character.name }}
          </button>
        </router-link>
        <router-link :to="`/characters/${character.id}/edit`" class="edit-link">Editar</router-link>
        <button type="button" class="danger-button" @click="deleteCharacter(character.id)">Eliminar</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const characters = ref([]);

async function loadCharacters() {
  const res = await axios.get("http://localhost:3000/characters");
  characters.value = res.data;
}

async function deleteCharacter(characterId) {
  if (!characterId) return;

  const confirmed = window.confirm("¿Quieres eliminar este personaje?");
  if (!confirmed) return;

  await axios.delete(`http://localhost:3000/characters/${characterId}`);
  await loadCharacters();
}

onMounted(async () => {
  await loadCharacters();
});
</script>

<style scoped>
.page {
  padding: 20px;
  font-family: serif;
}

.new-button, .edit-link {
  border: 1px solid #000;
  background: #f0e9d8;
  padding: 8px 12px;
  font-weight: bold;
  color: inherit;
  text-decoration: none;
}

.new-button {
  display: inline-block;
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: bold;
}

input, select, button {
  border: 1px solid #000;
  padding: 8px;
  font: inherit;
}

button {
  background: #f0e9d8;
  cursor: pointer;
  font-weight: bold;
}

.character-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.character-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.character-button {
  min-width: 180px;
}

.danger-button {
  background: #f0d2d2;
  border: 1px solid #000;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: bold;
}
</style>