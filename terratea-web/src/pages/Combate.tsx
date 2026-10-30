import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { criaturas, fmtNum, img2 } from '../lib/bestiario'
import {
  aplicarDano, añadirCombatientes, esJugador, guardarRegistro, leerRegistro, movimientoRestante, nuevoTurno, type Combatiente,
} from '../lib/combate'
import { clasePorId } from '../lib/datos'
import { actuaA0, alcanceMaximo } from '../lib/danio'
import { combatienteDeFicha } from '../lib/jugadores'
import { listarPersonajes } from '../lib/personajes'
import { cargarDeBd, listarDeBd, type ResumenBd } from '../lib/sync'
import PanelAtaque, { type ResultadoAtaque } from './PanelAtaque'
import Recompensa from './Recompensa'
import type { Criatura } from '../data/libro2.types'

type SetCombate = (f: (c: Combatiente[]) => Combatiente[]) => void
type Ataque = { atacante: string; objetivo: string | null }

const MAX_CASILLAS = 30 // por encima de esto no se dibujan casillas, solo −1/+1
const con = (n: number) => (n > 0 ? `+${n}` : String(n))
const natural = (v: string) => Math.max(0, Math.floor(Number(v) || 0))
const criaturaPorId = (id: string) => criaturas.find((c) => c.id === id)

