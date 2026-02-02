<template>
  <div>
    <h1>Leyendas de Terratea</h1>
    <router-link
      to="/characters"
      custom
      v-slot="{ navigate }"
    >
      <button
        @click="navigate"
        role="link"
      >
        Characters
      </button>
    </router-link>  </div>
</template>

<script setup>
</script>