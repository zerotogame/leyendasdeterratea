const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const pool = require("./db");
const { EXTENSIONS, firmaValida } = require("./character_images");

const router = express.Router();

const IMAGES_DIR = path.join(__dirname, "..", "images");
const SUBDIR = "pets";
const CATEGORIAS = ["comun", "poco_comun", "epico_mitico", "legendario"];
const LISTAS_TEXTO = ["specials", "inventory"];
const MOVIMIENTOS = ["move_base", "move_combat", "move_run", "move_overweight", "move_flee"];

class PetError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const texto = (v) => (v == null ? "" : String(v).trim());
const entero = (v, campo, min, max) => {
  const n = v === "" || v == null ? 0 : Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new PetError(`${campo} debe ser un entero entre ${min} y ${max}.`);
  return n;
};
const enteroOpcional = (v, campo) => (v === "" || v == null ? null : entero(v, campo, 0, 999));
const idOpcional = (v, campo) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new PetError(`${campo} no válido.`);
  return n;
};

// Valida el cuerpo y lo deja con la forma de las columnas.
function limpiar(body) {
  const name = texto(body.name);
  if (!name) throw new PetError("La mascota necesita un nombre.");
  const category = texto(body.category) || "comun";
  if (!CATEGORIAS.includes(category)) throw new PetError("Categoría no válida.");
  const color = texto(body.color) || "#3a4458";
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new PetError("El color debe ser #RRGGBB.");
  const p = {
    owner_id: idOpcional(body.owner_id, "El dueño"),
    guild_id: idOpcional(body.guild_id, "El gremio"),
    name,
    species: texto(body.species) || null,
    alignment: texto(body.alignment) || null,
    role: texto(body.role) || "Mascota",
    level: entero(body.level, "El nivel", 0, 100),
    category,
    hp: entero(body.hp, "La vida", 0, 1e6),
    ac: entero(body.ac, "La C.A.", 0, 999),
    dodge: entero(body.dodge, "La esquiva", -99, 999),
    attack: texto(body.attack) || null,
    attack_note: texto(body.attack_note) || null,
    reach: texto(body.reach) || null,
    extras: texto(body.extras) || null,
    load_total: texto(body.load_total) || null,
    color,
  };
  for (const k of MOVIMIENTOS) p[k] = enteroOpcional(body[k], "El movimiento");
  for (const k of LISTAS_TEXTO) p[k] = (Array.isArray(body[k]) ? body[k] : []).map(texto).filter(Boolean);
  return p;
}

const COLUMNAS = [
  "owner_id", "guild_id", "name", "species", "alignment", "role", "level", "category", "hp", "ac", "dodge",
  "attack", "attack_note", "reach", "extras", "load_total", "color", ...MOVIMIENTOS, ...LISTAS_TEXTO,
];
const valorSql = (p, k) => (Array.isArray(p[k]) ? JSON.stringify(p[k]) : p[k]);

async function comprobarRelaciones(p) {
  if (p.owner_id != null) {
    const r = await pool.query("SELECT 1 FROM public.characters WHERE id = $1", [p.owner_id]);
    if (!r.rowCount) throw new PetError("El dueño no existe.");
  }
  if (p.guild_id != null) {
    const r = await pool.query("SELECT 1 FROM public.guilds WHERE id = $1", [p.guild_id]);
    if (!r.rowCount) throw new PetError("El gremio no existe.");
  }
}

const SELECT_FICHA = `
  SELECT p.*, c.name AS owner_name,
    (SELECT file FROM character_images WHERE character_id = c.id ORDER BY position, id LIMIT 1) AS owner_image,
    g.name AS guild_name
  FROM pets p
  LEFT JOIN characters c ON c.id = p.owner_id
  LEFT JOIN guilds g ON g.id = p.guild_id`;

const leer = async (id) => (await pool.query(`${SELECT_FICHA} WHERE p.id = $1`, [id])).rows[0] || null;

async function escribir(id, body, userId) {
  const p = limpiar(body);
  await comprobarRelaciones(p);
  const valores = COLUMNAS.map((k) => valorSql(p, k));
  if (id == null) {
    const cols = COLUMNAS.map((c) => `"${c}"`).join(", ");
    const marcas = COLUMNAS.map((_, i) => `$${i + 2}`).join(", ");
    const r = await pool.query(`INSERT INTO public.pets (user_id, ${cols}) VALUES ($1, ${marcas}) RETURNING id`, [userId, ...valores]);
    return r.rows[0].id;
  }
  const sets = COLUMNAS.map((c, i) => `"${c}" = $${i + 2}`).join(", ");
  const r = await pool.query(`UPDATE public.pets SET ${sets} WHERE id = $1`, [id, ...valores]);
  return r.rowCount ? id : null;
}