export default function Combate({ combate, setCombate }: Readonly<{ combate: Combatiente[]; setCombate: SetCombate }>) {
  const [ataque, setAtaque] = useState<Ataque | null>(null)
  const [abierto, setAbierto] = useState(combate.length === 0)
  const [recompensa, setRecompensa] = useState(false)
  const [registro, setRegistro] = useState<string[]>(leerRegistro)
  useEffect(() => guardarRegistro(registro), [registro])
  const anotar = (texto: string) => setRegistro((r) => [...r, texto])
  const actualizar = (uid: string, f: (c: Combatiente) => Combatiente) => setCombate((l) => l.map((c) => (c.uid === uid ? f(c) : c)))

  const atacante = ataque ? combate.find((c) => c.uid === ataque.atacante) : undefined
  const objetivo = ataque?.objetivo ? combate.find((c) => c.uid === ataque.objetivo) : undefined
  const esObjetivo = (c: Combatiente) => !!atacante && c.uid !== atacante.uid && esJugador(c) !== esJugador(atacante) && c.vida > 0

  const cancelar = () => setAtaque(null)
  const empezarAtaque = (c: Combatiente) => setAtaque({ atacante: c.uid, objetivo: null })
  const tocarTarjeta = (c: Combatiente) => {
    if (ataque && !ataque.objetivo && esObjetivo(c)) setAtaque({ ...ataque, objetivo: c.uid })
  }
  const confirmar = (r: ResultadoAtaque) => {
    if (!atacante || !objetivo) return
    setCombate((l) => l.map((x) => {
      if (x.uid === atacante.uid) return { ...aplicarDano(x, -r.cura), accionUsada: true }
      return x.uid === objetivo.uid ? aplicarDano(x, r.dano) : x
    }))
    anotar(r.texto)
    cancelar()
  }

  /** Gasta o devuelve casillas hasta dejar `usadas` gastadas. */
  const fijarMovimiento = (c: Combatiente, usadas: number) => {
    const antes = c.movUsado ?? 0
    actualizar(c.uid, (x) => ({ ...x, movUsado: Math.max(0, usadas) }))
    if (usadas > antes) anotar(`${c.nombre} se mueve ${usadas - antes} casilla${usadas - antes > 1 ? 's' : ''}.`)
  }

  const añadir = (
    <details className="añadir" open={abierto} onToggle={(e) => setAbierto(e.currentTarget.open)}>
      <summary>➕ Añadir enemigos o jugadores</summary>
      <AñadirEnemigos alAñadir={(lista) => setCombate((c) => añadirCombatientes(c, lista))} />
      <PersonajesBd yaEstan={combate.map((c) => c.fichaId)} alAñadir={(j) => setCombate((l) => [...l, j])} />
      <details>
        <summary>Añadir un jugador a mano</summary>
        <AñadirJugador alAñadir={(j) => setCombate((l) => [...l, j])} />
      </details>
    </details>
  )
  if (combate.length === 0) {
    return (
      <section>
        {añadir}
        <p>No hay nadie en combate. Añade enemigos y jugadores arriba, genera un encuentro o añade criaturas desde su ficha en el <Link to="/bestiario">bestiario</Link>.</p>
      </section>
    )
  }

  const tarjeta = (c: Combatiente) => {
    const cr = criaturaPorId(c.criaturaId)
    const caida = c.vida <= 0
    const pct = c.vidaMax ? Math.round((c.vida / c.vidaMax) * 100) : null
    const resto = movimientoRestante(c)
    const usadas = c.movUsado ?? 0
    const casillas = c.movimiento != null && c.movimiento <= MAX_CASILLAS ? c.movimiento : null
    const fuente = atacante?.uid === c.uid ? 'atacante' : ''
    let estado = ''
    if (ataque && !fuente) estado = esObjetivo(c) && !ataque.objetivo ? 'objetivo' : 'apagada'
    if (objetivo?.uid === c.uid) estado = 'elegida'
    return (
      <div key={c.uid} className={`cc ${caida ? 'caida' : ''} ${fuente} ${estado}`}
        onClick={() => tocarTarjeta(c)} role={estado === 'objetivo' ? 'button' : undefined}>
        <div className="cc-cab">
          {cr ? <img src={img2(cr.imagen)} alt="" loading="lazy" /> : <span className="cc-avatar">{c.nombre.slice(0, 1).toUpperCase()}</span>}
          <div className="cc-nombre">
            <strong>{cr ? <Link to={`/bestiario/${cr.id}`} onClick={(e) => e.stopPropagation()}>{c.nombre}</Link> : c.nombre}</strong>
            <small>{c.clase && `${c.clase} ${c.nivel ?? ''} · `}C.A. {fmtNum(c.ca)} · Alcance {fmtNum(c.alcance)}</small>
            {c.mods && <small title="Fuerza (daño) · Destreza (ataque) · Constitución (bloqueo de daño)">Fue {con(c.mods.fuerza)} · Des {con(c.mods.destreza)} · Con {con(c.mods.constitucion)}</small>}
          </div>
          <button className="mini" title="Quitar del combate" onClick={(e) => { e.stopPropagation(); setCombate((l) => l.filter((x) => x.uid !== c.uid)); if (ataque && (ataque.atacante === c.uid || ataque.objetivo === c.uid)) cancelar() }}>✕</button>
        </div>

        <div className="cc-vida" onClick={(e) => e.stopPropagation()}>
          <div className="cc-vida-num">
            <button onClick={() => actualizar(c.uid, (x) => aplicarDano(x, 5))}>−5</button>
            <button onClick={() => actualizar(c.uid, (x) => aplicarDano(x, 1))}>−1</button>
            <span className="cc-hp">
              <input type="number" min={0} aria-label={`Vida de ${c.nombre}`} value={c.vida}
                onChange={(e) => actualizar(c.uid, (x) => ({ ...x, vida: natural(e.target.value) }))} />
              <small>/ {fmtNum(c.vidaMax)}</small>
            </span>
            <button onClick={() => actualizar(c.uid, (x) => aplicarDano(x, -1))}>+1</button>
            <button onClick={() => actualizar(c.uid, (x) => aplicarDano(x, -5))}>+5</button>
          </div>
          {pct != null && <div className="barra"><span style={{ width: `${pct}%` }} /></div>}
          {caida && <small className="error">A 0 de vitalidad</small>}
        </div>

        <div className="cc-mov" onClick={(e) => e.stopPropagation()}>
          <small>Movimiento {fmtNum(resto)} / {fmtNum(c.movimiento)}</small>
          {casillas == null ? (
            <span>
              <button onClick={() => fijarMovimiento(c, usadas + 1)}>−1</button>
              <button onClick={() => fijarMovimiento(c, usadas - 1)}>+1</button>
            </span>
          ) : (
            <span className="pips">
              {Array.from({ length: casillas }, (_, i) => (
                <button key={i} className={`pip ${i < usadas ? 'gastada' : ''}`} aria-label={i < usadas ? `Devolver casilla ${i + 1}` : `Gastar hasta la casilla ${i + 1}`}
                  onClick={() => fijarMovimiento(c, i < usadas ? i : i + 1)} />
              ))}
            </span>
          )}
        </div>

        <div className="cc-pie" onClick={(e) => e.stopPropagation()}>
          <button className={c.accionUsada ? 'activo' : ''} onClick={() => actualizar(c.uid, (x) => ({ ...x, accionUsada: !x.accionUsada }))}>
            {c.accionUsada ? '✔ Acción gastada' : '○ Acción libre'}
          </button>
          {(!caida || actuaA0(c)) && <button className="peligro" onClick={() => empezarAtaque(c)}>⚔ Atacar</button>}
        </div>

        {(c.habilidades?.length || c.extras?.length) ? (
          <details className="cc-hab" onClick={(e) => e.stopPropagation()}>
            <summary>Habilidades ({(c.habilidades ?? []).filter((h) => h.activa).length} activas)</summary>
            <ul>
              {[...(c.habilidades ?? [])].sort((a, b) => Number(b.activa) - Number(a.activa)).map((h) => (
                <li key={h.nombre}>
                  <strong>{h.activa ? '⚡ ' : ''}{h.nombre}</strong>{h.bonoDano != null && ` (+${h.bonoDano} daño)`}{h.curaMitad && ' (cura)'}
                  <br /><small>{h.descripcion}</small>
                </li>
              ))}
              {(c.extras ?? []).map((x) => <li key={x}><small>{x}</small></li>)}
            </ul>
          </details>
        ) : null}
      </div>
    )
  }

  const jugadores = combate.filter(esJugador)
  const enemigos = combate.filter((c) => !esJugador(c))

  return (
    <section>
      {añadir}
      <div className="filtros">
        <button className="primario" onClick={() => { setCombate((l) => l.map((c) => nuevoTurno(c))); anotar('— Turno nuevo: todos recuperan movimiento y acción —') }}>⏭ Turno nuevo</button>
        <button onClick={() => setCombate((l) => l.map((c) => ({ ...c, vida: c.vidaMax ?? c.vida })))}>Curar a todos</button>
        <button onClick={() => setRecompensa((r) => !r)}>🏆 Recompensa</button>
        <button className="peligro" onClick={() => { if (confirm('¿Vaciar el combate?')) { setCombate(() => []); cancelar() } }}>Vaciar combate</button>
      </div>

      {recompensa && <Recompensa combate={combate} actualizar={actualizar} anotar={anotar} alCerrar={() => setRecompensa(false)} />}

      {atacante && objetivo && (
        <PanelAtaque key={`${atacante.uid}-${objetivo.uid}`} atacante={atacante} objetivo={objetivo} alConfirmar={confirmar}
          alCancelar={cancelar} alCambiarObjetivo={() => setAtaque({ ...ataque!, objetivo: null })} />
      )}
      {atacante && !objetivo && (
        <div className="barra-ataque" role="status">
          <span>⚔ <strong>{atacante.nombre}</strong>: toca la tarjeta de a quién ataca.</span>
          <button onClick={cancelar}>Cancelar</button>
        </div>
      )}

      <div className="cc-cols">
        <div>
          <h3>🛡 Jugadores ({jugadores.length})</h3>
          {jugadores.length === 0 && <p className="nota">Aún no hay jugadores: usa «Añadir».</p>}
          <div className="cc-lista">{jugadores.map(tarjeta)}</div>
        </div>
        <div>
          <h3>👹 Enemigos ({enemigos.length})</h3>
          {enemigos.length === 0 && <p className="nota">Aún no hay enemigos: usa «Añadir».</p>}
          <div className="cc-lista">{enemigos.map(tarjeta)}</div>
        </div>
      </div>

      <h3>Registro</h3>
      <ol className="registro">
        {[...registro].reverse().map((r, i) => <li key={i}>{r}</li>)}
        {registro.length === 0 && <li className="nota">Aún no hay nada.</li>}
      </ol>
      {registro.length > 0 && <button onClick={() => setRegistro([])}>Borrar registro</button>}
    </section>
  )
}

