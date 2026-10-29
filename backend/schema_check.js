const { Client } = require('pg');

(async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'leyendasdeterratea',
    password: '1234',
    port: 5432,
  });

  try {
    await client.connect();
    const tables = ['characters', 'objects', 'character_object', 'class_experience', 'classes'];
    for (const table of tables) {
      const res = await client.query(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
        [table]
      );
      console.log('\nTABLE ' + table);
      if (!res.rows.length) console.log('NO_ROWS');
      else console.log(res.rows.map(r => `${r.column_name}: ${r.data_type} nullable=${r.is_nullable}`).join('\n'));
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
