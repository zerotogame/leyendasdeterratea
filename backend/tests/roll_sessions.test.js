const test = require("node:test");
const assert = require("node:assert/strict");

const rules = require("../rules/terratea");
const sessions = require("../rules/roll_sessions");

const fixed = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const STATS = ["Fuerza", "Destreza", "Constitución"];

test("una tirada de característica devuelve los dados, el total y el modificador", () => {
  const roll = rules.rollStat(0, fixed(4, 5, 6));
  assert.deepEqual(roll.dice, [4, 5, 6]);
  assert.equal(roll.value, 15);
  assert.equal(roll.modifier, rules.statModifier(15));
  assert.equal(roll.attempts, 1);
});

test("si no llega al mínimo de la clase se repite y se indica cuántas veces", () => {
  const roll = rules.rollStat(10, fixed(1, 1, 1, 2, 2, 2, 5, 5, 5));
  assert.equal(roll.value, 15);
  assert.equal(roll.attempts, 3);
});

test("cada característica solo se puede tirar una vez por sesión", () => {
  const id = sessions.createSession(1);
  sessions.rollStatInSession(id, "Fuerza");
  assert.throws(() => sessions.rollStatInSession(id, "Fuerza"), sessions.RollError);
});

test("la vitalidad exige haber tirado antes la Constitución y usa su modificador", () => {
  const id = sessions.createSession(1);
  assert.throws(() => sessions.rollVitalityInSession(id), sessions.RollError);

  const con = sessions.rollStatInSession(id, "Constitución", fixed(6, 6, 6));
  const vitality = sessions.rollVitalityInSession(id, fixed(8));

  assert.equal(vitality.constitutionModifier, con.modifier);
  assert.equal(vitality.total, 8 + con.modifier);
  assert.throws(() => sessions.rollVitalityInSession(id), sessions.RollError);
});

test("no se puede crear sin haber tirado todo", () => {
  const id = sessions.createSession(1);
  sessions.rollStatInSession(id, "Fuerza");

  assert.throws(() => sessions.readSession(id, 1, STATS), sessions.RollError);
});

test("las tiradas completas se leen en el orden de las características", () => {
  const id = sessions.createSession(1);
  for (const name of STATS) sessions.rollStatInSession(id, name);
  sessions.rollVitalityInSession(id);

  const { stats, vitality } = sessions.readSession(id, 1, STATS);
  assert.deepEqual(stats.map((s) => s.name), STATS);
  assert.ok(vitality.total >= 3);
});

test("cambiar de clase invalida las tiradas", () => {
  const id = sessions.createSession(1);
  for (const name of STATS) sessions.rollStatInSession(id, name);
  sessions.rollVitalityInSession(id);

  assert.throws(() => sessions.readSession(id, 2, STATS), sessions.RollError);
});

test("la sesión respeta los mínimos de la clase", () => {
  const id = sessions.createSession(1, { Fuerza: 10 });

  for (let i = 0; i < 20; i++) {
    const other = sessions.createSession(1, { Fuerza: 10 });
    assert.ok(sessions.rollStatInSession(other, "Fuerza").value >= 10);
  }

  assert.ok(sessions.rollStatInSession(id, "Fuerza").value >= 10);
});

test("las sesiones desconocidas o caducadas se rechazan", () => {
  assert.throws(() => sessions.rollStatInSession("no-existe", "Fuerza"), sessions.RollError);

  const id = sessions.createSession(1);
  sessions._sessions.get(id).createdAt = Date.now() - sessions.TTL_MS - 1;
  assert.throws(() => sessions.rollStatInSession(id, "Fuerza"), sessions.RollError);
});

test("una sesión consumida no se puede reutilizar", () => {
  const id = sessions.createSession(1);
  sessions.discardSession(id);
  assert.throws(() => sessions.rollStatInSession(id, "Fuerza"), sessions.RollError);
});