/** Personajes de la base de datos: un toque y entran con su vida, movimiento, alcance, armas y habilidades. */
function PersonajesBd({ yaEstan, alAñadir }: Readonly<{ yaEstan: (number | undefined)[]; alAñadir: (c: Combatiente) => void }>) {
  const [lista, setLista] = useState<ResumenBd[] | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState<number | null>(null)
  useEffect(() => {
    let vivo = true
    listarDeBd().then((l) => { if (vivo) setLista(l) }).catch((e: Error) => { if (vivo) setError(e.message) })
    return () => { vivo = false }
  }, [])

  const añadir = async (id: number) => {
    setCargando(id); setError('')
    try { alAñadir(combatienteDeFicha(await cargarDeBd(id))) }
    catch (e) { setError((e as Error).message) }
    finally { setCargando(null) }
  }
  const pendientes = (lista ?? []).filter((p) => !yaEstan.includes(p.id))

  return (
    <div className="filtros">
      <strong>Jugadores</strong>
      {lista === null && !error && <small className="nota">Cargando personajes…</small>}
      {pendientes.map((p) => (
        <button key={p.id} className="primario" disabled={cargando === p.id} onClick={() => añadir(p.id)}>
          ➕ {p.name.split(/\s+/)[0]} <small>({p.class} {p.level})</small>
        </button>
      ))}
      {lista !== null && pendientes.length === 0 && !error && <small className="nota">Todos los personajes ya están en el combate.</small>}
      {error && <small className="error">{error}</small>}
    </div>
  )
}

