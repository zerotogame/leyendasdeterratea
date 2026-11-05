const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// El secreto de los tokens sale de JWT_SECRET. Si falta, se genera uno aleatorio al arrancar:
// nunca hay un secreto fijo en el código (con uno fijo cualquiera podría fabricarse un token de Programador),
// pero los tokens dejan de valer al reiniciar. En producción define JWT_SECRET (mín. 32 caracteres).
let SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  if (SECRET) console.warn("JWT_SECRET demasiado corto (mín. 32 caracteres): se usa un secreto aleatorio.");
  else console.warn("JWT_SECRET no definido: se usa un secreto aleatorio; las sesiones se perderán al reiniciar.");
  SECRET = crypto.randomBytes(48).toString("hex");
}

// Duración de la sesión.
const EXPIRA = "12h";

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

module.exports = { auth, SECRET, EXPIRA };
