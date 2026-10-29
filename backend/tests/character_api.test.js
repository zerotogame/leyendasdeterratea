const { spawn } = require('child_process');
const assert = require('node:assert/strict');

(async () => {
  const server = spawn(process.execPath, ['index.jsx'], {
    cwd: __dirname + '/..',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' }
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  const waitForServer = () => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Servidor no arrancó: ${output}`)), 15000);
    const check = () => {
      if (output.includes('Backend en http://localhost:3000')) {
        clearTimeout(timeout);
        resolve();
      } else {
        setTimeout(check, 250);
      }
    };
    check();
  });

  try {
    await waitForServer();

    const charBefore = await fetch('http://localhost:3000/characters/4');
    assert.equal(charBefore.status, 200, 'Debe devolver la ficha del personaje');
    const charData = await charBefore.json();

    const levelUp = await fetch('http://localhost:3000/characters/4/level-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1 })
    });
    assert.equal(levelUp.status, 200, 'Debe subir de nivel');

    const itemAdd = await fetch('http://localhost:3000/characters/4/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object_id: 1, quantity: 1 })
    });
    assert.equal(itemAdd.status, 200, 'Debe añadir un objeto al inventario');

    const updated = await fetch('http://localhost:3000/characters/4');
    assert.equal(updated.status, 200, 'Debe devolver la ficha actualizada');
    const updatedData = await updated.json();
    assert.ok(updatedData.level >= charData.level, 'El nivel debe aumentar o mantenerse');
    assert.ok(Array.isArray(updatedData.inventory), 'El inventario debe existir');

    console.log('character_api.test.js OK');
  } finally {
    server.kill('SIGTERM');
  }
})();
