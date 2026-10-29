const rules = require("../rules/terratea");

// Sube un nivel dentro de una transacción ya abierta: vitalidad, puntos de característica y salvaciones.
// Devuelve la fila actualizada del personaje, o null si ya está en el nivel máximo.
async function levelUpOnce(client, characterId) {
  const found = await client.query("SELECT * FROM characters WHERE id = $1 FOR UPDATE", [characterId]);
  const character = found.rows[0];

  if (!character || character.level >= rules.MAX_LEVEL) return null;

  const level = character.level + 1;

  const raceSaves = await client.query(
    "SELECT level_min, level_max, save_id, value FROM race_saves WHERE race_id = $1",
    [character.race_id]
  );

  for (const save of rules.savesForLevel(raceSaves.rows, level)) {
    await client.query(
      `INSERT INTO character_saves (character_id, save_id, value) VALUES ($1, $2, $3)
       ON CONFLICT (character_id, save_id) DO UPDATE SET value = EXCLUDED.value`,
      [characterId, save.save_id, save.value]
    );
  }

  const updated = await client.query(
    `UPDATE characters
     SET level = $1,
         hit_points = COALESCE(hit_points, 0) + $2,
         pending_stat_points = pending_stat_points + $3
     WHERE id = $4
     RETURNING *`,
    [level, rules.vitalityForLevel(level), rules.statPointsForLevel(level), characterId]
  );

  return updated.rows[0];
}

// Reparte puntos de característica pendientes en una característica
async function spendStatPoints(client, characterId, statId, points) {
  if (!Number.isInteger(points) || points <= 0) {
    return { error: "Los puntos deben ser un número entero mayor que 0." };
  }

  const found = await client.query("SELECT pending_stat_points FROM characters WHERE id = $1 FOR UPDATE", [characterId]);

  if (!found.rowCount) return { notFound: true };

  if (found.rows[0].pending_stat_points < points) {
    return { error: `Solo tienes ${found.rows[0].pending_stat_points} punto(s) de característica pendientes.` };
  }

  const stat = await client.query(
    "SELECT value FROM character_stats WHERE character_id = $1 AND stat_id = $2 FOR UPDATE",
    [characterId, statId]
  );

  if (!stat.rowCount) return { error: "Característica no encontrada." };

  const value = stat.rows[0].value + points;

  await client.query(
    "UPDATE character_stats SET value = $1, modifier = $2 WHERE character_id = $3 AND stat_id = $4",
    [value, rules.statModifier(value), characterId, statId]
  );
  await client.query(
    "UPDATE characters SET pending_stat_points = pending_stat_points - $1 WHERE id = $2",
    [points, characterId]
  );

  return {};
}

module.exports = { levelUpOnce, spendStatPoints };
