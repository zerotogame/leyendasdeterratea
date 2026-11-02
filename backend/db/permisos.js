const jwt = require("jsonwebtoken");
const pool = require("./db");
const { SECRET } = require("../auth");

// Jerarquía: cada rol incluye los de abajo. DEVELOPER (Programador) es admin y puede con todo.
const NIVEL = { PLAYER: 1, GUILD_LEADER: 2, MASTER: 3, DEVELOPER: 4 };

const nivelDe = (codes) => Math.max(0, ...codes.map((c) => NIVEL[c] || 0));

async function rolesDe(userId) {
  const r = await pool.query(
    `SELECT r.code FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id WHERE ur.user_id = $1`,
    [userId]
  );
  return r.rows.map((x) => x.code);
}

// Exige estar identificado y tener, al menos, el nivel del rol indicado. Los roles se leen de la BD en cada
// petición, así que un cambio de rol surte efecto sin que el usuario tenga que volver a entrar.
const requiere = (minimo) => async (req, res, next) => {
  const cabecera = req.headers.authorization || "";
  const token = cabecera.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Tienes que iniciar sesión." });
  let payload;
  try { payload = jwt.verify(token, SECRET); } catch { return res.status(401).json({ error: "Sesión no válida. Vuelve a entrar." }); }
  try {
    const roles = await rolesDe(payload.id);
    const nivel = nivelDe(roles);
    if (nivel < NIVEL[minimo]) return res.status(403).json({ error: "No tienes permiso para hacer esto." });
    req.user = { id: payload.id, roles, nivel };
    return next();
  } catch (e) {
    console.error("Error comprobando permisos", e);
    return res.status(500).json({ error: "database error" });
  }
};

module.exports = { NIVEL, nivelDe, rolesDe, requiere };
