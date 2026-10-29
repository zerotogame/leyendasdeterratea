// Sesiones de tiradas de creación: el servidor tira los dados, el jugador los ve y
// al crear el personaje se usan estas tiradas (nunca valores enviados por el cliente).
// Viven en memoria: si el servidor se reinicia hay que volver a tirar.

const crypto = require("node:crypto");
const rules = require("./terratea");

const TTL_MS = 2 * 60 * 60 * 1000;
const CONSTITUTION = "Constitución";

const sessions = new Map();

class RollError extends Error {}

function cleanup(now = Date.now()) {
  for (const [id, session] of sessions) {
    if (now - session.createdAt > TTL_MS) sessions.delete(id);
  }
}

function getSession(id) {
  cleanup();

  const session = sessions.get(id);
  if (!session) throw new RollError("La sesión de tiradas ha caducado. Vuelve a tirar los dados.");

  return session;
}

function createSession(classId, minimums = {}) {
  cleanup();

  const id = crypto.randomUUID();
  sessions.set(id, { classId, minimums, stats: {}, vitality: null, createdAt: Date.now() });

  return id;
}

// Cada característica se tira una sola vez por sesión
function rollStatInSession(id, statName, randomInt = crypto.randomInt) {
  const session = getSession(id);

  if (session.stats[statName]) throw new RollError(`${statName} ya está tirada.`);

  const roll = rules.rollStat(session.minimums[statName] ?? 0, randomInt);
  session.stats[statName] = roll;

  return { name: statName, ...roll };
}

// La vitalidad suma el modificador de Constitución, así que va después de tirarla
function rollVitalityInSession(id, randomInt = crypto.randomInt) {
  const session = getSession(id);

  if (session.vitality) throw new RollError("La vitalidad ya está tirada.");
  if (!session.stats[CONSTITUTION]) throw new RollError("Tira antes la Constitución.");

  const constitutionModifier = session.stats[CONSTITUTION].modifier;
  session.vitality = { ...rules.rollInitialVitality(constitutionModifier, randomInt), constitutionModifier };

  return session.vitality;
}

// Tiradas completas de la sesión para crear el personaje
function readSession(id, classId, statNames) {
  const session = getSession(id);

  if (session.classId !== classId) {
    throw new RollError("Has cambiado de clase después de tirar. Vuelve a tirar los dados.");
  }

  const missing = statNames.filter((name) => !session.stats[name]);

  if (missing.length || !session.vitality) {
    throw new RollError("Tira todos los dados antes de crear el personaje.");
  }

  return {
    stats: statNames.map((name) => ({ name, value: session.stats[name].value, modifier: session.stats[name].modifier })),
    vitality: session.vitality
  };
}

const discardSession = (id) => sessions.delete(id);

module.exports = {
  RollError,
  createSession,
  rollStatInSession,
  rollVitalityInSession,
  readSession,
  discardSession,
  TTL_MS,
  _sessions: sessions
};
