const test = require("node:test");
const assert = require("node:assert/strict");
const { subeSaldo } = require("../db/monedas");

const actual = { gold: 10, silver: 5, copper: 0 };

test("gastar o dejar igual no sube el saldo", () => {
  assert.equal(subeSaldo({ gold: 3, silver: 5, copper: 0 }, actual), false);
  assert.equal(subeSaldo({ gold: 10, silver: 5, copper: 0 }, actual), false);
});
test("cambiar una moneda grande por pequeñas al gastar es válido", () => {
  assert.equal(subeSaldo({ gold: 9, silver: 14, copper: 0 }, actual), false); // 1 MO -> 9 MP, gasta 1 MP
});
test("subir el saldo se detecta", () => {
  assert.equal(subeSaldo({ gold: 11 }, actual), true);
  assert.equal(subeSaldo({ copper: "1" }, actual), true);
});
test("sin monedas en el cambio no se comprueba nada", () => {
  assert.equal(subeSaldo({ name: "x", gold: "" }, actual), false);
  assert.equal(subeSaldo(undefined, actual), false);
});
