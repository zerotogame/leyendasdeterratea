const test = require("node:test");
const assert = require("node:assert/strict");

const rules = require("../rules/terratea");

// randomInt determinista: devuelve siempre la secuencia dada (cíclica)
const fixed = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test("altura, peso y edad se validan contra el rango de la raza", () => {
  assert.deepEqual(rules.validatePhysical("Humano", { height: 1.8, weight: 80, age: 30 }), []);

  const errors = rules.validatePhysical("Humano", { height: 2.5, weight: 50, age: 120 });
  assert.equal(errors.length, 3);
});

test("los límites del rango son válidos", () => {
  assert.deepEqual(rules.validatePhysical("Humano", { height: 1.5, weight: 60, age: 90 }), []);
  assert.deepEqual(rules.validatePhysical("Humano", { height: 2.0, weight: 100, age: 100 }), []);
});

test("cada raza usa su propio rango", () => {
  assert.equal(rules.validatePhysical("Humano", { height: 2.2, weight: 80, age: 30 }).length, 1);
  assert.deepEqual(rules.validatePhysical("Elfo Oscuro", { height: 2.2, weight: 80, age: 500 }), []);
});

test("altura y peso son obligatorios si la raza tiene rango", () => {
  const errors = rules.validatePhysical("Humano", { age: 30 });
  assert.equal(errors.length, 2);
});

test("razas sin rango en las reglas no se restringen", () => {
  assert.deepEqual(rules.validatePhysical("Autómata", { height: 9, weight: 9000 }), []);
});

test("el nombre de la raza se compara sin acentos ni mayúsculas", () => {
  assert.ok(rules.raceRules("satiro"));
  assert.ok(rules.raceRules("Sátiro"));
  assert.equal(rules.raceRules("Inventada"), null);
});

test("el alineamiento es una lista cerrada", () => {
  assert.deepEqual(rules.validateAlignment("Neutral"), []);
  assert.equal(rules.validateAlignment("Maligno").length, 1);
  assert.equal(rules.ALIGNMENTS.length, 5);
});

test("el alineamiento respeta las restricciones de la clase", () => {
  assert.deepEqual(rules.validateAlignment("Legal", ["Legal", "Neutral"]), []);
  assert.equal(rules.validateAlignment("Caotico", ["Legal", "Neutral"]).length, 1);
});

test("el sexo es una lista cerrada y es opcional", () => {
  for (const sex of ["Hombre", "Mujer", "No definido", "", null, undefined]) {
    assert.deepEqual(rules.validateSex(sex), []);
  }
  assert.equal(rules.validateSex("Otro").length, 1);
});

test("la clase restringe razas, salvo razas polivalentes", () => {
  assert.deepEqual(rules.validateClassRace(["Elfo Oscuro"], "Elfo Oscuro"), []);
  assert.equal(rules.validateClassRace(["Elfo Oscuro"], "Orco").length, 1);
  assert.deepEqual(rules.validateClassRace(["Elfo Oscuro"], "Humano", ["Polivalente"]), []);
  assert.deepEqual(rules.validateClassRace(null, "Orco"), []);
});

test("vitalidad inicial: 1d12 con mínimo 3 en el dado más Constitución", () => {
  assert.deepEqual(rules.rollInitialVitality(1, fixed(1)), { roll: 1, total: 4 });
  assert.deepEqual(rules.rollInitialVitality(0, fixed(2)), { roll: 2, total: 3 });
  assert.deepEqual(rules.rollInitialVitality(2, fixed(9)), { roll: 9, total: 11 });
});

test("la vitalidad inicial siempre queda en rango", () => {
  for (let i = 0; i < 200; i++) {
    const { roll, total } = rules.rollInitialVitality(1);
    assert.ok(roll >= 1 && roll <= 12);
    assert.ok(total >= 4 && total <= 13);
  }
});

test("vitalidad por nivel: +5 (2-9), +10 (10-19), +25 (20)", () => {
  assert.equal(rules.vitalityForLevel(1), 0);
  assert.equal(rules.vitalityForLevel(2), 5);
  assert.equal(rules.vitalityForLevel(9), 5);
  assert.equal(rules.vitalityForLevel(10), 10);
  assert.equal(rules.vitalityForLevel(19), 10);
  assert.equal(rules.vitalityForLevel(20), 25);
});

test("puntos de característica solo en los niveles 10 y 20", () => {
  assert.equal(rules.statPointsForLevel(10), 1);
  assert.equal(rules.statPointsForLevel(20), 2);
  for (const level of [1, 2, 9, 11, 15, 19]) assert.equal(rules.statPointsForLevel(level), 0);
});

test("salvaciones por tramo de nivel de la raza", () => {
  const rows = [
    { level_min: 1, level_max: 3, save_id: 1, value: 14 },
    { level_min: 4, level_max: 6, save_id: 1, value: 12 },
    { level_min: 19, level_max: null, save_id: 1, value: 3 }
  ];

  assert.deepEqual(rules.savesForLevel(rows, 1), [{ save_id: 1, value: 14 }]);
  assert.deepEqual(rules.savesForLevel(rows, 3), [{ save_id: 1, value: 14 }]);
  assert.deepEqual(rules.savesForLevel(rows, 4), [{ save_id: 1, value: 12 }]);
  assert.deepEqual(rules.savesForLevel(rows, 25), [{ save_id: 1, value: 3 }]);
});

test("las características se tiran con dados y respetan los mínimos de la clase", () => {
  const names = ["Fuerza", "Sabiduría"];

  // Fuerza: 1+1+1 = 3 (sin mínimo). Sabiduría: 1+1+1 = 3 no cumple 10, se repite: 6+6+6 = 18
  const stats = rules.rollCharacteristics(names, { Sabiduría: 10 }, fixed(1, 1, 1, 1, 1, 1, 6, 6, 6));
  assert.deepEqual(stats.map((s) => s.value), [3, 18]);

  for (const s of rules.rollCharacteristics(names)) {
    assert.ok(s.value >= 3 && s.value <= 18);
    assert.equal(s.modifier, rules.statModifier(s.value));
  }
});

test("alcance: mínimo 1 y penalización por casilla extra", () => {
  assert.deepEqual(rules.rangePenalty(7, 7), { action: 0, damage: 0 });
  assert.deepEqual(rules.rangePenalty(7, 9), { action: -10, damage: -8 });
  assert.deepEqual(rules.rangePenalty(0, 2), { action: -5, damage: -4 });
});
