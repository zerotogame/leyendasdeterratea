<template>
  <div class="page">
    <div v-if="character" class="character-sheet">

      <!-- RESUMEN DE TIRADAS TRAS CREAR EL PERSONAJE -->
      <div v-if="lastRolls" class="rolls-banner">
        <b>Tiradas de creación:</b>
        <span v-for="s in lastRolls.stats" :key="s.name">{{ s.name }} {{ s.value }} ({{ s.modifier >= 0 ? '+' : '' }}{{ s.modifier }})</span>
        <span>Vitalidad: 1d12 → {{ lastRolls.vitality.roll }} (total {{ lastRolls.vitality.total }})</span>
        <button type="button" @click="lastRolls = null">Cerrar</button>
      </div>

      <div v-if="character.pending_stat_points > 0" class="rolls-banner">
        <b>Tienes {{ character.pending_stat_points }} punto(s) de característica por repartir:</b>
        <button v-for="(attr, name) in character.attributes" :key="name" type="button" @click="spendStatPoint(name)">
          + {{ name }}
        </button>
      </div>

      <!-- CABECERA -->
      <header class="sheet-header">
        <div class="identity">
          <div class="line-field"><b>Personaje:</b><span>{{ character.name }}</span></div>
          <div class="line-field"><b>Jugador:</b><span>{{ character.player_name || '________________________' }}</span></div>
          <div class="line-field"><b>Clase:</b><span>{{ character.class }}</span></div>
          <div class="line-field"><b>Raza:</b><span>{{ character.race }}</span></div>
          <div class="line-field"><b>Alineamiento:</b><span>{{ character.alignment }}</span></div>
          <div class="line-field"><b>Gremio:</b><span>{{ character.guild || '________________________' }}</span></div>
        </div>

        <div class="crest">
          <div class="crest-shape">
            <span class="crest-top">C.A</span>
            <span class="crest-initial">{{ character.class?.charAt(0) || '✦' }}</span>
          </div>
          <small>Esquiva (Dest-Habs): {{ character.dodge != null ? '+' + character.dodge : '______' }}</small>
          <small>PV: {{ character.hit_points ?? '__' }} · CA: {{ character.armor_class ?? '__' }}</small>
        </div>

        <div class="armor">
          <h2>ARMADURA</h2>
          <div class="armor-grid">
            <div><b>Cabeza:</b><span>________________</span></div>
            <div><b>Piernas:</b><span>________________</span></div>
            <div><b>Pecho:</b><span>________________</span></div>
            <div><b>Colgante:</b><span>________________</span></div>
            <div><b>Espalda:</b><span>________________</span></div>
            <div><b>Escudo:</b><span>________________</span></div>
            <div><b>Anillo:</b><span>________________</span></div>
            <div><b>Manos:</b><span>________________</span></div>
            <div><b>Brazaletes:</b><span>________________</span></div>
            <div><b>Pies:</b><span>________________</span></div>
          </div>
        </div>

        <div class="portrait-mark">♨</div>

        <div class="mini-box wounds">
          <h3>HERIDAS</h3><div class="blank"></div>
        </div>
        <div class="mini-box ammo">
          <h3>MUNICIÓN</h3><div class="blank"></div>
        </div>
        <div class="mini-box treasure">
          <h3>TESORO</h3>
          <div class="coin"><b>Oro:</b><span>{{ character.gold ?? 0 }}</span></div>
          <div class="coin"><b>Plata:</b><span>{{ character.silver ?? 0 }}</span></div>
          <div class="coin"><b>Cobre:</b><span>{{ character.copper ?? 0 }}</span></div>
          <div class="coin"><b>Gemas:</b><span>________</span></div>
        </div>
      </header>

      <!-- DATOS FÍSICOS -->
      <section class="physical">
        <div><b>Altura:</b><span>{{ character.height }}</span></div>
        <div><b>Peso:</b><span>{{ character.weight }}</span></div>
        <div><b>Edad:</b><span>{{ character.age }}</span></div>
        <div><b>Sexo:</b><span>{{ character.sex }}</span></div>
        <div><b>Cabello:</b><span>{{ character.hair }}</span></div>
        <div><b>Ojos:</b><span>{{ character.eyes }}</span></div>
        <div class="marks"><b>Marcas:</b><span>{{ character.marks }}</span></div>
      </section>

      <!-- ARMAMENTO -->
      <section class="weapons panel">
        <h2>ARMAMENTO</h2>
        <div class="weapon-head">
          <span>ARMA</span><span>ATAQUE</span><span>+</span><span>+</span><span>♦</span><span>+</span><span>Daño</span><span>Total</span><span>Especial</span>
        </div>
        <div v-for="(w, n) in weaponRows" :key="n" class="weapon-row">
          <span>{{ w?.name ?? '__________________' }}</span>
          <span>{{ w?.attack_magic ?? '' }}</span>
          <span>{{ w?.attack_element ?? '' }}</span>
          <span>{{ w?.attack_malediction ?? '' }}</span>
          <span>{{ w?.weight ?? '' }}</span>
          <span>{{ w?.hands ?? '' }}</span>
          <span>{{ w?.damage ?? '____' }}</span>
          <span>{{ w?.total ?? '____' }}</span>
          <span>{{ w?.special ?? '________________' }}</span>
        </div>
      </section>

      <!-- CUERPO DE LA FICHA -->
      <main class="body-grid">
        <aside class="left-col">
          <section class="ornate-section">
            <h2>RANGO DE ALCANCE</h2>
            <div class="range-line">{{ character.range_reach || '__________' }}</div>
          </section>

          <section class="ornate-section stats">
            <h2>CARACTERÍSTICAS</h2>
            <div v-for="(attr, name) in character.attributes" :key="name" class="stat-row">
              <span class="stat-name">{{ name }}</span>
              <strong>{{ attr.value }}</strong>
              <em>{{ attr.modifier > 0 ? '+' : '' }}{{ attr.modifier }}</em>
            </div>
          </section>

          <section class="ornate-section save-list">
            <h2>TIRADAS DE SALVACIÓN</h2>
            <div v-for="(value, name) in character.rollSalvations" :key="name" class="text-row">
              <span>{{ name }}</span><b>{{ value }}</b>
            </div>
          </section>

          <section class="ornate-section conditions">
            <h2>CONDICIONES</h2>
            <div>Venenos y tóxicos</div>
            <div>Magia y maldiciones</div>
            <div>Sortilegios, encantam. y trampas</div>
            <div>Quemaduras y desangrado</div>
            <div>Petrificación, parálisis y ctrl. mental</div>
          </section>
        </aside>

        <section class="center-col">
          <section class="movement panel">
            <h2>MOVIMIENTO</h2>
            <div class="movement-head"><span>Base</span><span>Combate</span><span>Carrera</span><span>Sobrepeso</span><span>Huida</span></div>
            <div class="movement-values">
              <span v-for="(value, name) in character.rollMovements" :key="name" :title="name">{{ value }}</span>
            </div>
          </section>

          <section class="portrait-frame">
            <img v-if="character.image" :src="resolveImage(character.image)" alt="Retrato del personaje" class="character-image" />
            <div v-else class="character-image no-image">Sin retrato</div>
            <div class="portrait-name">{{ character.name }}</div>
          </section>

          <section class="progress panel">
            <div><b>EXP:</b> {{ character.exp }}</div>
            <div><b>NEC:</b> {{ character.required_experience }}</div>
            <div><b>NIVEL:</b> {{ character.level }}</div>
            <form class="quick-form no-print" @submit.prevent="addExperience">
              <input v-model.number="expAmount" type="number" min="1" max="10000" placeholder="EXP" />
              <button type="submit">+ EXP</button>
            </form>
          </section>
        </section>

        <section class="equipment-col">
          <section class="ornate-box equipment">
            <h2>EQUIPO <small>Carga Total: {{ cargaTotal }}/{{ character.max_carry_kg ?? 50 }} kg</small></h2>
            <div v-for="item in character.inventory" :key="item.object_id ?? item.name" class="equipment-row">
              <span>{{ item.name }}</span><b>{{ item.quantity }}</b>
            </div>
            <form class="quick-form no-print" @submit.prevent="addItemToCharacter">
              <select v-model="selectedObjectId">
                <option :value="null" disabled>Objeto</option>
                <option v-for="obj in objects" :key="obj.id" :value="obj.id">{{ obj.name }}</option>
              </select>
              <input v-model.number="newItemQuantity" type="number" min="1" placeholder="Cant." />
              <button type="submit">+ Objeto</button>
            </form>
          </section>
        </section>

        <aside class="right-col">
          <section class="ornate-box large">
            <h2>HABILIDADES ESPECIALES/RACIALES</h2>
            <div v-for="t in character.raceTraits" :key="t.name" class="skill-row" :class="{ weakness: t.kind === 'weakness' }">
              <b>{{ t.name }}</b><span>{{ t.description }}</span>
            </div>
            <div v-for="a in character.classAbilities" :key="a.level + a.name" class="skill-row" :title="a.description">
              <b>{{ a.name }}</b><span>({{ a.action }}) Nv {{ a.level }}</span>
            </div>
            <div v-for="skill in character.specialSkills" :key="skill" class="skill-row">
              <b>{{ skill }}</b>
            </div>
          </section>

          <section class="ornate-box extra">
            <h2>ATRIBUTOS EXTRA</h2>
            <div v-for="extra in character.extraAttributes" :key="extra" class="skill-row"><b>{{ extra }}</b></div>
            <div class="lined-space"></div>
          </section>

          <div class="bottom-pairs">
            <section class="ornate-box small">
              <h2>MONTURAS</h2><div class="lined-space"></div>
            </section>
            <section class="ornate-box small">
              <h2>MASCOTAS</h2><div class="lined-space"></div>
            </section>
          </div>
        </aside>
      </main>

      <!-- CONTROLES: se mantienen para no perder funcionalidad -->
      <section class="admin-panel">
        <details>
          <summary>Herramientas de edición</summary>
          <router-link :to="`/characters/${character.id}/edit`">✏️ Editar personaje completo</router-link>
          <div class="toolbar">
            <div class="action-card">
              <h3>💰 Oro</h3>
              <div class="action-form">
                <input v-model.number="goldAmount" type="number" min="1" placeholder="Cantidad" />
                <button type="button" @click="addGold">+ Oro</button>
                <button type="button" class="danger" @click="removeGold">- Oro</button>
              </div>
            </div>
            <button type="button" class="delete-button" @click="deleteCurrentCharacter">Eliminar personaje</button>
          </div>
          <div class="inventory-list">
            <div v-for="item in character.inventory" :key="item.object_id ?? item.name" class="inventory-row">
              <span class="item-name">{{ item.name }}</span>
              <input :id="`qty-${item.object_id ?? item.name}`" v-model.number="item.quantity" type="number" min="0" class="quantity-input" />
              <button type="button" @click="updateItemQuantity(item)">🔢 Actualizar</button>
              <button type="button" class="danger" @click="deleteItem(item)">➖ Quitar</button>
            </div>
          </div>
        </details>
      </section>
    </div>
    <div v-else class="loading">Cargando...</div>
  </div>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');

:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; background: #eeeae0; color: #202020; }
.page {
  min-height: 100vh;
  padding: 18px;
  background:
    radial-gradient(circle at 20% 20%, rgba(120,100,70,.05), transparent 28%),
    #f1eee6;
  font-family: "Libre Baskerville", Georgia, serif;
}
.character-sheet {
  width: min(1600px, 100%);
  margin: 0 auto;
  padding: 24px 30px 28px;
  background: #f8f6ef;
  border: 3px solid #5d6373;
  box-shadow: 0 0 0 7px #f8f6ef, 0 0 0 9px #5d6373;
  position: relative;
}
.character-sheet::before,
.character-sheet::after {
  content: "❦";
  position: absolute;
  color: #5d6373;
  font-size: 28px;
  top: 4px;
}
.character-sheet::before { left: 10px; }
.character-sheet::after { right: 10px; transform: scaleX(-1); }

h2, h3 { margin: 0; }
.sheet-header {
  display: grid;
  grid-template-columns: 1.15fr 135px 1.35fr 55px 112px 112px 130px;
  gap: 14px;
  align-items: start;
}
.identity { padding-top: 4px; }
.line-field {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-height: 24px;
  font-size: 13px;
  border-bottom: 1px dashed #777;
  margin-bottom: 4px;
}
.line-field b { min-width: 90px; }
.crest { text-align: center; }
.crest-shape {
  width: 82px; height: 88px; margin: 0 auto 3px;
  border: 3px solid #687083;
  border-radius: 44% 44% 48% 48% / 18% 18% 70% 70%;
  display: flex; flex-direction: column; justify-content: center;
  position: relative; color: #687083;
  background: #f8f6ef;
}
.crest-shape::before, .crest-shape::after {
  content: "❧"; position: absolute; top: 18px; font-size: 30px;
}
.crest-shape::before { left: -28px; transform: scaleX(-1); }
.crest-shape::after { right: -28px; }
.crest-top { font-size: 13px; font-weight: 700; }
.crest-initial { font: 700 27px Cinzel, serif; }
.crest small { font-size: 7px; white-space: nowrap; }

