<template>
  <div class="page">
    <h1>{{ isEdit ? "Editar personaje" : "Nuevo personaje" }}</h1>

    <form v-if="ready" @submit.prevent="save">
      <fieldset>
        <legend>Identidad</legend>
        <div class="grid">
          <label>Personaje <input v-model="form.name" required /></label>
          <label>Jugador <input v-model="form.player_name" required /></label>
          <label>Gremio <input v-model="form.guild" /></label>
          <label>Clase
            <select v-model.number="form.class_id" required :disabled="isEdit">
              <option :value="null" disabled>Selecciona</option>
              <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </label>
          <label>Raza
            <select v-model.number="form.race_id" required :disabled="isEdit">
              <option :value="null" disabled>Selecciona</option>
              <option v-for="r in races" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </label>
          <label>Alineamiento
            <select v-model="form.alignment" required>
              <option :value="null" disabled>Selecciona</option>
              <option v-for="a in alignments" :key="a" :value="a">{{ a }}</option>
            </select>
          </label>
          <label>Imagen (opcional) <input v-model="form.image" placeholder="id o URL" /></label>
        </div>
      </fieldset>

      <fieldset v-if="raceInfo || classInfo" class="info">
        <legend>Raza y clase</legend>

        <template v-if="raceInfo">
          <p v-if="raceInfo.max_carry_kg != null"><b>Carga máxima:</b> {{ raceInfo.max_carry_kg }} kg</p>
          <template v-if="raceInfo.traits.length">
            <b>Rasgos de {{ raceInfo.name }}</b>
            <ul>
              <li v-for="t in raceInfo.traits" :key="t.name" :class="t.kind">
                {{ t.kind === "weakness" ? "⚠ Debilidad" : "✔ Fortaleza" }}: {{ t.name }}
                <span v-if="t.description"> — {{ t.description }}</span>
              </li>
            </ul>
          </template>
        </template>

        <template v-if="classInfo">
          <p><b>{{ classInfo.name }}</b>
            <span v-if="classInfo.alignment"> · Alineamiento: {{ classInfo.alignment }}</span>
            <span v-if="classInfo.range_distance"> · Rango de distancia: {{ classInfo.range_distance }}</span>
          </p>
          <p v-if="classInfo.requirements"><b>Requisitos:</b> {{ classInfo.requirements }}</p>
          <p v-if="classInfo.starting_items"><b>Elementos iniciales:</b> {{ classInfo.starting_items }}</p>
          <p v-if="classInfo.armor_types"><b>Armadura:</b> {{ classInfo.armor_types }}</p>
          <p v-if="classInfo.weapon_restrictions"><b>Armas:</b> {{ classInfo.weapon_restrictions }}</p>
          <p v-if="classInfo.allowed_races"><b>Razas permitidas:</b> {{ classInfo.allowed_races.join(", ") }}</p>
          <template v-if="visibleAbilities.length">
            <b>Habilidades de clase (nivel {{ form.level || 1 }})</b>
            <ul>
              <li v-for="a in visibleAbilities" :key="a.level + a.name">
                Nv {{ a.level }} · {{ a.name }} ({{ a.action === "P" ? "Pasiva" : "Activa" }}) — {{ a.description }}
              </li>
            </ul>
          </template>
        </template>
      </fieldset>

      <fieldset>
        <legend>Datos físicos</legend>
        <div class="grid">
          <label>Altura (m) <small v-if="ranges?.altura_m">{{ ranges.altura_m[0] }} – {{ ranges.altura_m[1] }}</small>
            <input v-model.number="form.height" type="number" step="0.01"
                   :min="ranges?.altura_m?.[0]" :max="ranges?.altura_m?.[1]" :required="Boolean(ranges?.altura_m)" />
          </label>
          <label>Peso (kg) <small v-if="ranges?.peso_kg">{{ ranges.peso_kg[0] }} – {{ ranges.peso_kg[1] }}</small>
            <input v-model.number="form.weight" type="number" step="0.01"
                   :min="ranges?.peso_kg?.[0]" :max="ranges?.peso_kg?.[1]" :required="Boolean(ranges?.peso_kg)" />
          </label>
          <label>Edad <small v-if="ranges?.esperanza_vida_anios">máx. {{ ranges.esperanza_vida_anios[1] }}</small>
            <input v-model.number="form.age" type="number" min="1" :max="ranges?.esperanza_vida_anios?.[1]"
                   :required="Boolean(ranges?.esperanza_vida_anios)" />
          </label>
          <label>Sexo
            <select v-model="form.sex">
              <option v-for="s in sexes" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label>Cabello <input v-model="form.hair" /></label>
          <label>Ojos <input v-model="form.eyes" /></label>
          <label>Marcas <input v-model="form.marks" /></label>
        </div>
      </fieldset>

      <fieldset v-if="!isEdit" class="dice">
        <legend>Tiradas de creación</legend>

        <p class="note">
          Las tiradas las hace la app y no se pueden introducir a mano ni repetir. Nivel, EXP, salvaciones,
          movimiento y alcance se calculan solos con las reglas de tu raza y clase.
        </p>

        <p v-if="!form.class_id">Elige una clase para poder tirar los dados.</p>

        <template v-else>
          <div class="dice-actions">
            <button type="button" :disabled="rolling || allRolled" @click="rollAll">🎲 Tirar todo</button>
          </div>

          <div v-for="stat in statDefs" :key="stat.id" class="dice-row">
            <span class="dice-name">{{ stat.name }}</span>
            <button type="button" class="dice-button" :class="{ shaking: rollingName === stat.name }"
                    :disabled="rolling || Boolean(rolls[stat.name])" @click="rollStat(stat)">🎲</button>
            <span v-if="rolls[stat.name]" class="dice-result">
              {{ rolls[stat.name].dice.join(" + ") }} = <b>{{ rolls[stat.name].value }}</b>
              (modificador {{ rolls[stat.name].modifier >= 0 ? "+" : "" }}{{ rolls[stat.name].modifier }})
              <small v-if="rolls[stat.name].attempts > 1">
                · repetida {{ rolls[stat.name].attempts - 1 }} vez/veces: tu clase exige un mínimo
              </small>
            </span>
            <span v-else class="dice-pending">sin tirar</span>
          </div>

          <div class="dice-row">
            <span class="dice-name">Vitalidad</span>
            <button type="button" class="dice-button" :class="{ shaking: rollingName === 'Vitalidad' }"
                    :disabled="rolling || !rolls['Constitución'] || Boolean(vitality)" @click="rollVitality">🎲</button>
            <span v-if="vitality" class="dice-result">
              1d12 → {{ vitality.roll }}<span v-if="vitality.roll < 3"> (mínimo 3)</span>
              {{ vitality.constitutionModifier >= 0 ? "+" : "-" }} Constitución {{ Math.abs(vitality.constitutionModifier) }}
              = <b>{{ vitality.total }}</b>
            </span>
            <span v-else class="dice-pending">
              {{ rolls["Constitución"] ? "sin tirar" : "tira antes la Constitución" }}
            </span>
          </div>
        </template>
      </fieldset>

      <template v-if="isEdit">
        <fieldset>
          <legend>Combate y tesoro</legend>
          <div class="grid">
            <label>CA <input v-model.number="form.armor_class" type="number" /></label>
            <label>Oro <input v-model.number="form.gold" type="number" min="0" /></label>
            <label>Plata <input v-model.number="form.silver" type="number" min="0" /></label>
            <label>Cobre <input v-model.number="form.copper" type="number" min="0" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Armamento (máx. 6)</legend>
          <div v-for="(w, i) in form.weapons" :key="i" class="weapon">
            <input v-model="w.name" placeholder="Arma" />
            <input v-model.number="w.attack_magic" type="number" placeholder="Magia" />
            <input v-model.number="w.attack_element" type="number" placeholder="Elemento" />
            <input v-model.number="w.attack_malediction" type="number" placeholder="Maldición" />
            <input v-model="w.weight" placeholder="Peso" />
            <input v-model.number="w.hands" type="number" placeholder="Manos" />
            <input v-model="w.damage" placeholder="Daño" />
            <input v-model="w.total" placeholder="Total" />
            <input v-model="w.special" placeholder="Especial" />
            <button type="button" class="danger" @click="form.weapons.splice(i, 1)">✕</button>
          </div>
          <button v-if="form.weapons.length < 6" type="button" @click="addWeapon">➕ Añadir arma</button>
        </fieldset>

        <fieldset>
          <legend>Habilidades especiales</legend>
          <div v-for="(_, i) in form.specialSkills" :key="i" class="row">
            <input v-model="form.specialSkills[i]" />
            <button type="button" class="danger" @click="form.specialSkills.splice(i, 1)">✕</button>
          </div>
          <button type="button" @click="form.specialSkills.push('')">➕ Añadir habilidad</button>
        </fieldset>

        <fieldset>
          <legend>Atributos extra</legend>
          <div v-for="(_, i) in form.extraAttributes" :key="i" class="row">
            <input v-model="form.extraAttributes[i]" />
            <button type="button" class="danger" @click="form.extraAttributes.splice(i, 1)">✕</button>
          </div>
          <button type="button" @click="form.extraAttributes.push('')">➕ Añadir atributo</button>
        </fieldset>

        <fieldset>
          <legend>Equipo</legend>
          <div v-for="(item, i) in form.inventory" :key="i" class="row">
            <select v-model.number="item.object_id">
              <option :value="null" disabled>Selecciona objeto</option>
              <option v-for="o in objects" :key="o.id" :value="o.id">{{ o.name }}</option>
            </select>
            <input v-model.number="item.quantity" type="number" min="1" class="qty" />
            <button type="button" class="danger" @click="form.inventory.splice(i, 1)">✕</button>
          </div>
          <button type="button" @click="form.inventory.push({ object_id: null, quantity: 1 })">➕ Añadir objeto</button>
        </fieldset>
      </template>

      <ul v-if="errors.length" class="error">
        <li v-for="e in errors" :key="e">{{ e }}</li>
      </ul>

      <div class="actions">
        <button type="submit" :disabled="saving || (!isEdit && !allRolled)">
          {{ isEdit ? "Guardar cambios" : "Crear personaje" }}
        </button>
        <small v-if="!isEdit && !allRolled">Tira todos los dados para poder crear el personaje.</small>
        <router-link :to="isEdit ? `/characters/${id}` : '/characters'">Cancelar</router-link>
      </div>
    </form>
    <p v-else>Cargando...</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const API = "http://localhost:3000";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const isEdit = computed(() => Boolean(id.value));

