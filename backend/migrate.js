// Aplica las migraciones SQL de backend/migrations que aun no esten registradas.
// Se ejecuta antes de arrancar la API (npm start): si una migracion falla, la API no arranca.
const fs = require("fs/promises");
const path = require("path");
const pool = require("./db/db");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const LOCK_ID = 7354001;

// Migraciones que ya estaban aplicadas a mano (local y Neon) antes de existir este ejecutor
const BASELINE_UNTIL = "v0.10_razas_clases_completas.sql";

async function main() {
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);

    const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

    const tracked = await client.query("SELECT to_regclass('public.schema_migrations') AS t");
    const firstRun = !tracked.rows[0].t;

    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())"
    );

    if (firstRun) {
      const existing = await client.query("SELECT to_regclass('public.characters') AS t");
      if (!existing.rows[0].t) {
        throw new Error("La base esta vacia: restaura antes db_backups/v0.02.sql (ver DEPLOY-FREE.md).");
      }
      const baseline = files.filter((f) => f <= BASELINE_UNTIL);
      for (const name of baseline) {
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
      }
      console.log(`[migrate] base existente: ${baseline.length} migraciones marcadas como aplicadas`);
    }

    const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
    const pending = files.filter((f) => !done.has(f));

    if (!pending.length) {
      console.log("[migrate] base al dia");
      return;
    }

    for (const name of pending) {
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, name), "utf8");
      console.log(`[migrate] aplicando ${name}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`${name}: ${err.message}`);
      }
    }
    console.log(`[migrate] ${pending.length} migraciones aplicadas`);
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] error:", err.message);
  process.exit(1);
});
