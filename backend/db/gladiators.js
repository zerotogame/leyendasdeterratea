const express = require("express");
const pool = require("./db");

const router = express.Router();

const PUESTOS = ["oro", "plata", "bronce"];
const ESTADOS = ["celebrada", "proxima"];

class GladiatorError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const texto = (v) => (v == null ? "" : String(v).trim());
const numero = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 999) throw new GladiatorError("El número de edición no es válido.");
  return n;
};

// Valida el cuerpo de una edición y lo deja con la forma de las columnas.
function limpiar(body) {
  const estado = texto(body.estado) || "celebrada";
  if (!ESTADOS.includes(estado)) throw new GladiatorError("Estado no válido.");
  const anio = body.anio === "" || body.anio == null ? null : Number(body.anio);
  if (anio != null && (!Number.isInteger(anio) || anio < 1 || anio > 99999)) throw new GladiatorError("El año no es válido.");
  const resultados = (Array.isArray(body.resultados) ? body.resultados : []).map((r) => {
    const juego = texto(r.juego);
    const gladiador = texto(r.gladiador);
    if (!juego) throw new GladiatorError("Cada resultado necesita un juego.");
    if (!gladiador) throw new GladiatorError("Cada resultado necesita un gladiador.");
    if (!PUESTOS.includes(r.puesto)) throw new GladiatorError("Puesto no válido.");
    return { juego, puesto: r.puesto, gladiador, gremio: texto(r.gremio) || null };
  });
  return { anio, estado, fecha: texto(body.fecha) || null, cronica: texto(body.cronica), resultados };
}

function fallo(res, error, accion) {
  if (error instanceof GladiatorError) return res.status(error.status).json({ error: error.message });
  console.error(`Error ${accion} gladiator edition`, error);
  return res.status(500).json({ error: "database error" });
}

const SELECT_EDICIONES = `
  SELECT e.number AS numero, e.year AS anio, e.state AS estado, e.date_text AS fecha, e.chronicle AS cronica,
    COALESCE(json_agg(json_build_object('juego', r.game, 'puesto', r.place, 'gladiador', r.gladiator, 'gremio', r.guild)
      ORDER BY r.id) FILTER (WHERE r.id IS NOT NULL), '[]') AS resultados
  FROM gladiator_editions e LEFT JOIN gladiator_results r ON r.edition = e.number`;

router.get("/gladiators/editions", async (_req, res) => {
  try { res.json((await pool.query(`${SELECT_EDICIONES} GROUP BY e.number ORDER BY e.number`)).rows); }
  catch (e) { fallo(res, e, "listing"); }
});

// Crea o reemplaza una edición completa (con sus resultados) en una transacción.
router.put("/gladiators/editions/:numero", async (req, res) => {
  const client = await pool.connect();
  try {
    const n = numero(req.params.numero);
    const e = limpiar(req.body || {});
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO gladiator_editions (number, year, state, date_text, chronicle) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (number) DO UPDATE SET year = $2, state = $3, date_text = $4, chronicle = $5`,
      [n, e.anio, e.estado, e.fecha, e.cronica],
    );
    await client.query("DELETE FROM gladiator_results WHERE edition = $1", [n]);
    for (const r of e.resultados) {
      await client.query(
        "INSERT INTO gladiator_results (edition, game, place, gladiator, guild) VALUES ($1,$2,$3,$4,$5)",
        [n, r.juego, r.puesto, r.gladiador, r.gremio],
      );
    }
    await client.query("COMMIT");
    res.json((await pool.query(`${SELECT_EDICIONES} WHERE e.number = $1 GROUP BY e.number`, [n])).rows[0]);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    fallo(res, e, "saving");
  } finally { client.release(); }
});

router.delete("/gladiators/editions/:numero", async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM gladiator_editions WHERE number = $1", [numero(req.params.numero)]);
    return r.rowCount ? res.json({ ok: true }) : res.status(404).json({ error: "Edición no encontrada" });
  } catch (e) { fallo(res, e, "deleting"); }
});

module.exports = router;