const ready = ref(false);
const saving = ref(false);
const errors = ref([]);

const classes = ref([]);
const races = ref([]);
const objects = ref([]);
const alignments = ref([]);
const sexes = ref([]);

const raceInfo = ref(null);
const classInfo = ref(null);

const ranges = computed(() => raceInfo.value?.ranges ?? null);

const form = ref({
  name: "", player_name: "", guild: "", class_id: null, race_id: null, alignment: null, image: "",
  height: null, weight: null, age: null, sex: "No definido", hair: "", eyes: "", marks: "", level: 1,
  armor_class: null, gold: 0, silver: 0, copper: 0,
  weapons: [], specialSkills: [], extraAttributes: [], inventory: []
});

const visibleAbilities = computed(() =>
  (classInfo.value?.abilities ?? []).filter((a) => a.level <= (Number(form.value.level) || 1))
);

watch(() => form.value.race_id, async (raceId) => {
  raceInfo.value = raceId ? (await axios.get(`${API}/races/${raceId}`)).data : null;
});

watch(() => form.value.class_id, async (classId) => {
  classInfo.value = classId ? (await axios.get(`${API}/classes/${classId}`)).data : null;
  resetRolls();
});

/* Tiradas de creación: las hace el servidor, aquí solo se piden y se muestran */

