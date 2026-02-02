const pool = require("./db");

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
    }, {})
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
        }, {})
      };
    })
  );
  return detailedChars;
}

module.exports = { getCharacter, getCharacters };