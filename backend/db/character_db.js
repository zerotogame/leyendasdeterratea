const pool = require("./db");
const { normalize } = require("../rules/terratea");
const { listImages } = require("./character_images");

async function getCharacter(id) {
  const char = await pool.query(
    "SELECT * FROM characters WHERE id = $1",
    [id]
  );

  const attributes = await pool.query(
    "SELECT  sd.name,  cs.value,  cs.modifier FROM character_stats cs JOIN stat_definitions sd ON sd.id = cs.stat_id WHERE cs.character_id = $1",
    [id]
  );

  const race_character = await pool.query(
    "SELECT name FROM races WHERE id = $1",
    [char.rows[0].race_id]
  );

  const class_character = await pool.query(
    "SELECT name FROM classes WHERE id = $1",
    [char.rows[0].class_id]
  );

  const rollSalvations = await pool.query(
    "SELECT  sd.name,cs.value FROM character_saves cs JOIN save_definitions sd ON sd.id = cs.save_id WHERE cs.character_id = $1",
    [char.rows[0].id]
  );

  const rollMovements = await pool.query(
    "SELECT  md.name,cm.value FROM character_movement cm JOIN movement_definitions md ON md.id = cm.movement_id WHERE cm.character_id = $1",
    [char.rows[0].id]
  );

  const imageCharacter = await pool.query(
    "SELECT image FROM characters WHERE id = $1",
    [char.rows[0].id]
  );

  const inventoryCharacter = await pool.query(
    `SELECT 
          co.object_id AS object_id,
          o.name AS objeto_nombre,
          o.price_copper AS precio_cobre,
          o.weight_kg AS peso_kg,
          o.is_unique AS es_unico,
          co.quantity AS cantidad
      FROM public.character_object co
      INNER JOIN public.objects o ON co.object_id = o.id
      WHERE co.character_id = $1;`,
    [char.rows[0].id]
  );

  const class_experience = await pool.query(
    `SELECT required_experience
    FROM class_experience
    WHERE class_id = $1 AND level = $2 + 1
    LIMIT 1`,
    [char.rows[0].class_id, char.rows[0].level]
  );

  const weapons = await pool.query(
    `SELECT slot, name, attack_magic, attack_element, attack_malediction, weight, hands, damage, total, special
    FROM character_weapons WHERE character_id = $1 ORDER BY slot`,
    [char.rows[0].id]
  );

  const skills = await pool.query(
    "SELECT category, name FROM character_skills WHERE character_id = $1 ORDER BY position",
    [char.rows[0].id]
  );

  const race_info = await pool.query(
    "SELECT max_carry_kg FROM races WHERE id = $1",
    [char.rows[0].race_id]
  );

  const raceTraits = await pool.query(
    "SELECT kind, name, description FROM race_traits WHERE race_id = $1 ORDER BY kind ASC, id",
    [char.rows[0].race_id]
  );

  const classAbilities = await pool.query(
    `SELECT level, name, action, description FROM class_abilities
    WHERE class_id = $1 AND level <= $2 ORDER BY level, id`,
    [char.rows[0].class_id, char.rows[0].level]
  );

  // const inventoryCharacter = await pool.query(
  //   "SELECT SUM(weight) as total_weight, MAX(carrying_capacity) as max_capacity FROM character_inventory ci JOIN characters c ON ci.character_id = c.id WHERE ci.character_id = $1",
  //   [char.rows[0].id]
  // );


  const images = await listImages(char.rows[0].id);

  let character = char.rows[0];

  //remover atributos race y class id
  delete character.race_id;
  delete character.class_id;
  return {
    ...character,
    race: race_character.rows[0].name,
    class: class_character.rows[0].name,
    attributes: attributes.rows.reduce((acc, attr) => {
      acc[attr.name] = {
        value: attr.value,
        modifier: attr.modifier
      };
      return acc;
    }, {}),
    rollSalvations: rollSalvations.rows.reduce((acc, save) => {
      acc[save.name] = save.value;
      return acc;
    }, {}),
    rollMovements: rollMovements.rows.reduce((acc, move) => {
      acc[move.name] = move.value;
      return acc;
    }, {}),
    inventory: inventoryCharacter.rows.map(item => ({
      object_id: item.object_id,
      name: item.objeto_nombre,
      price_copper: item.precio_cobre,
      weight_kg: item.peso_kg,
      is_unique: item.es_unico,
      quantity: item.cantidad
    })),
    max_carry_kg: race_info.rows[0]?.max_carry_kg == null ? null : Number(race_info.rows[0].max_carry_kg),
    // Una habilidad racial que coincide con una de clase no se acumula: queda suprimida
    raceTraits: raceTraits.rows.filter(
      (t) => !classAbilities.rows.some((a) => normalize(a.name) === normalize(t.name))
    ),
    classAbilities: classAbilities.rows,
    weapons: weapons.rows,
    specialSkills: skills.rows.filter(s => s.category === "special").map(s => s.name),
    extraAttributes: skills.rows.filter(s => s.category === "extra").map(s => s.name),
    images,
    image: imageCharacter.rows[0] ? imageCharacter.rows[0].image : "value not found",
    required_experience: class_experience.rows[0]?.required_experience ?? 0
  };
}

async function getCharacters() {
  console.log("Querying all characters from database");
  const chars = await pool.query("SELECT * FROM characters");

  const detailedChars = await Promise.all(
    chars.rows.map(async (char) => {
      const attributes = await pool.query(
        "SELECT  sd.name,  cs.value,  cs.modifier FROM character_stats cs JOIN stat_definitions sd ON sd.id = cs.stat_id WHERE cs.character_id = $1",
        [char.id]
      );

      const race_character = await pool.query(
        "SELECT name FROM races WHERE id = $1",
        [char.race_id]
      );
      const class_character = await pool.query(
        "SELECT name FROM classes WHERE id = $1",
        [char.class_id]
      );

      const rollSalvations = await pool.query(
        "SELECT sd.name, cs.value FROM character_saves cs JOIN save_definitions sd ON sd.id = cs.save_id WHERE cs.character_id = $1",
        [char.id]
      );

      const rollMovements = await pool.query(
        "SELECT  md.name,cm.value FROM character_movement cm JOIN movement_definitions md ON md.id = cm.movement_id WHERE cm.character_id = $1",
        [char.id]
      );

      const class_experience = await pool.query(
        `SELECT required_experience
      FROM class_experience
      WHERE class_id = $1 AND level <= $2 order by level desc
      LIMIT 1`,
        [char.class_id, char.level]
      );
      let character = char;

      //remover atributos race y class id
      delete character.race_id;
      delete character.class_id;



      return {
        ...character,
        race: race_character.rows[0].name,
        class: class_character.rows[0].name,
        attributes: attributes.rows.reduce((acc, attr) => {
          acc[attr.name] = {
            value: attr.value,
            modifier: attr.modifier
          };
          return acc;
        }, {}),
        rollSalvations: rollSalvations.rows.reduce((acc, save) => {
          acc[save.name] = save.value;
          return acc;
        }, {}),
        rollMovements: rollMovements.rows.reduce((acc, move) => {
          acc[move.name] = move.value;
          return acc;
        }, {}),
        // Devuelve directamente el valor
        required_experience: class_experience.rows[0]?.required_experience ?? 0,
      };
    })
  );
  return detailedChars;
}

module.exports = { getCharacter, getCharacters };