const statDefs = ref([]);
const rollSession = ref(null);
const rolls = ref({});
const vitality = ref(null);
const rolling = ref(false);
const rollingName = ref("");

const allRolled = computed(() =>
  statDefs.value.length > 0 && statDefs.value.every((s) => rolls.value[s.name]) && Boolean(vitality.value)
);

function resetRolls() {
  rollSession.value = null;
  rolls.value = {};
  vitality.value = null;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Pide una tirada al servidor con una pequeña animación del dado
async function doRoll(name, request) {
  rolling.value = true;
  rollingName.value = name;
  errors.value = [];

  try {
    if (!rollSession.value) {
      rollSession.value = (await axios.post(`${API}/rolls/session`, { class_id: form.value.class_id })).data.session;
    }

    const [result] = await Promise.all([request(rollSession.value), pause(500)]);
    return result;
  } catch (err) {
    errors.value = [err.response?.data?.error || "No se pudo tirar el dado."];
    resetRolls();
    return null;
  } finally {
    rolling.value = false;
    rollingName.value = "";
  }
}

async function rollStat(stat) {
  const result = await doRoll(stat.name, async (session) =>
    (await axios.post(`${API}/rolls/${session}/stat`, { stat_id: stat.id })).data
  );

  if (result) rolls.value = { ...rolls.value, [stat.name]: result };
}

async function rollVitality() {
  const result = await doRoll("Vitalidad", async (session) =>
    (await axios.post(`${API}/rolls/${session}/vitality`)).data
  );

  if (result) vitality.value = result;
}

async function rollAll() {
  for (const stat of statDefs.value) {
    if (!rolls.value[stat.name]) await rollStat(stat);
  }

  if (!vitality.value && rolls.value["Constitución"]) await rollVitality();
}

function addWeapon() {
  form.value.weapons.push({
    name: "", attack_magic: null, attack_element: null, attack_malediction: null,
    weight: "", hands: null, damage: "", total: "", special: ""
  });
}

async function load() {
  const [classesRes, racesRes, objectsRes, rulesRes, catalogRes] = await Promise.all([
    axios.get(`${API}/classes`),
    axios.get(`${API}/races`),
    axios.get(`${API}/objects`),
    axios.get(`${API}/rules`),
    axios.get(`${API}/catalog`)
  ]);

  statDefs.value = catalogRes.data.stats;

  classes.value = classesRes.data;
  races.value = racesRes.data;
  objects.value = objectsRes.data;
  alignments.value = rulesRes.data.alignments;
  sexes.value = rulesRes.data.sexes;

  if (isEdit.value) {
    const current = (await axios.get(`${API}/characters/${id.value}`)).data;
    const { class: className, race: raceName, ...rest } = current;

    Object.assign(form.value, rest, {
      class_id: classes.value.find((c) => c.name === className)?.id ?? null,
      race_id: races.value.find((r) => r.name === raceName)?.id ?? null,
      inventory: current.inventory.map((i) => ({ object_id: i.object_id, quantity: i.quantity })),
      weapons: current.weapons.map((w) => ({ ...w })),
      specialSkills: [...current.specialSkills],
      extraAttributes: [...current.extraAttributes]
    });
  }

  ready.value = true;
}

async function save() {
  errors.value = [];
  saving.value = true;

  try {
    if (isEdit.value) {
      await axios.put(`${API}/characters/${id.value}`, form.value);
      router.push(`/characters/${id.value}`);
    } else {
      const created = (await axios.post(`${API}/characters`, { ...form.value, roll_session: rollSession.value })).data;

      try {
        sessionStorage.setItem("lastRolls", JSON.stringify({ id: created.id, rolls: created.rolls }));
      } catch {
        // sin sessionStorage solo se pierde el resumen de las tiradas
      }

      router.push(`/characters/${created.id}`);
    }
  } catch (err) {
    errors.value = err.response?.data?.errors ?? [err.response?.data?.error || "No se pudo guardar el personaje."];
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 20px; font-family: serif; }
fieldset { border: 2px solid #000; background: #fff; margin-bottom: 18px; padding: 12px 16px; }
legend { font-weight: bold; padding: 0 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
label { display: flex; flex-direction: column; gap: 4px; font-weight: bold; }
label small { font-weight: normal; color: #555; }
input, select, button { border: 1px solid #000; padding: 7px; font: inherit; }
button { background: #f0e9d8; cursor: pointer; font-weight: bold; }
button.danger { background: #f0d2d2; }
.weapon { display: grid; grid-template-columns: 2fr repeat(3, 1fr) 1fr 1fr 1fr 1fr 2fr auto; gap: 6px; margin-bottom: 8px; }
.row { display: flex; gap: 8px; margin-bottom: 8px; }
.row input, .row select { flex: 1; }
.row .qty { flex: 0 0 90px; }
.info p { margin: 4px 0; }
.info ul { margin: 6px 0 10px; padding-left: 20px; }
.info li.weakness { color: #a00; }
.note { background: #f0e9d8; border: 1px solid #000; padding: 10px 12px; }
.dice-actions { margin-bottom: 10px; }
.dice-row { display: grid; grid-template-columns: 130px 56px 1fr; gap: 10px; align-items: center; padding: 6px 0; border-bottom: 1px dotted #888; }
.dice-name { font-weight: bold; text-transform: uppercase; }
.dice-button { font-size: 22px; line-height: 1; padding: 6px 10px; }
.dice-button:disabled { opacity: .45; cursor: not-allowed; }
.dice-button.shaking { animation: shake .5s linear infinite; }
.dice-result b { font-size: 18px; }
.dice-pending { color: #777; font-style: italic; }
@media (prefers-reduced-motion: reduce) { .dice-button.shaking { animation: none; } }
@keyframes shake {
  0% { transform: rotate(0); } 25% { transform: rotate(-25deg) translateY(-3px); }
  50% { transform: rotate(20deg); } 75% { transform: rotate(-15deg) translateY(-3px); } 100% { transform: rotate(0); }
}
.actions { display: flex; gap: 16px; align-items: center; }
.error { color: #a00; font-weight: bold; }
</style>