.armor { grid-column: 3 / 5; }
.armor h2, .weapons h2, .movement h2 {
  font: 700 18px Cinzel, Georgia, serif;
  color: #272c39;
  letter-spacing: .5px;
  border-bottom: 3px solid #5d6373;
  padding-bottom: 3px;
}
.armor-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  column-gap: 12px; row-gap: 4px; margin-top: 7px;
}
.armor-grid div { font-size: 10px; display: flex; gap: 5px; white-space: nowrap; }
.armor-grid b { min-width: 48px; }

.portrait-mark {
  font-size: 54px; color: #5d6373; text-align: center;
  transform: rotate(-8deg); padding-top: 5px;
}
.mini-box { border: 2px solid #5d6373; min-height: 116px; position: relative; }
.mini-box h3 {
  position: absolute; top: -10px; left: 12px; padding: 0 8px;
  background: #f8f6ef; font: 700 12px Cinzel, serif; letter-spacing: .4px;
}
.mini-box .blank { height: 100%; min-height: 110px; }
.treasure { padding: 16px 8px 6px; }
.coin { display: grid; grid-template-columns: 40px 1fr; font-size: 9px; margin: 3px 0; border-bottom: 1px dotted #888; }
.coin span { text-align: right; }

.physical {
  display: grid; grid-template-columns: repeat(6, 1fr) 2fr;
  gap: 12px; margin: 9px 0 11px; padding: 5px 0;
  border-top: 2px solid #5d6373; border-bottom: 2px solid #5d6373;
}
.physical div { font-size: 10px; display: flex; gap: 5px; }
.physical b { white-space: nowrap; }
.physical .marks { grid-column: 1 / -1; }

.panel, .ornate-section, .ornate-box { position: relative; }
.panel h2, .ornate-section h2, .ornate-box h2 {
  text-align: center; color: #252b38; font: 700 16px Cinzel, Georgia, serif;
  letter-spacing: .4px; padding: 2px 12px 4px; margin-bottom: 6px;
  position: relative;
}
.panel h2::before, .panel h2::after,
.ornate-section h2::before, .ornate-section h2::after,
.ornate-box h2::before, .ornate-box h2::after {
  content: "────"; color: #687083; margin: 0 6px; letter-spacing: -2px;
}
.weapons { margin-bottom: 13px; }
.weapon-head, .weapon-row {
  display: grid; grid-template-columns: 1.7fr .55fr .25fr .25fr .25fr .25fr .5fr .5fr 1.4fr;
  gap: 4px; align-items: center;
}
.weapon-head { font-size: 8px; font-weight: 700; padding-bottom: 2px; }
.weapon-row { font-size: 8px; min-height: 18px; border-bottom: 1px dashed #999; }

.body-grid {
  display: grid;
  grid-template-columns: 285px 330px 300px minmax(350px, 1fr);
  gap: 20px;
  align-items: start;
}
.left-col { display: flex; flex-direction: column; gap: 10px; }
.ornate-section {
  border-bottom: 2px solid #687083;
  padding-bottom: 5px;
}
.range-line { font-size: 8px; text-align: center; }
.stats .stat-row {
  display: grid; grid-template-columns: 1fr 48px 42px; align-items: center;
  min-height: 30px; border-bottom: 2px solid #687083; font-size: 11px;
}
.stat-name { text-transform: uppercase; font-weight: 700; text-align: center; }
.stat-row strong {
  width: 42px; height: 42px; border: 2px solid #687083; border-radius: 50%;
  display: grid; place-items: center; font-size: 15px; background: #f8f6ef;
}
.stat-row em {
  font-style: normal; width: 30px; height: 24px; border: 1px solid #687083;
  display: grid; place-items: center; font-weight: 700;
}
.text-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 4px; border-bottom: 1px solid #aaa; font-size: 9px;
}
.text-row b { width: 30px; height: 30px; border: 2px solid #687083; border-radius: 50%; display: grid; place-items: center; }
.conditions div {
  border-bottom: 1px solid #777; padding: 7px 4px; font-size: 9px; font-weight: 700;
  text-transform: uppercase;
}

.movement { margin-bottom: 8px; }
.movement-head, .movement-values {
  display: grid; grid-template-columns: repeat(5, 1fr); text-align: center;
}
.movement-head { font-size: 8px; border-bottom: 2px solid #687083; padding-bottom: 4px; }
.movement-values span { border: 1px solid #777; border-top: 0; min-height: 26px; padding-top: 5px; font-weight: 700; font-size: 10px; }

.portrait-frame {
  border: 4px solid #687083; padding: 8px; position: relative;
  background: #f5f2e9;
  box-shadow: inset 0 0 0 2px #f8f6ef;
}
.portrait-frame::before, .portrait-frame::after {
  content: "❧"; position: absolute; color: #687083; font-size: 31px; top: -8px;
}
.portrait-frame::before { left: -10px; }
.portrait-frame::after { right: -10px; transform: scaleX(-1); }
.character-image { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; display: block; }
.no-image { display: grid; place-items: center; background: #e8e4d8; color: #687083; font-size: 12px; }
.portrait-name {
  position: absolute; left: 50%; bottom: 3px; transform: translateX(-50%);
  background: #f8f6ef; padding: 2px 14px; font: 700 10px Cinzel, serif;
}
.progress {
  display: flex; justify-content: space-between; gap: 10px; margin-top: 8px;
  border-top: 2px solid #687083; border-bottom: 2px solid #687083;
  padding: 5px 2px; font-size: 9px;
}

.ornate-box {
  border: 3px solid #687083;
  padding: 22px 12px 12px;
  min-height: 250px;
}
.ornate-box::before, .ornate-box::after {
  content: "❧"; position: absolute; color: #687083; font-size: 27px;
  top: -15px; background: #f8f6ef; padding: 0 3px;
}
.ornate-box::before { left: 7px; transform: scaleX(-1); }
.ornate-box::after { right: 7px; }
.ornate-box h2 { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #f8f6ef; }
.ornate-box h2 small { font: 700 8px "Libre Baskerville", serif; margin-left: 12px; }
.equipment { min-height: 620px; }
.equipment-row {
  display: grid; grid-template-columns: 1fr 38px; gap: 7px; padding: 4px 2px;
  border-bottom: 1px solid #aaa; font-size: 9px;
}
.equipment-row b { border: 1px solid #687083; text-align: center; padding: 2px; }

.right-col { display: flex; flex-direction: column; gap: 14px; }
.ornate-box.large { min-height: 275px; }
.skill-row { display: flex; gap: 10px; padding: 5px 2px; border-bottom: 1px dotted #888; font-size: 9px; }
.skill-row b { min-width: 150px; }
.skill-row.weakness { color: #a00; }
.rolls-banner {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  margin-bottom: 12px; padding: 8px 12px; background: #f0e9d8; border: 1px solid #5d6373; font-size: 12px;
}
.ornate-box.extra { min-height: 245px; }
.lined-space { min-height: 180px; background: repeating-linear-gradient(to bottom, transparent 0, transparent 24px, rgba(80,80,80,.18) 25px); }
.bottom-pairs { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ornate-box.small { min-height: 150px; }

.quick-form { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; font-family: Arial, sans-serif; }
.quick-form input, .quick-form select { padding: 4px; border: 1px solid #888; min-width: 0; flex: 1; }
.admin-panel { margin-top: 22px; font-family: Arial, sans-serif; }
.admin-panel details { border: 1px solid #aaa; background: #ebe8df; padding: 8px; }
.admin-panel summary { cursor: pointer; font-weight: 700; }
.toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.action-card { background: #fff; border: 1px solid #777; padding: 10px; }
.action-card h3 { margin: 0 0 7px; font-size: 13px; }
.action-form { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.action-form input, .action-form select { padding: 6px; border: 1px solid #888; }
button { cursor: pointer; border: 1px solid #555; background: #f5f0df; padding: 6px 9px; font-weight: 700; }
button:hover { background: #e7dfca; }
button.danger, .delete-button { background: #efd0d0; }
.inventory-list { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
.inventory-row { display: flex; align-items: center; gap: 6px; border: 1px solid #aaa; padding: 6px; }
.item-name { flex: 1; font-weight: 700; }
.quantity-input { width: 60px; padding: 4px; border: 1px solid #888; }
.loading { text-align: center; padding: 60px; font-family: Georgia, serif; }

@media (max-width: 1250px) {
  .sheet-header { grid-template-columns: 1.1fr 110px 1.3fr 100px 100px 100px; }
  .portrait-mark { display: none; }
  .body-grid { grid-template-columns: 250px 300px 280px 1fr; gap: 13px; }
}
@media (max-width: 1050px) {
  .sheet-header { grid-template-columns: 1fr 1fr; }
  .armor { grid-column: auto; }
  .body-grid { grid-template-columns: 1fr 1fr; }
  .right-col { grid-column: 1 / -1; }
}
@media (max-width: 700px) {
  .page { padding: 8px; }
  .character-sheet { padding: 18px 12px; }
  .sheet-header, .body-grid, .physical { grid-template-columns: 1fr; }
  .armor { grid-column: auto; }
  .mini-box { min-height: 100px; }
  .body-grid > * { grid-column: auto; }
  .bottom-pairs { grid-template-columns: 1fr; }
}
@media print {
  .page { padding: 0; background: #fff; }
  .character-sheet { box-shadow: none; width: 100%; border-width: 2px; }
  .admin-panel, .no-print { display: none; }
}
</style>

<script setup>

import {
  ref,
  computed,
  onMounted
} from "vue";

import axios from "axios";

const props = defineProps({
  id: { type: String, required: true }
});


/* ============================= */
/* ESTADO */
/* ============================= */

const token = ref("");

const character = ref(null);

const objects = ref([]);


/*
 * Ya no necesitamos editableCharacter
 * porque no vamos a editar directamente
 * los datos básicos del personaje.
 */


/* EXP */

const expAmount = ref(0);


/* ORO */

const goldAmount = ref(0);


/* INVENTARIO */

const selectedObjectId = ref(null);

const newItemQuantity = ref(1);


let socket = null;


const weaponRows = computed(() =>
  Array.from({ length: 6 }, (_, i) =>
    character.value?.weapons?.find((w) => w.slot === i + 1) ?? null
  )
);


/* ============================= */
/* TIRADAS DE CREACIÓN Y PUNTOS DE CARACTERÍSTICA */
/* ============================= */

const lastRolls = ref(null);

const STAT_IDS = {
  "Fuerza": 1,
  "Destreza": 2,
  "Constitución": 3,
  "Inteligencia": 4,
  "Sabiduría": 5,
  "Carisma": 6
};

async function spendStatPoint(name) {
  try {
    const updated = await axios.post(
      `http://localhost:3000/characters/${character.value.id}/stat-points`,
      { stat_id: STAT_IDS[name], points: 1 }
    );

    character.value = updated.data;
  } catch (error) {
    alert(error.response?.data?.error || "No se pudo repartir el punto.");
  }
}

function readLastRolls(characterId) {
  try {
    const stored = JSON.parse(sessionStorage.getItem("lastRolls") || "null");

    if (stored && String(stored.id) === String(characterId)) {
      lastRolls.value = stored.rolls;
      sessionStorage.removeItem("lastRolls");
    }
  } catch {
    // sin sessionStorage no se muestra el resumen
  }
}


/* ============================= */
/* CARGA TOTAL */
/* ============================= */

const cargaTotal = computed(() => {

  if (
    !character.value ||
    !character.value.inventory
  ) {
    return 0;
  }


  return character.value.inventory.reduce(
    (total, item) => {

      const weight =
        Number(item.weight_kg) || 0;

      const quantity =
        Number(item.quantity) || 0;

      return total + weight * quantity;

    },
    0
  );

});


/* ============================= */
/* OBTENER PERSONAJE */
/* ============================= */

async function get_character(id) {

  const charRes = await axios.get(
    `http://localhost:3000/characters/${id}`
  );


  character.value = charRes.data;

}


/* ============================= */
/* CARGAR OBJETOS */
/* ============================= */

async function loadObjects() {

  const res = await axios.get(
    "http://localhost:3000/objects"
  );


  objects.value = res.data;

}


/* ============================= */
/* AÑADIR EXPERIENCIA */
/* ============================= */

async function addExperience() {

  if (!character.value) {
    return;
  }


  const amount =
    Number(expAmount.value) || 0;


  if (amount <= 0) {

    alert(
      "La experiencia debe ser mayor que 0."
    );

    return;
  }


  const MAX_EXP_PER_ACTION = 10000;


  if (amount > MAX_EXP_PER_ACTION) {

    alert(
      `No puedes añadir más de ${MAX_EXP_PER_ACTION} de experiencia de una vez.`
    );

    return;
  }


  try {

    const updated = await axios.post(
      `http://localhost:3000/characters/${character.value.id}/experience`,
      {
        amount
      }
    );


    character.value =
      updated.data;


    expAmount.value = 0;

    if (updated.data.levels_gained > 0) {
      alert(`¡Subes al nivel ${updated.data.level}!`);
    }


  } catch (error) {

    console.error(
      "Error añadiendo experiencia:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo añadir la experiencia."
    );

  }

}
/* ============================= */
/* AÑADIR ORO */
/* ============================= */

async function addGold() {

  if (!character.value) {
    return;
  }


  const amount =
    Number(goldAmount.value) || 0;


  if (amount <= 0) {

    alert(
      "La cantidad debe ser mayor que 0."
    );

    return;
  }


  try {

    const updated = await axios.post(
      `http://localhost:3000/characters/${character.value.id}/gold`,
      {
        amount
      }
    );


    character.value = updated.data;


    goldAmount.value = 0;


  } catch (error) {

    console.error(
      "Error añadiendo oro:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo añadir el oro."
    );

  }

}


/* ============================= */
/* QUITAR ORO */
/* ============================= */

async function removeGold() {

  if (!character.value) {
    return;
  }


  const amount =
    Number(goldAmount.value) || 0;


  if (amount <= 0) {

    alert(
      "La cantidad debe ser mayor que 0."
    );

    return;
  }


  try {

    const updated = await axios.delete(
      `http://localhost:3000/characters/${character.value.id}/gold`,
      {
        data: {
          amount
        }
      }
    );


    character.value = updated.data;


    goldAmount.value = 0;


  } catch (error) {

    console.error(
      "Error quitando oro:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo quitar el oro."
    );

  }

}


/* ============================= */
/* AÑADIR OBJETO */
/* ============================= */

async function addItemToCharacter() {

  if (
    !character.value ||
    selectedObjectId.value === null
  ) {
    return;
  }


  const quantity =
    Number(newItemQuantity.value) || 1;


  if (quantity <= 0) {

    alert(
      "La cantidad debe ser mayor que 0."
    );

    return;
  }


  try {

    const updated = await axios.post(
      `http://localhost:3000/characters/${character.value.id}/items`,
      {
        object_id:
          Number(selectedObjectId.value),

        quantity
      }
    );


    character.value =
      updated.data.character;


    selectedObjectId.value = null;

    newItemQuantity.value = 1;


  } catch (error) {

    console.error(
      "Error añadiendo objeto:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo añadir el objeto."
    );

  }

}


/* ============================= */
/* ACTUALIZAR CANTIDAD */
/* ============================= */

async function updateItemQuantity(item) {

  if (
    !character.value ||
    !item.object_id
  ) {
    return;
  }


  const quantity =
    Number(item.quantity) || 0;


  try {

    const updated = await axios.put(
      `http://localhost:3000/characters/${character.value.id}/items/${item.object_id}`,
      {
        quantity
      }
    );


    character.value =
      updated.data.character;


  } catch (error) {

    console.error(
      "Error actualizando objeto:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo actualizar la cantidad."
    );

  }

}


/* ============================= */
/* QUITAR OBJETO */
/* ============================= */

async function deleteItem(item) {

  if (
    !character.value ||
    !item.object_id
  ) {
    return;
  }


  const confirmed =
    window.confirm(
      `¿Quieres quitar "${item.name}" del inventario?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const updated = await axios.delete(
      `http://localhost:3000/characters/${character.value.id}/items/${item.object_id}`
    );


    character.value =
      updated.data.character;


  } catch (error) {

    console.error(
      "Error eliminando objeto:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo quitar el objeto."
    );

  }

}


/* ============================= */
/* ELIMINAR PERSONAJE */
/* ============================= */

async function deleteCurrentCharacter() {

  if (!character.value) {
    return;
  }


  const confirmed =
    window.confirm(
      "¿Quieres eliminar este personaje?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await axios.delete(
      `http://localhost:3000/characters/${character.value.id}`
    );


    window.location.href =
      "/characters";


  } catch (error) {

    console.error(
      "Error eliminando personaje:",
      error
    );


    alert(
      error.response?.data?.error ||
      "No se pudo eliminar el personaje."
    );

  }

}


/* ============================= */
/* IMAGEN */
/* ============================= */

function resolveImage(img) {

  if (!img) {
    return "";
  }


  if (
    img.startsWith("http") ||
    img.startsWith("data:")
  ) {
    return img;
  }


  const base =
    "http://localhost:3000/images/";


  return (
    base +
    img.replace(/^\//, "") +
    ".webp"
  );

}


/* ============================= */
/* MOUNT */
/* ============================= */

onMounted(async () => {

  await loadObjects();

  await get_character(props.id);

  readLastRolls(character.value?.id);

});

</script>