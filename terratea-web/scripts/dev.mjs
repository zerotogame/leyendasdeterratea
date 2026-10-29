// Arranca el backend (cmr/backend) y la web (vite) con un solo comando.
import { spawn } from 'node:child_process'
import net from 'node:net'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const backend = fileURLToPath(new URL('../../cmr/backend', import.meta.url))

const puertoOcupado = (puerto) => new Promise((ok) => {
  const s = net.connect(puerto, '127.0.0.1')
  s.once('connect', () => { s.destroy(); ok(true) })
  s.once('error', () => ok(false))
})

const hijos = []
const lanzar = (nombre, cmd, args, cwd) => {
  const h = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true })
  h.on('exit', (code) => { console.log(`[${nombre}] terminó (${code})`); parar() })
  hijos.push(h)
}
const parar = () => { for (const h of hijos) h.kill(); process.exit() }
process.on('SIGINT', parar)

if (await puertoOcupado(3000)) console.log('[backend] ya hay algo en el puerto 3000; se reutiliza.')
else lanzar('backend', 'node', ['index.jsx'], backend)
lanzar('web', 'npx', ['vite'], raiz)