/** Añade un jugador a mano o a partir de un personaje guardado en este navegador. */
function AñadirJugador({ alAñadir }: Readonly<{ alAñadir: (c: Combatiente) => void }>) {
  const personajes = useMemo(() => listarPersonajes(), [])
  const [nombre, setNombre] = useState('')
  const [vida, setVida] = useState('')
  const [mov, setMov] = useState('')
  const [alc, setAlc] = useState('')

  const cargar = (id: string) => {
    const p = personajes.find((x) => x.id === id)
    if (!p) return
    const clase = clasePorId(p.claseId)
    setNombre(p.nombre)
    setVida(p.vida != null ? String(p.vida) : '')
    setMov(clase ? String(clase.movimiento.combate) : '')
    setAlc(alcanceMaximo(clase?.rango_distancia)?.toString() ?? '') // «1-3» → 3; si no es claro, se rellena a mano
  }
  const añadir = () => {
    if (!nombre.trim()) return
    const v = natural(vida)
    alAñadir({
      uid: crypto.randomUUID(), criaturaId: '', nombre: nombre.trim(), bando: 'jugador',
      vidaMax: v || null, vida: v, ca: null, movimiento: mov === '' ? null : natural(mov), alcance: alc === '' ? null : natural(alc),
    })
    setNombre(''); setVida(''); setMov(''); setAlc('')
  }

  return (
    <div className="filtros">
      <strong>Jugador</strong>
      {personajes.length > 0 && (
        <select value="" onChange={(e) => cargar(e.target.value)}>
          <option value="">Rellenar con un personaje guardado…</option>
          {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre || 'Sin nombre'}</option>)}
        </select>
      )}
      <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') añadir() }} />
      <input type="number" min={0} placeholder="Vida" value={vida} style={{ width: 70 }} onChange={(e) => setVida(e.target.value)} />
      <input type="number" min={0} placeholder="Mov." value={mov} style={{ width: 70 }} onChange={(e) => setMov(e.target.value)} />
      <input type="number" min={0} placeholder="Alc." value={alc} style={{ width: 70 }} onChange={(e) => setAlc(e.target.value)} />
      <button className="primario" disabled={!nombre.trim()} onClick={añadir}>➕ Añadir</button>
    </div>
  )
}

/** Añade manualmente N criaturas del bestiario (p. ej. 4 yetis + 3 bandidos) al combate. */
function AñadirEnemigos({ alAñadir }: Readonly<{ alAñadir: (l: Criatura[]) => void }>) {
  const [texto, setTexto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const elegida = criaturas.find((c) => norm(c.nombre) === norm(texto.trim()))
  const añadir = () => {
    if (!elegida) return
    alAñadir(Array.from({ length: cantidad }, () => elegida))
    setTexto('')
    setCantidad(1)
  }
  return (
    <div className="filtros">
      <label>Enemigos <input list="lista-criaturas" placeholder="Escribe un nombre (Yeti, Bandido…)" value={texto}
        onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') añadir() }} /></label>
      <datalist id="lista-criaturas">
        {criaturas.map((c) => <option key={c.id} value={c.nombre} />)}
      </datalist>
      <label>Cantidad <input type="number" min={1} max={50} value={cantidad} style={{ width: 70 }}
        onChange={(e) => setCantidad(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} /></label>
      <button className="primario" disabled={!elegida} onClick={añadir}>➕ Añadir</button>
      {texto.trim() && !elegida && <small className="nota">Elige una criatura de la lista.</small>}
    </div>
  )
}
