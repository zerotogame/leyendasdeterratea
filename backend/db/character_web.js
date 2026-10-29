const pool = require("./db");
const rules = require("../rules/terratea");
const { saveCharacterFull } = require("./character_write");
const { RuleError } = require("./character_create");

const DEFAULT_USER_ID = 7;

// Personaje armado en el creador de terratea-web (nivel 1). Las tiradas las hace la web;
// aquí se comprueba que raza y clase existan y que la raza pueda ser esa clase.
async function createCharacterFromWeb(body) {
  const errors = [];
  const name = String(body.name ?? "").trim();
  if (!name) errors.push("El nombre del personaje es obligatorio.");

  const [cls, race] = await Promise.all([
    pool.query("SELECT * FROM classes WHERE LOWER(name) = LOWER($1)", [body.class_name]),
    pool.query("SELECT * FROM races WHERE LOWER(name) = LOWER($1)", [body.race_name])
  ]);
  if (!cls.rowCount) errors.push(`La clase «${body.class_name}» no existe en la base de datos.`);
  if (!race.rowCount) errors.push(`La raza «${body.race_name}» no existe en la base de datos.`);
  if (errors.length) throw new RuleError(errors);

  const c = cls.rows[0];
  const r = race.rows[0];
  const traits = await pool.query("SELECT name FROM race_traits WHERE race_id = $1", [r.id]);
  errors.push(...rules.validateClassRace(c.allowed_races, r.name, traits.rows.map((t) => t.name)));

  const [statDefs, moveDefs, raceSaves] = await Promise.all([
    pool.query("SELECT id, name FROM stat_definitions ORDER BY id"),
    pool.query("SELECT id FROM movement_definitions ORDER BY id"),
    pool.query("SELECT level_min, level_max, save_id, value FROM race_saves WHERE race_id = $1", [r.id])
  ]);

  const given = new Map((body.stats ?? []).map((s) => [rules.normalize(s.name), s]));
  const stats = statDefs.rows.map((def) => {
    const s = given.get(rules.normalize(def.name));
    if (!s || !Number.isFinite(Number(s.value))) errors.push(`Falta la característica ${def.name}.`);
    return { stat_id: def.id, value: Number(s?.value), modifier: Number(s?.modifier) || 0 };
  });
  if (errors.length) throw new RuleError(errors);

  const moveFields = ["move_base", "move_combat", "move_run", "move_overweight", "move_flee"];
  const dex = stats[1];

  // Objetos del catálogo de la BD que coinciden por nombre (el resto queda solo en la ficha de la web)
  const inventory = [];
  for (const itemName of body.items ?? []) {
    const o = await pool.query("SELECT id FROM objects WHERE LOWER(name) = LOWER($1)", [String(itemName).trim()]);
    if (o.rowCount) inventory.push({ object_id: o.rows[0].id, quantity: 1 });
  }

  const id = await saveCharacterFull(null, {
    name, user_id: Number(body.user_id) || DEFAULT_USER_ID, player_name: body.player_name,
    class_id: c.id, race_id: r.id, level: 1, exp: 0,
    hit_points: Number(body.hit_points), armor_class: Number(body.armor_class),
    dodge: dex.modifier, range_reach: String(Math.max(c.range_distance ?? 1, 1)),
    gold: Number(body.gold) || 0, silver: Number(body.silver) || 0, copper: Number(body.copper) || 0,
    stats,
    saves: rules.savesForLevel(raceSaves.rows, 1),
    movements: moveDefs.rows.map((def, i) => ({ movement_id: def.id, value: c[moveFields[i]] ?? 0 })),
    weapons: body.weapons ?? [],
    inventory
  });
  return id;
}

module.exports = { createCharacterFromWeb };