function fallo(res, error, accion) {
  if (error instanceof PetError) return res.status(error.status).json({ error: error.message });
  console.error(`Error ${accion} pet`, error);
  return res.status(500).json({ error: "database error" });
}

const RESUMEN = `
  SELECT p.id, p.name, p.species, p.role, p.level, p.category, p.color, p.image,
    p.owner_id, c.name AS owner_name, p.guild_id, g.name AS guild_name
  FROM pets p LEFT JOIN characters c ON c.id = p.owner_id LEFT JOIN guilds g ON g.id = p.guild_id`;

router.get("/users/:userId/pets", async (req, res) => {
  try { res.json((await pool.query(`${RESUMEN} WHERE p.user_id = $1 ORDER BY p.id DESC`, [req.params.userId])).rows); }
  catch (e) { fallo(res, e, "listing"); }
});

router.get("/characters/:id/pets", async (req, res) => {
  try { res.json((await pool.query(`${RESUMEN} WHERE p.owner_id = $1 ORDER BY p.name`, [req.params.id])).rows); }
  catch (e) { fallo(res, e, "listing"); }
});

router.get("/guilds/:id/pets", async (req, res) => {
  try { res.json((await pool.query(`${RESUMEN} WHERE p.guild_id = $1 ORDER BY p.name`, [req.params.id])).rows); }
  catch (e) { fallo(res, e, "listing"); }
});

router.get("/pets/:id", async (req, res) => {
  try {
    const p = await leer(req.params.id);
    return p ? res.json(p) : res.status(404).json({ error: "Mascota no encontrada" });
  } catch (e) { fallo(res, e, "reading"); }
});

router.post("/pets", async (req, res) => {
  try {
    const userId = Number(req.body && req.body.user_id);
    if (!Number.isInteger(userId) || userId <= 0) throw new PetError("Falta el usuario.");
    return res.status(201).json(await leer(await escribir(null, req.body || {}, userId)));
  } catch (e) { fallo(res, e, "creating"); }
});

router.put("/pets/:id", async (req, res) => {
  try {
    const id = await escribir(Number(req.params.id), req.body || {});
    return id ? res.json(await leer(id)) : res.status(404).json({ error: "Mascota no encontrada" });
  } catch (e) { fallo(res, e, "updating"); }
});

const borrarFichero = (file) => (file ? fs.unlink(path.join(IMAGES_DIR, file)).catch(() => {}) : undefined);

router.delete("/pets/:id", async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM public.pets WHERE id = $1 RETURNING image", [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: "Mascota no encontrada" });
    await borrarFichero(r.rows[0].image);
    return res.json({ deleted: true });
  } catch (e) { fallo(res, e, "deleting"); }
});

// Imagen de la mascota: el cuerpo es el fichero tal cual (como en los personajes). Sustituye a la anterior.
router.post("/pets/:id/image", express.raw({ type: Object.keys(EXTENSIONS), limit: "8mb" }), async (req, res) => {
  try {
    const ext = EXTENSIONS[req.get("content-type")?.split(";")[0]];
    if (!ext) throw new PetError("Formato no admitido: usa JPG, PNG, WEBP o GIF.");
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw new PetError("La imagen está vacía.");
    if (!firmaValida(req.body, req.get("content-type").split(";")[0])) throw new PetError("El archivo no es una imagen válida del formato indicado.");
    const id = Number(req.params.id);
    const actual = await pool.query("SELECT image FROM public.pets WHERE id = $1", [id]);
    if (!actual.rowCount) throw new PetError("Mascota no encontrada", 404);
    const file = `${SUBDIR}/${id}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
    await fs.mkdir(path.join(IMAGES_DIR, SUBDIR), { recursive: true });
    await fs.writeFile(path.join(IMAGES_DIR, file), req.body);
    await pool.query("UPDATE public.pets SET image = $2 WHERE id = $1", [id, file]);
    await borrarFichero(actual.rows[0].image);
    return res.status(201).json({ image: file });
  } catch (e) { fallo(res, e, "uploading image of"); }
});

router.delete("/pets/:id/image", async (req, res) => {
  try {
    const actual = await pool.query("SELECT image FROM public.pets WHERE id = $1", [req.params.id]);
    if (!actual.rowCount) return res.status(404).json({ error: "Mascota no encontrada" });
    await pool.query("UPDATE public.pets SET image = NULL WHERE id = $1", [req.params.id]);
    await borrarFichero(actual.rows[0].image);
    return res.json({ deleted: true });
  } catch (e) { fallo(res, e, "deleting image of"); }
});

module.exports = router;
