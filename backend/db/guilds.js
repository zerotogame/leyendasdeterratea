const express = require("express");
const pool = require("./db");
const { NIVEL, requiere } = require("./permisos");

const router = express.Router();

const LISTAS_TEXTO = ["storage", "harvest", "advantages", "benefits", "properties"];

class GuildError extends Error {}

const texto = (v) => (v == null ? "" : String(v).trim());
const entero = (v, campo, min, max) => {
  const n = v === "" || v == null ? 0 : Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new GuildError(`${campo} debe ser un entero entre ${min} y ${max}.`);
  return n;
};
const lista = (v) => (Array.isArray(v) ? v.map(texto).filter(Boolean) : []);

// Valida el cuerpo y lo deja con la forma de las columnas.
function limpiar(body) {
  const name = texto(body.name);
  if (!name) throw new GuildError("El gremio necesita un nombre.");
  const g = {
    name,
    founded: texto(body.founded) || null,
    location: texto(body.location) || null,
    reputation: entero(body.reputation, "La reputación", 0, 100),
    stars: entero(body.stars, "Las estrellas", 0, 10),
    gold: entero(body.gold, "El oro", 0, 2e9),
    silver: entero(body.silver, "La plata", 0, 2e9),
    copper: entero(body.copper, "El cobre", 0, 2e9),
    gems: (Array.isArray(body.gems) ? body.gems : [])
      .map((x) => ({ name: texto(x && x.name), quantity: entero(x && x.quantity, "La cantidad de gemas", 0, 1e9) }))
      .filter((x) => x.name),
    staff: (Array.isArray(body.staff) ? body.staff : [])
      .map((x) => ({ name: texto(x && x.name), note: texto(x && x.note) }))
      .filter((x) => x.name),
  };
  for (const k of LISTAS_TEXTO) g[k] = lista(body[k]);
  const members = [...new Set((Array.isArray(body.members) ? body.members : []).map(Number))];
  if (members.some((m) => !Number.isInteger(m) || m <= 0)) throw new GuildError("Lista de miembros no válida.");
  return { g, members };
}

const COLUMNAS = ["name", "founded", "location", "reputation", "stars", "gold", "silver", "copper", "gems", "staff", ...LISTAS_TEXTO];
const valorSql = (g, k) => (Array.isArray(g[k]) ? JSON.stringify(g[k]) : g[k]);

async function guardarMiembros(client, guildId, members) {
  await client.query("DELETE FROM public.guild_members WHERE guild_id = $1", [guildId]);
  if (!members.length) return;
  const existen = await client.query("SELECT id FROM public.characters WHERE id = ANY($1::int[])", [members]);
  if (existen.rowCount !== members.length) throw new GuildError("Algún miembro no existe.");
  await client.query(
    "INSERT INTO public.guild_members (guild_id, character_id) SELECT $1, unnest($2::int[])",
    [guildId, members]
  );
}

async function leer(id) {
  const r = await pool.query("SELECT * FROM public.guilds WHERE id = $1", [id]);
  if (!r.rowCount) return null;
  const m = await pool.query(
    `SELECT c.id, c.name, c.level, rc.name AS race, cl.name AS class,
       (SELECT file FROM character_images WHERE character_id = c.id ORDER BY position, id LIMIT 1) AS image
     FROM guild_members gm
     JOIN characters c ON c.id = gm.character_id
     JOIN races rc ON rc.id = c.race_id
     JOIN classes cl ON cl.id = c.class_id
     WHERE gm.guild_id = $1
     ORDER BY c.name`,
    [id]
  );
  return { ...r.rows[0], members: m.rows };
}

async function escribir(id, body, userId) {
  const { g, members } = limpiar(body);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (id == null) {
      const cols = COLUMNAS.map((c) => `"${c}"`).join(", ");
      const marcas = COLUMNAS.map((_, i) => `$${i + 2}`).join(", ");
      const r = await client.query(
        `INSERT INTO public.guilds (user_id, ${cols}) VALUES ($1, ${marcas}) RETURNING id`,
        [userId, ...COLUMNAS.map((k) => valorSql(g, k))]
      );
      id = r.rows[0].id;
    } else {
      const sets = COLUMNAS.map((c, i) => `"${c}" = $${i + 2}`).join(", ");
      const r = await client.query(`UPDATE public.guilds SET ${sets} WHERE id = $1`, [id, ...COLUMNAS.map((k) => valorSql(g, k))]);
      if (!r.rowCount) { await client.query("ROLLBACK"); return null; }
    }
    await guardarMiembros(client, id, members);
    await client.query("COMMIT");
    return id;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

function fallo(res, error, accion) {
  if (error instanceof GuildError) return res.status(400).json({ error: error.message });
  console.error(`Error ${accion} guild`, error);
  return res.status(500).json({ error: "database error" });
}

router.get("/users/:userId/guilds", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT g.id, g.name, g.location, g.stars, g.reputation,
         (SELECT count(*)::int FROM guild_members WHERE guild_id = g.id) AS members
       FROM guilds g WHERE g.user_id = $1 ORDER BY g.id DESC`,
      [req.params.userId]
    );
    res.json(r.rows);
  } catch (e) { fallo(res, e, "listing"); }
});

router.get("/guilds/:id", async (req, res) => {
  try {
    const g = await leer(req.params.id);
    return g ? res.json(g) : res.status(404).json({ error: "Gremio no encontrado" });
  } catch (e) { fallo(res, e, "reading"); }
});

// Líder de gremio: solo toca SU gremio. Master y Programador, cualquiera.
async function esSuyo(req, res, next) {
  if (req.user.nivel >= NIVEL.MASTER) return next();
  try {
    const r = await pool.query("SELECT user_id FROM public.guilds WHERE id = $1", [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: "Gremio no encontrado" });
    if (r.rows[0].user_id !== req.user.id) return res.status(403).json({ error: "Ese gremio no es tuyo." });
    return next();
  } catch (e) { return fallo(res, e, "checking owner of"); }
}

router.post("/guilds", requiere("GUILD_LEADER"), async (req, res) => {
  try {
    // El Master puede crear gremios para otro usuario; un líder, solo para sí mismo.
    const userId = req.user.nivel >= NIVEL.MASTER ? Number(req.body && req.body.user_id) : req.user.id;
    if (!Number.isInteger(userId) || userId <= 0) throw new GuildError("Falta el usuario.");
    const id = await escribir(null, req.body || {}, userId);
    return res.status(201).json(await leer(id));
  } catch (e) { fallo(res, e, "creating"); }
});

router.put("/guilds/:id", requiere("GUILD_LEADER"), esSuyo, async (req, res) => {
  try {
    const id = await escribir(Number(req.params.id), req.body || {});
    return id ? res.json(await leer(id)) : res.status(404).json({ error: "Gremio no encontrado" });
  } catch (e) { fallo(res, e, "updating"); }
});

router.delete("/guilds/:id", requiere("GUILD_LEADER"), esSuyo, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM public.guilds WHERE id = $1", [req.params.id]);
    return r.rowCount ? res.json({ deleted: true }) : res.status(404).json({ error: "Gremio no encontrado" });
  } catch (e) { fallo(res, e, "deleting"); }
});

module.exports = router;
