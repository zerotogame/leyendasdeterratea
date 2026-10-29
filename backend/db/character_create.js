const pool = require("./db");
const rules = require("../rules/terratea");
const { saveCharacterFull } = require("./character_write");
const { readSession, discardSession, RollError } = require("../rules/roll_sessions");

class RuleError extends Error {
  constructor(errors) {
    super(errors.join(" "));
    this.errors = errors;
  }
}

// Lo único que decide el jugador al crear: todo lo demás lo calcula la app
const CREATION_FIELDS = [
  "name", "player_name", "guild", "class_id", "race_id", "alignment",
  "height", "weight", "age", "sex", "hair", "eyes", "marks", "image", "roll_session"
];

// Lo que se puede editar después. Nivel, EXP, características, salvaciones, vitalidad,
// movimiento, alcance, clase y raza solo cambian por las reglas.
const EDITABLE_FIELDS = [
  "name", "player_name", "guild", "sex", "hair", "eyes", "marks", "image", "alignment",
  "height", "weight", "age", "armor_class", "gold", "silver", "copper"
];
const EDITABLE_LISTS = ["weapons", "specialSkills", "extraAttributes", "inventory"];

const NUMERIC_FIELDS = ["height", "weight", "age", "armor_class", "gold", "silver", "copper"];

const pick = (body, fields) =>
  Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

function coerceNumbers(values) {
  const result = { ...values };

  for (const field of NUMERIC_FIELDS) {
    if (result[field] === "") result[field] = null;
    else if (result[field] != null) result[field] = Number(result[field]);
  }

  return result;
}

const blank = (value) => value == null || !String(value).trim();

async function loadRaceAndClass(classId, raceId) {
  const [cls, race, traits] = await Promise.all([
    pool.query("SELECT * FROM classes WHERE id = $1", [classId]),
    pool.query("SELECT * FROM races WHERE id = $1", [raceId]),
    pool.query("SELECT name FROM race_traits WHERE race_id = $1", [raceId])
  ]);

  return { cls: cls.rows[0], race: race.rows[0], traitNames: traits.rows.map((t) => t.name) };
}

async function createCharacterByRules(body) {
  const input = coerceNumbers(pick(body, CREATION_FIELDS));
  const errors = [];

  if (blank(input.name)) errors.push("El nombre del personaje es obligatorio.");
  if (blank(input.player_name)) errors.push("El nombre del jugador es obligatorio.");

  const { cls, race, traitNames } = await loadRaceAndClass(input.class_id, input.race_id);

  if (!cls) errors.push("La clase seleccionada no existe.");
  if (!race) errors.push("La raza seleccionada no existe.");

  if (cls && race) {
    errors.push(...rules.validateClassRace(cls.allowed_races, race.name, traitNames));
    errors.push(...rules.validateAlignment(input.alignment, cls.allowed_alignments));
    errors.push(...rules.validatePhysical(race.name, input));
    errors.push(...rules.validateSex(input.sex));
  }

  if (errors.length) throw new RuleError(errors);

  const [statDefs, moveDefs, raceSaves, starting] = await Promise.all([
    pool.query("SELECT id, name FROM stat_definitions ORDER BY id"),
    pool.query("SELECT id FROM movement_definitions ORDER BY id"),
    pool.query("SELECT level_min, level_max, save_id, value FROM race_saves WHERE race_id = $1", [race.id]),
    cls.starting_items
      ? pool.query("SELECT id FROM objects WHERE LOWER(name) = LOWER($1)", [cls.starting_items.trim()])
      : { rows: [] }
  ]);

  const statNames = statDefs.rows.map((s) => s.name);
  let rolled;
  let vitality;

  if (input.roll_session) {
    // Tiradas que el jugador ya ha visto en el formulario
    try {
      ({ stats: rolled, vitality } = readSession(input.roll_session, cls.id, statNames));
    } catch (error) {
      if (error instanceof RollError) throw new RuleError([error.message]);
      throw error;
    }
  } else {
    rolled = rules.rollCharacteristics(statNames, cls.min_stats ?? {});
    vitality = rules.rollInitialVitality(rolled.find((s) => s.name === "Constitución")?.modifier ?? 0);
  }

  const modifierOf = (name) => rolled.find((s) => s.name === name)?.modifier ?? 0;

  const moveFields = ["move_base", "move_combat", "move_run", "move_overweight", "move_flee"];

  const id = await saveCharacterFull(null, {
    ...input,
    level: 1,
    exp: 0,
    hit_points: vitality.total,
    dodge: modifierOf("Destreza"),
    range_reach: String(Math.max(cls.range_distance ?? 1, 1)),
    stats: statDefs.rows.map((def) => {
      const stat = rolled.find((s) => s.name === def.name);
      return { stat_id: def.id, value: stat.value, modifier: stat.modifier };
    }),
    saves: rules.savesForLevel(raceSaves.rows, 1),
    movements: moveDefs.rows.map((def, i) => ({ movement_id: def.id, value: cls[moveFields[i]] ?? 0 })),
    inventory: starting.rows.map((o) => ({ object_id: o.id, quantity: 1 }))
  });

  if (input.roll_session) discardSession(input.roll_session);

  return { id, rolls: { stats: rolled, vitality } };
}

async function updateCharacterByRules(id, body) {
  const existing = await pool.query("SELECT * FROM characters WHERE id = $1", [id]);
  if (!existing.rowCount) return null;

  const current = existing.rows[0];
  const safe = { ...coerceNumbers(pick(body, EDITABLE_FIELDS)), ...pick(body, EDITABLE_LISTS) };
  const errors = [];

  const { cls, race } = await loadRaceAndClass(current.class_id, current.race_id);

  if (safe.alignment !== undefined) {
    errors.push(...rules.validateAlignment(safe.alignment, cls?.allowed_alignments));
  }

  errors.push(...rules.validateSex(safe.sex));

  if (["height", "weight", "age"].some((f) => safe[f] !== undefined) && race) {
    errors.push(...rules.validatePhysical(race.name, {
      height: safe.height ?? (current.height == null ? undefined : Number(current.height)),
      weight: safe.weight ?? (current.weight == null ? undefined : Number(current.weight)),
      age: safe.age ?? current.age
    }));
  }

  if (errors.length) throw new RuleError(errors);

  return saveCharacterFull(id, safe);
}

module.exports = { createCharacterByRules, updateCharacterByRules, RuleError };
