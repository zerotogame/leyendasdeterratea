// Crea (o actualiza) el primer Programador. La contraseña NUNCA va en el repo ni en una migración:
//   EMAIL=tu@correo PASSWORD='contraseña-larga-y-única' DATABASE_URL=... node scripts/crear_programador.js
const bcrypt = require("bcrypt");
const pool = require("../db/db");

(async () => {
  const email = (process.env.EMAIL || "").trim().toLowerCase();
  const password = process.env.PASSWORD || "";
  if (!email.includes("@")) throw new Error("Falta EMAIL");
  if (password.length < 12 || password.length > 72) throw new Error("PASSWORD: entre 12 y 72 caracteres");
  const hash = await bcrypt.hash(password, 12);
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const ya = await c.query("SELECT id FROM public.users WHERE LOWER(email) = $1", [email]);
    const u = ya.rowCount
      ? await c.query("UPDATE public.users SET password = $2 WHERE id = $1 RETURNING id", [ya.rows[0].id, hash])
      : await c.query("INSERT INTO public.users (email, password, role) VALUES ($1, $2, 'ADMIN') RETURNING id", [email, hash]);
    await c.query(
      `INSERT INTO public.user_roles (user_id, role_id) SELECT $1, id FROM public.roles WHERE code = 'DEVELOPER' ON CONFLICT DO NOTHING`, [u.rows[0].id]);
    await c.query("COMMIT");
    console.log(`Programador listo: ${email} (id ${u.rows[0].id})`);
  } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); await pool.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
