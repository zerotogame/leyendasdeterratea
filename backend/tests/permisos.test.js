// Permisos: ninguna ruta de escritura sin middleware de sesión/rol, y sin token => 401 (sin tocar la BD).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const raiz = path.join(__dirname, "..");
const ficheros = ["index.jsx", ...fs.readdirSync(path.join(raiz, "db")).filter((f) => f.endsWith(".js")).map((f) => `db/${f}`)];
// Rutas de escritura que pueden ser públicas a propósito (el login real lleva su propio límite).
const PUBLICAS = new Set(["POST /login"]);
const PROTECCION = /requiere\(|\bPLAYER\b|\bMASTER\b|\bDEVELOPER\b|\bGUILD_LEADER\b|\bauth\b|dueñoDeLaSesion/;

test("toda ruta de escritura declara un middleware de sesión o rol", () => {
  const sinProteger = [];
  for (const f of ficheros) {
    const lineas = fs.readFileSync(path.join(raiz, f), "utf8").split(/\r?\n/);
    lineas.forEach((l, i) => {
      const m = l.match(/^\s*(?:app|router)\.(post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]\s*,?(.*)$/);
      if (!m) return;
      const clave = `${m[1].toUpperCase()} ${m[2]}`;
      if (PUBLICAS.has(clave)) return;
      if (!PROTECCION.test(m[3])) sinProteger.push(`${f}:${i + 1} ${clave}`);
    });
  }
  assert.deepEqual(sinProteger, [], `Rutas de escritura sin proteger:\n${sinProteger.join("\n")}`);
});

test("el secreto fijo y el login falso ya no existen", () => {
  for (const f of ficheros) {
    const t = fs.readFileSync(path.join(raiz, f), "utf8").split(/\r?\n/).filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("/*"));
    assert.ok(!t.some((l) => /supersecret/.test(l)), `${f} contiene un secreto fijo`);
  }
  const idx = fs.readFileSync(path.join(raiz, "index.jsx"), "utf8");
  assert.ok(!/app\.post\(\s*["']\/register["']/.test(idx), "/register no debe existir");
});

test("sin token, las rutas de escritura responden 401 y /users 401", async (t) => {
  const puerto = 3900 + Math.floor(Math.random() * 90);
  const srv = spawn(process.execPath, ["index.jsx"], {
    cwd: raiz,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(puerto), FORCE_COLOR: "0", JWT_SECRET: "x".repeat(40) },
  });
  let salida = "";
  srv.stdout.on("data", (c) => (salida += c));
  srv.stderr.on("data", (c) => (salida += c));
  t.after(() => srv.kill("SIGTERM"));
  await new Promise((ok, ko) => {
    const lim = setTimeout(() => ko(new Error(`El servidor no arrancó: ${salida}`)), 15000);
    const mira = () => (salida.includes("Backend en") ? (clearTimeout(lim), ok()) : setTimeout(mira, 200));
    mira();
  });
  const base = `http://localhost:${puerto}`;
  const casos = [
    ["POST", "/characters/web"], ["PUT", "/characters/4"], ["DELETE", "/characters/4"],
    ["POST", "/characters/4/level-up"], ["POST", "/characters/4/items"], ["POST", "/characters/4/experience"],
    ["POST", "/guilds"], ["PUT", "/guilds/1"], ["DELETE", "/guilds/1"],
    ["POST", "/pets"], ["PUT", "/pets/1"], ["DELETE", "/pets/1"],
    ["PUT", "/gladiators/editions/1"], ["DELETE", "/gladiators/editions/1"],
    ["GET", "/users"], ["GET", "/roles"], ["POST", "/users"], ["DELETE", "/users/1"], ["GET", "/admin/characters"],
  ];
  for (const [metodo, ruta] of casos) {
    const r = await fetch(base + ruta, { method: metodo, headers: { "Content-Type": "application/json" }, body: metodo === "GET" || metodo === "DELETE" ? undefined : "{}" });
    assert.equal(r.status, 401, `${metodo} ${ruta} sin token debe dar 401 y dio ${r.status}`);
  }
  const fake = await fetch(base + "/users", { headers: { Authorization: "Bearer inventado" } });
  assert.ok([401, 403].includes(fake.status), "un token inventado no pasa");
});
