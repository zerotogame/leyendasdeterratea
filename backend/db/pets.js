const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const pool = require("./db");
const almacen = require("./almacen");
const { EXTENSIONS, firmaValida } = require("./character_images");
const { NIVEL, requiere } = require("./permisos");

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

async function escribir(id, body, userId, req) {
  const p = limpiar(body);
  await comprobarRelaciones(p);
  await comprobarDueno(req, p);
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

// Una mascota solo la ven y la tocan el usuario dueño de su personaje, los Master y los Programadores.
// Sin personaje dueño, vale quien la creó. El líder de un gremio además VE (no edita) las de su gremio.
const esMaster = (req) => req.user.nivel >= NIVEL.MASTER;
const CONDICION_DUENO = "(c.user_id = $1 OR (p.owner_id IS NULL AND p.user_id = $1))";
const CONDICION_VER = "(c.user_id = $1 OR (p.owner_id IS NULL AND p.user_id = $1) OR g.user_id = $1)";

async function esDeUsuario(req, petId, soloVer = false) {
  if (esMaster(req)) return true;
  const r = await pool.query(`SELECT 1 FROM pets p LEFT JOIN characters c ON c.id = p.owner_id LEFT JOIN guilds g ON g.id = p.guild_id WHERE p.id = $2 AND ${soloVer ? CONDICION_VER : CONDICION_DUENO}`, [req.user.id, petId]);
  return r.rowCount > 0;
}

// Para las rutas /pets/:id...: si la mascota existe y no es del usuario, 403 (si no existe, lo dice cada ruta con su 404).
const guardia = (soloVer) => async (req, res, next) => {
  try {
    const existe = await pool.query("SELECT 1 FROM pets WHERE id = $1", [req.params.id]);
    if (existe.rowCount && !(await esDeUsuario(req, req.params.id, soloVer))) {
      return res.status(403).json({ error: "Esta mascota no es tuya." });
    }
    return next();
  } catch (e) { return fallo(res, e, "checking"); }
};
const soloDueno = guardia(false);
const puedeVer = guardia(true);

// Un jugador solo puede dejar la mascota a nombre de sus propios personajes.
async function comprobarDueno(req, p) {
  if (esMaster(req) || p.owner_id == null) return;
  const r = await pool.query("SELECT 1 FROM public.characters WHERE id = $1 AND user_id = $2", [p.owner_id, req.user.id]);
  if (!r.rowCount) throw new PetError("Solo puedes asignar la mascota a uno de tus personajes.", 403);
}

const listar = (req, res, filtro, valor, orden) => {
  const params = [req.user.id, valor];
  const visible = esMaster(req) ? "" : ` AND ${CONDICION_VER}`;
  return pool.query(`${RESUMEN} WHERE ${filtro} = $2${visible} ORDER BY ${orden}`, params)
    .then((r) => res.json(r.rows)).catch((e) => fallo(res, e, "listing"));
};

// Mis mascotas: las de mis personajes (el Master y el Programador ven todas). El :userId de la URL no manda, manda la sesión.
router.get("/users/:userId/pets", requiere("PLAYER"), async (req, res) => {
  try {
    const sql = esMaster(req)
      ? `${RESUMEN} ORDER BY p.id DESC`
      : `${RESUMEN} WHERE ${CONDICION_VER} ORDER BY p.id DESC`;
    res.json((await pool.query(sql, esMaster(req) ? [] : [req.user.id])).rows);
  } catch (e) { fallo(res, e, "listing"); }
});

router.get("/characters/:id/pets", requiere("PLAYER"), (req, res) => listar(req, res, "p.owner_id", req.params.id, "p.name"));

router.get("/guilds/:id/pets", requiere("PLAYER"), (req, res) => listar(req, res, "p.guild_id", req.params.id, "p.name"));

router.get("/pets/:id", requiere("PLAYER"), puedeVer, async (req, res) => {
  try {
    const p = await leer(req.params.id);
    return p ? res.json(p) : res.status(404).json({ error: "Mascota no encontrada" });
  } catch (e) { fallo(res, e, "reading"); }
});

router.post("/pets", requiere("PLAYER"), async (req, res) => {
  try {
    return res.status(201).json(await leer(await escribir(null, req.body || {}, req.user.id, req)));
  } catch (e) { fallo(res, e, "creating"); }
});

router.put("/pets/:id", requiere("PLAYER"), soloDueno, async (req, res) => {
  try {
    const id = await escribir(Number(req.params.id), req.body || {}, null, req);
    return id ? res.json(await leer(id)) : res.status(404).json({ error: "Mascota no encontrada" });
  } catch (e) { fallo(res, e, "updating"); }
});

const borrarFichero = (file) => (file ? Promise.all([almacen.borrar(file), fs.unlink(path.join(IMAGES_DIR, file)).catch(() => {})]) : undefined);

router.delete("/pets/:id", requiere("PLAYER"), soloDueno, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM public.pets WHERE id = $1 RETURNING image", [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: "Mascota no encontrada" });
    await borrarFichero(r.rows[0].image);
    return res.json({ deleted: true });
  } catch (e) { fallo(res, e, "deleting"); }
});

// Imagen de la mascota: el cuerpo es el fichero tal cual (como en los personajes). Sustituye a la anterior.
router.post("/pets/:id/image", requiere("PLAYER"), soloDueno, express.raw({ type: Object.keys(EXTENSIONS), limit: "8mb" }), async (req, res) => {
  try {
    const ext = EXTENSIONS[req.get("content-type")?.split(";")[0]];
    if (!ext) throw new PetError("Formato no admitido: usa JPG, PNG, WEBP o GIF.");
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw new PetError("La imagen está vacía.");
    if (!firmaValida(req.body, req.get("content-type").split(";")[0])) throw new PetError("El archivo no es una imagen válida del formato indicado.");
    const id = Number(req.params.id);
    const actual = await pool.query("SELECT image FROM public.pets WHERE id = $1", [id]);
    if (!actual.rowCount) throw new PetError("Mascota no encontrada", 404);
    const file = `${SUBDIR}/${id}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
    await almacen.guardar(file, req.body);
    await pool.query("UPDATE public.pets SET image = $2 WHERE id = $1", [id, file]);
    await borrarFichero(actual.rows[0].image);
    return res.status(201).json({ image: file });
  } catch (e) { fallo(res, e, "uploading image of"); }
});

router.delete("/pets/:id/image", requiere("PLAYER"), soloDueno, async (req, res) => {
  try {
    const actual = await pool.query("SELECT image FROM public.pets WHERE id = $1", [req.params.id]);
    if (!actual.rowCount) return res.status(404).json({ error: "Mascota no encontrada" });
    await pool.query("UPDATE public.pets SET image = NULL WHERE id = $1", [req.params.id]);
    await borrarFichero(actual.rows[0].image);
    return res.json({ deleted: true });
  } catch (e) { fallo(res, e, "deleting image of"); }
});

module.exports = router;
