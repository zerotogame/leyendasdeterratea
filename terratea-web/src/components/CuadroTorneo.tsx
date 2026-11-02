import {
  ANCHO, asignarEquipo, candidatos, disponer, elegirGanador, esTarjeta, ganadorDe, mapaNodos, type Nodo, type Torneo,
} from '../lib/torneos'

type Props = { torneo: Torneo; onCambio: (t: Torneo) => void; editar: boolean }

/** Organigrama del torneo: columnas por ronda, flechas de cada fuente a su nodo; pulsar una fila = ganador. */
export default function CuadroTorneo({ torneo, onCambio, editar }: Props) {
  const m = mapaNodos(torneo)
  const { cajas, ancho, alto } = disponer(torneo)
  const nombre = (id: string | null) => torneo.equipos.find((e) => e.id === id)?.nombre ?? null
  const columnaX = (c: number) => c * (ANCHO + 70)

  const fila = (n: Nodo, i: number, id: string | null) => {
    const tarjeta = esTarjeta(n)
    if (editar && tarjeta) {
      return (
        <select key={i} className="fila" value={id ?? ''} aria-label="Equipo"
          onChange={(e) => onCambio(asignarEquipo(torneo, n.id, i as 0 | 1, e.target.value || null))}>
          <option value="">Sin rival</option>
          {torneo.equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      )
    }
    const texto = nombre(id)
    const gana = id != null && ganadorDe(m, n.id) === id
    const pierde = id != null && !gana && ganadorDe(m, n.id) != null
    const jugadores = torneo.equipos.find((e) => e.id === id)?.jugadores.map((j) => j.nombre).join(', ')
    return (
      <button key={i} className={`fila${gana ? ' gana' : ''}${pierde ? ' pierde' : ''}${texto ? '' : ' vacia'}`}
        disabled={!texto} title={jugadores || undefined} aria-pressed={gana}
        onClick={() => id && onCambio(elegirGanador(torneo, n.id, id))}>
        {texto ?? (tarjeta ? 'Sin rival' : 'Por definir')}
      </button>
    )
  }

  return (
    <div className="cuadro-scroll">
      <div className="cuadro" style={{ width: ancho, height: alto + 40 }}>
        {torneo.columnas.map((t, c) => (
          <div key={t} className="cuadro-titulo" style={{ left: columnaX(c), width: ANCHO }}>{t}</div>
        ))}
        <svg className="cuadro-lineas" width={ancho} height={alto + 40} aria-hidden="true">
          <defs>
            <marker id="flecha" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--oro)" />
            </marker>
          </defs>
          {torneo.nodos.flatMap((n) => n.fuentes.map((f) => {
            const a = cajas.get(f)!, b = cajas.get(n.id)!
            const x1 = a.x + ANCHO, y1 = a.y + a.alto / 2 + 40, x2 = b.x - 3, y2 = b.y + b.alto / 2 + 40
            const xm = x1 + (x2 - x1) / 2
            return <path key={`${f}-${n.id}`} d={`M${x1} ${y1} H${xm} V${y2} H${x2}`} markerEnd="url(#flecha)" />
          }))}
        </svg>
        {torneo.nodos.map((n) => {
          const caja = cajas.get(n.id)!
          const cand = candidatos(m, n)
          const final = n.columna === torneo.columnas.length - 1
          return (
            <div key={n.id} className={`nodo${esTarjeta(n) ? '' : ' caja'}${final ? ' final' : ''}`}
              style={{ left: caja.x, top: caja.y + 40, width: ANCHO, height: caja.alto }}>
              {(cand.length < 2 ? [...cand, null] : cand).map((id, i) => fila(n, i, id))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

