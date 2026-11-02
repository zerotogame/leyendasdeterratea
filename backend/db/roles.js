const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./db");
const { requiere } = require("./permisos");

const router = express.Router();

const emailValido = (email) => {
  const at = email.indexOf("@");
  return at >= 1 && at === email.lastIndexOf("@") && email.slice(at).includes(".") && !/\s/.test(email) && email.length <= 254;
};
const passwordValida = (p) => typeof p === "string" && p.length >= 8 && p.length <= 72;
const normalizaEmail = (e) => (typeof e === "string" ? e.trim().toLowerCase() : "");

const fallo = (res, e, accion) => {
  console.error(`Error ${accion} roles`, e);
  return res.status(500).json({ error: "database error" });
};

// Roles con cuántos usuarios los tienen.
router.get("/roles", requiere("DEVELOPER"), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT r.id, r.code, r.name, r.description, COUNT(ur.user_id)::int AS users
       FROM public.roles r LEFT JOIN public.user_roles ur ON ur.role_id = r.id
       GROUP BY r.id ORDER BY r.id`
    );
    return res.json(r.rows);
  } catch (e) { return fallo(res, e, "listing"); }
});

// Usuarios con sus roles (códigos). Nunca se devuelve la contraseña.
router.get("/users", requiere("DEVELOPER"), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.email,
              COALESCE(array_agg(r.code ORDER BY r.id) FILTER (WHERE r.id IS NOT NULL), '{}') AS roles,
              (SELECT COUNT(*)::int FROM public.characters c WHERE c.user_id = u.id) AS characters
       FROM public.users u
       LEFT JOIN public.user_roles ur ON ur.user_id = u.id
       LEFT JOIN public.roles r ON r.id = ur.role_id
       GROUP BY u.id ORDER BY u.id`
    );
    return res.json(r.rows);
  } catch (e) { return fallo(res, e, "listing users with"); }
});

