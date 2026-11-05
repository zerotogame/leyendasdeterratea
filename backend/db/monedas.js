// Regla de monedas: el Master puede dejarlas como quiera; el resto solo puede gastar (el saldo total nunca sube).
// Se compara el total en cobre (1 M.O. = 10 M.P. = 100 M.C.) porque al gastar se puede "cambiar" una moneda grande por pequeñas.
const VALOR = { gold: 100, silver: 10, copper: 1 };
const MONEDAS = Object.keys(VALOR);

const total = (m) => MONEDAS.reduce((t, k) => t + (Number(m[k]) || 0) * VALOR[k], 0);

// ¿El cambio deja más saldo del que ya tiene el personaje? Las monedas que no se mandan se quedan como están.
function subeSaldo(body, actual) {
  if (!body || !MONEDAS.some((k) => body[k] !== undefined && body[k] !== "")) return false;
  const nuevo = {};
  for (const k of MONEDAS) nuevo[k] = body[k] !== undefined && body[k] !== "" ? body[k] : actual[k];
  return total(nuevo) > total(actual);
}

// TODO(merge con roles-login): sustituir por `(await nivelOpcional(req)) >= NIVEL.MASTER` (db/permisos.js).
// Mientras no haya login, todos son Master (en pruebas todos son admin).
async function esMaster(_req) {
  return true;
}

module.exports = { MONEDAS, subeSaldo, esMaster };
