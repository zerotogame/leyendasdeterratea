// Reglas de creación de personaje de Terratea.
// Funciones puras (sin BD) para poder testearlas; los datos salen de terratea-razas.json.

const crypto = require("node:crypto");
const data = require("./terratea-razas.json");

const ALIGNMENTS = data.alineamientos.map((a) => a.nombre);
const SEXES = ["Hombre", "Mujer", "No definido"];
const MAX_LEVEL = 20;

// PROVISIONAL: el documento de reglas no define cómo se tiran las características
// ni su modificador (ver "Dudas", punto 7). Un único sitio para cambiarlo cuando se sepa.
const STAT_ROLL = { dice: 3, sides: 6 };
const statModifier = (value) => Math.max(0, Math.floor((value - 10) / 3));

const normalize = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

const rollDie = (sides, randomInt = crypto.randomInt) => randomInt(1, sides + 1);

function raceRules(raceName) {
  const key = Object.keys(data.razas).find((k) => normalize(k) === normalize(raceName));
  return key ? data.razas[key] : null;
}

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Altura, peso y edad contra el rango de la raza. Razas sin rango definido: sin restricción.
function validatePhysical(raceName, { height, weight, age }) {
  const rules = raceRules(raceName);
  const errors = [];

  if (!rules) return errors;

  const checks = [
    ["La altura", height, rules.altura_m, "m"],
    ["El peso", weight, rules.peso_kg, "kg"]
  ];

  for (const [label, value, range, unit] of checks) {
    if (!range) continue;

    if (!isNumber(value)) {
      errors.push(`${label} es obligatoria para la raza ${raceName}.`);
    } else if (value < range[0] || value > range[1]) {
      errors.push(`${label} de ${raceName} debe estar entre ${range[0]} y ${range[1]} ${unit}.`);
    }
  }

  if (age != null) {
    if (!isNumber(age) || age <= 0) {
      errors.push("La edad debe ser un número mayor que 0.");
    } else if (rules.esperanza_vida_anios && age > rules.esperanza_vida_anios[1]) {
      errors.push(`La edad de ${raceName} no puede superar ${rules.esperanza_vida_anios[1]} años.`);
    }
  } else if (rules.esperanza_vida_anios) {
    errors.push(`La edad es obligatoria para la raza ${raceName}.`);
  }

  return errors;
}

// Lista cerrada de alineamientos y restricciones de la clase (null = cualquiera)
function validateAlignment(alignment, allowedByClass = null) {
  if (!ALIGNMENTS.includes(alignment)) {
    return [`El alineamiento debe ser uno de: ${ALIGNMENTS.join(", ")}.`];
  }

  if (allowedByClass && !allowedByClass.includes(alignment)) {
    return [`La clase solo permite los alineamientos: ${allowedByClass.join(", ")}.`];
  }

  return [];
}

// Lista cerrada de sexos; vacío/ausente es válido (campo opcional)
function validateSex(sex) {
  if (sex == null || sex === "" || SEXES.includes(sex)) return [];
  return [`El sexo debe ser uno de: ${SEXES.join(", ")}.`];
}

// Razas permitidas por la clase; las razas polivalentes pueden aprender cualquier clase
function validateClassRace(allowedRaces, raceName, raceTraitNames = []) {
  if (!allowedRaces || !allowedRaces.length) return [];
  if (raceTraitNames.some((t) => normalize(t) === "polivalente")) return [];

  if (!allowedRaces.some((r) => normalize(r) === normalize(raceName))) {
    return [`La clase no permite la raza ${raceName}.`];
  }

  return [];
}

// 1d12 con mínimo 3 en el dado, más el modificador de Constitución
function rollInitialVitality(constitutionModifier, randomInt = crypto.randomInt) {
  const { dado, minimo_tirada: minimum } = data.vitalidad.inicial;
  const roll = rollDie(Number(dado.split("d")[1]), randomInt);

  return { roll, total: Math.max(roll, minimum) + constitutionModifier };
}

const inRange = ([from, to], level) => level >= from && level <= to;

// Vitalidad que se gana al llegar a un nivel (el nivel 1 usa la vitalidad inicial)
function vitalityForLevel(level) {
  if (level < 2) return 0;
  return data.vitalidad.por_nivel.find((r) => inRange(r.niveles, level))?.vitalidad_extra ?? 0;
}

// Puntos de característica que da llegar a un nivel (solo 10 y 20)
function statPointsForLevel(level) {
  return data.vitalidad.puntos_caracteristica.find((p) => p.nivel === level)?.puntos ?? 0;
}

// Tirada de salvación por raza y nivel. rows = filas de race_saves de una raza.
function savesForLevel(rows, level) {
  return rows
    .filter((r) => r.level_min <= level && (r.level_max == null || r.level_max >= level))
    .map((r) => ({ save_id: r.save_id, value: r.value }));
}

// Tirada de una característica con sus dados. Si la clase exige un mínimo, se repite
// la tirada de esa característica hasta cumplirlo (attempts indica cuántas hicieron falta).
function rollStat(minimum = 0, randomInt = crypto.randomInt, maxAttempts = 1000) {
  for (let attempts = 1; attempts <= maxAttempts; attempts++) {
    const dice = Array.from({ length: STAT_ROLL.dice }, () => rollDie(STAT_ROLL.sides, randomInt));
    const value = dice.reduce((total, die) => total + die, 0);

    if (value >= minimum) return { dice, value, modifier: statModifier(value), attempts };
  }

  throw new Error("No se pudo obtener una tirada que cumpla los requisitos de la clase.");
}

// Tirada de las 6 características de una vez (creación sin sesión de tiradas)
function rollCharacteristics(statNames, minimums = {}, randomInt = crypto.randomInt) {
  return statNames.map((name) => {
    const { value, modifier } = rollStat(minimums[name] ?? 0, randomInt);
    return { name, value, modifier };
  });
}

// Alcance: mínimo 1; penalizaciones por casilla por encima del alcance
function rangePenalty(range, distance) {
  const extra = Math.max(0, distance - Math.max(range, data.alcance.minimo));
  const { tirada_accion: action, tirada_dano_o_sanacion: damage } = data.alcance.penalizacion_por_casilla_extra;

  return { action: extra ? extra * action : 0, damage: extra ? extra * damage : 0 };
}

module.exports = {
  ALIGNMENTS,
  SEXES,
  validateSex,
  MAX_LEVEL,
  statModifier,
  normalize,
  rollDie,
  raceRules,
  validatePhysical,
  validateAlignment,
  validateClassRace,
  rollInitialVitality,
  vitalityForLevel,
  statPointsForLevel,
  savesForLevel,
  rollStat,
  rollCharacteristics,
  rangePenalty
};
