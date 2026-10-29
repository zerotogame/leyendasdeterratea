const pool = require("./db");

const SCALAR_FIELDS = [
  "name", "class_id", "race_id", "alignment", "height", "weight", "sex", "age",
  "hair", "eyes", "marks", "level", "exp", "image", "player_name", "guild",
  "hit_points", "armor_class", "dodge", "range_reach", "gold", "silver", "copper", "exp_needed", "user_id"
];

// Columnas NOT NULL: un valor vacío se ignora en vez de borrarlas
const REQUIRED_FIELDS = ["name", "level", "exp", "gold", "silver", "copper"];

const isBlank = (value) => value === undefined || value === null || value === "";

async function saveCharacterFull(characterId, body) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let id = characterId;

    if (id == null) {
      const entries = SCALAR_FIELDS
        .filter((field) => !isBlank(body[field]))
        .map((field) => [field, body[field]]);

      const columns = entries.map(([field]) => `"${field}"`).join(", ");
      const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");

      const inserted = await client.query(
        `INSERT INTO characters (${columns}) VALUES (${placeholders}) RETURNING id`,
        entries.map(([, value]) => value)
      );
      id = inserted.rows[0].id;
    } else {
      const entries = SCALAR_FIELDS
        .filter((field) => body[field] !== undefined)
        .filter((field) => !(REQUIRED_FIELDS.includes(field) && isBlank(body[field])))
        .map((field) => [field, isBlank(body[field]) ? null : body[field]]);

      if (entries.length) {
        const assignments = entries.map(([field], i) => `"${field}" = $${i + 1}`).join(", ");
        const updated = await client.query(
          `UPDATE characters SET ${assignments} WHERE id = $${entries.length + 1}`,
          [...entries.map(([, value]) => value), id]
        );
        if (!updated.rowCount) {
          await client.query("ROLLBACK");
          return null;
        }
      }
    }

    for (const stat of body.stats || []) {
      await client.query(
        `INSERT INTO character_stats (character_id, stat_id, value, modifier) VALUES ($1, $2, $3, $4)
         ON CONFLICT (character_id, stat_id) DO UPDATE SET value = EXCLUDED.value, modifier = EXCLUDED.modifier`,
        [id, stat.stat_id, Number(stat.value) || 0, Number(stat.modifier) || 0]
      );
    }

    for (const save of body.saves || []) {
      await client.query(
        `INSERT INTO character_saves (character_id, save_id, value) VALUES ($1, $2, $3)
         ON CONFLICT (character_id, save_id) DO UPDATE SET value = EXCLUDED.value`,
        [id, save.save_id, Number(save.value) || 0]
      );
    }

    for (const move of body.movements || []) {
      await client.query(
        `INSERT INTO character_movement (character_id, movement_id, value) VALUES ($1, $2, $3)
         ON CONFLICT (character_id, movement_id) DO UPDATE SET value = EXCLUDED.value`,
        [id, move.movement_id, Number(move.value) || 0]
      );
    }

    if (Array.isArray(body.weapons)) {
      await client.query("DELETE FROM character_weapons WHERE character_id = $1", [id]);
      let slot = 1;
      for (const w of body.weapons) {
        if (isBlank(w.name)) continue;
        const num = (v) => (isBlank(v) ? null : Number(v));
        await client.query(
          `INSERT INTO character_weapons
             (character_id, slot, name, attack_magic, attack_element, attack_malediction, weight, hands, damage, total, special)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [id, slot++, w.name.trim(), num(w.attack_magic), num(w.attack_element), num(w.attack_malediction),
            w.weight || null, num(w.hands), w.damage || null, w.total || null, w.special || null]
        );
      }
    }

    if (Array.isArray(body.specialSkills) || Array.isArray(body.extraAttributes)) {
      await client.query("DELETE FROM character_skills WHERE character_id = $1", [id]);
      const groups = [["special", body.specialSkills], ["extra", body.extraAttributes]];
      for (const [category, names] of groups) {
        let position = 1;
        for (const name of names || []) {
          if (isBlank(name) || !String(name).trim()) continue;
          await client.query(
            "INSERT INTO character_skills (character_id, category, position, name) VALUES ($1, $2, $3, $4)",
            [id, category, position++, String(name).trim()]
          );
        }
      }
    }

    if (Array.isArray(body.inventory)) {
      await client.query("DELETE FROM character_object WHERE character_id = $1", [id]);
      for (const item of body.inventory) {
        const quantity = Number(item.quantity) || 0;
        if (!item.object_id || quantity <= 0) continue;
        await client.query(
          `INSERT INTO character_object (character_id, object_id, quantity) VALUES ($1, $2, $3)
           ON CONFLICT (character_id, object_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
          [id, item.object_id, quantity]
        );
      }
    }

    await client.query("COMMIT");
    return id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { saveCharacterFull };
