const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 8, idleTimeoutMillis: 30000 })
  : new Pool({
      user: process.env.PGUSER || "postgres",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "leyendasdeterratea",
      password: process.env.PGPASSWORD,
      port: Number(process.env.PGPORT || 5432)
    });

module.exports = pool;

