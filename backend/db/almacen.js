const pool = require("./db");

// Imágenes subidas: viven en la tabla stored_images (el disco de Render se borra en cada despliegue).
// Las rutas (pets/..., characters/...) son las mismas de siempre, así que el front no cambia.
const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

const guardar = (file, buffer) =>
  pool.query(
    "INSERT INTO public.stored_images (file, mime, data) VALUES ($1, $2, $3) ON CONFLICT (file) DO UPDATE SET mime = $2, data = $3",
    [file, MIME[file.split(".").pop()] || "application/octet-stream", buffer]
  );

const borrar = (file) => (file ? pool.query("DELETE FROM public.stored_images WHERE file = $1", [file]).catch(() => {}) : Promise.resolve());

// Se monta en /images DESPUÉS de express.static: sirve lo que no está en disco.
async function servir(req, res, next) {
  try {
    const file = decodeURIComponent(req.path.replace(/^\//, ""));
    if (!/^(pets|characters)\/[\w.-]+$/.test(file)) return next();
    const r = await pool.query("SELECT mime, data FROM public.stored_images WHERE file = $1", [file]);
    if (!r.rowCount) return next();
    res.set("Content-Type", r.rows[0].mime);
    res.set("Cache-Control", "public, max-age=604800");
    return res.send(r.rows[0].data);
  } catch (e) { return next(e); }
}

module.exports = { guardar, borrar, servir };