// Sustituye los roles de un usuario por la lista de códigos recibida (mínimo uno).
router.put("/users/:id/roles", requiere("DEVELOPER"), async (req, res) => {
  const id = Number(req.params.id);
  const codes = Array.isArray(req.body.roles) ? [...new Set(req.body.roles.map(String))] : null;
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Usuario no válido." });
  if (!codes || !codes.length) return res.status(400).json({ error: "El usuario necesita al menos un rol." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const user = await client.query("SELECT id FROM public.users WHERE id = $1", [id]);
    if (!user.rowCount) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Usuario no encontrado" }); }
    const found = await client.query("SELECT id, code FROM public.roles WHERE code = ANY($1)", [codes]);
    if (found.rowCount !== codes.length) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Algún rol no existe." }); }

    await client.query("DELETE FROM public.user_roles WHERE user_id = $1", [id]);
    await client.query(
      "INSERT INTO public.user_roles (user_id, role_id) SELECT $1, UNNEST($2::int[])",
      [id, found.rows.map((r) => r.id)]
    );
    await client.query("COMMIT");
    return res.json({ id, roles: found.rows.sort((a, b) => a.id - b.id).map((r) => r.code) });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    return fallo(res, e, "updating user");
  } finally {
    client.release();
  }
});

// Alta de usuario por el administrador: email, contraseña inicial y roles (por defecto, Jugador).
router.post("/users", requiere("DEVELOPER"), async (req, res) => {
  const email = normalizaEmail(req.body.email);
  const codes = Array.isArray(req.body.roles) && req.body.roles.length ? [...new Set(req.body.roles.map(String))] : ["PLAYER"];
  if (!emailValido(email)) return res.status(400).json({ error: "Email no válido." });
  if (!passwordValida(req.body.password)) return res.status(400).json({ error: "La contraseña debe tener entre 8 y 72 caracteres." });

  const client = await pool.connect();
  try {
    const found = await client.query("SELECT id, code FROM public.roles WHERE code = ANY($1)", [codes]);
    if (found.rowCount !== codes.length) return res.status(400).json({ error: "Algún rol no existe." });
    const hash = await bcrypt.hash(req.body.password, 10);
    await client.query("BEGIN");
    const ins = await client.query(
      `INSERT INTO public.users (email, password, role) VALUES ($1, $2, 'PLAYER')
       ON CONFLICT DO NOTHING RETURNING id, email`,
      [email, hash]
    );
    if (!ins.rowCount) { await client.query("ROLLBACK"); return res.status(409).json({ error: "Ese email ya está registrado." }); }
    await client.query(
      "INSERT INTO public.user_roles (user_id, role_id) SELECT $1, UNNEST($2::int[])",
      [ins.rows[0].id, found.rows.map((r) => r.id)]
    );
    await client.query("COMMIT");
    return res.status(201).json({ id: ins.rows[0].id, email, roles: found.rows.sort((a, b) => a.id - b.id).map((r) => r.code), characters: 0 });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    return fallo(res, e, "creating user with");
  } finally {
    client.release();
  }
});

// Edita email y/o contraseña (solo si se envía) de un usuario.
router.put("/users/:id", requiere("DEVELOPER"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Usuario no válido." });
  const sets = [], vals = [];
  if (req.body.email !== undefined) {
    const email = normalizaEmail(req.body.email);
    if (!emailValido(email)) return res.status(400).json({ error: "Email no válido." });
    vals.push(email); sets.push(`email = $${vals.length}`);
  }
  if (req.body.password !== undefined && req.body.password !== "") {
    if (!passwordValida(req.body.password)) return res.status(400).json({ error: "La contraseña debe tener entre 8 y 72 caracteres." });
    vals.push(await bcrypt.hash(req.body.password, 10)); sets.push(`password = $${vals.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: "No hay nada que cambiar." });
  try {
    vals.push(id);
    const r = await pool.query(`UPDATE public.users SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING id, email`, vals);
    if (!r.rowCount) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(r.rows[0]);
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Ese email ya está registrado." });
    return fallo(res, e, "updating");
  }
});

// Borra un usuario. No se puede borrar a uno mismo ni a quien aún tenga personajes, gremios o mascotas (hay que reasignarlos antes).
router.delete("/users/:id", requiere("DEVELOPER"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Usuario no válido." });
  if (id === req.user.id) return res.status(400).json({ error: "No puedes borrar tu propio usuario." });
  try {
    const t = await pool.query(
      `SELECT (SELECT COUNT(*)::int FROM public.characters WHERE user_id = $1) AS personajes,
              (SELECT COUNT(*)::int FROM public.guilds WHERE user_id = $1) AS gremios,
              (SELECT COUNT(*)::int FROM public.pets WHERE user_id = $1) AS mascotas`,
      [id]
    );
    const { personajes, gremios, mascotas } = t.rows[0];
    if (personajes || gremios || mascotas) {
      return res.status(409).json({ error: `Tiene ${personajes} personaje(s), ${gremios} gremio(s) y ${mascotas} mascota(s). Reasígnalos antes de borrarlo.` });
    }
    const r = await pool.query("DELETE FROM public.users WHERE id = $1 RETURNING id", [id]);
    if (!r.rowCount) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json({ id });
  } catch (e) {
    if (e.code === "23503") return res.status(409).json({ error: "El usuario aparece en campañas y no se puede borrar." });
    return fallo(res, e, "deleting");
  }
});

// Personajes con su dueño, para asignarlos desde la administración.
// Master y Programador: TODAS las fichas, con el email de su dueño (las ve la pantalla «Mis personajes»).
router.get("/characters/all", requiere("MASTER"), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.id, c.name, c.level, r.name AS race, cl.name AS class, u.email AS owner_email,
         (SELECT file FROM character_images WHERE character_id = c.id ORDER BY position, id LIMIT 1) AS image
       FROM characters c
       JOIN races r ON r.id = c.race_id
       JOIN classes cl ON cl.id = c.class_id
       LEFT JOIN users u ON u.id = c.user_id
       ORDER BY c.id DESC`
    );
    return res.json(r.rows);
  } catch (e) { return fallo(res, e, "listing all characters with"); }
});

router.get("/admin/characters", requiere("DEVELOPER"), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.id, c.name, c.level, c.user_id, u.email AS owner_email
       FROM public.characters c LEFT JOIN public.users u ON u.id = c.user_id ORDER BY c.id`
    );
    return res.json(r.rows);
  } catch (e) { return fallo(res, e, "listing characters with"); }
});

// Asigna un personaje a un usuario (user_id null = sin dueño).
router.put("/admin/characters/:id/owner", requiere("DEVELOPER"), async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.body.user_id === null ? null : Number(req.body.user_id);
  if (!Number.isInteger(id) || id <= 0 || (userId !== null && (!Number.isInteger(userId) || userId <= 0))) {
    return res.status(400).json({ error: "Datos no válidos." });
  }
  try {
    if (userId !== null) {
      const u = await pool.query("SELECT 1 FROM public.users WHERE id = $1", [userId]);
      if (!u.rowCount) return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const r = await pool.query("UPDATE public.characters SET user_id = $1 WHERE id = $2 RETURNING id, name, level, user_id", [userId, id]);
    if (!r.rowCount) return res.status(404).json({ error: "Personaje no encontrado" });
    return res.json(r.rows[0]);
  } catch (e) { return fallo(res, e, "assigning character with"); }
});

module.exports = router;
