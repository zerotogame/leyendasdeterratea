import {
  ANCHO, asignarEquipo, candidatos, disponer, elegirGanador, esTarjeta, ganadorDe, mapaNodos, type Nodo, type Torneo,
} from '../lib/torneos'

/** Dibuja el cuadro en un canvas (fondo claro, apto para imprimir/compartir) y lo descarga como PNG. */
function dibujar(torneo: Torneo): HTMLCanvasElement {
  const m = mapaNodos(torneo)
  const { cajas, ancho, alto } = disponer(torneo)
  const esc = 2, pad = 24, cab = 40
  const c = document.createElement('canvas')
  c.width = (ancho + pad * 2) * esc
  c.height = (alto + cab + pad * 2 + 30) * esc
  const g = c.getContext('2d')!
  g.scale(esc, esc)
  g.translate(pad, pad)
  g.fillStyle = '#fff'; g.fillRect(-pad, -pad, c.width, c.height)
  g.fillStyle = '#111'; g.font = 'bold 18px sans-serif'; g.textBaseline = 'middle'
  g.fillText(torneo.nombre, 0, 10)
  g.translate(0, 30)
  g.font = '12px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#555'
  torneo.columnas.forEach((t, i) => g.fillText(t.toUpperCase(), i * (ANCHO + 70) + ANCHO / 2, 10))
  g.strokeStyle = '#a07a1c'; g.lineWidth = 1.5; g.fillStyle = '#a07a1c'
  for (const n of torneo.nodos) for (const f of n.fuentes) {
    const a = cajas.get(f)!, b = cajas.get(n.id)!
    const x1 = a.x + ANCHO, y1 = a.y + a.alto / 2 + cab, x2 = b.x - 3, y2 = b.y + b.alto / 2 + cab, xm = (x1 + x2) / 2
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(xm, y1); g.lineTo(xm, y2); g.lineTo(x2, y2); g.stroke()
    g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 8, y2 - 4); g.lineTo(x2 - 8, y2 + 4); g.fill()
  }
  g.textAlign = 'left'; g.font = '13px sans-serif'
  for (const n of torneo.nodos) {
    const caja = cajas.get(n.id)!, y0 = caja.y + cab
    const cand = candidatos(m, n)
    const ids = cand.length < 2 ? [...cand, null] : cand
    const gan = ganadorDe(m, n.id)
    g.fillStyle = '#fff'; g.strokeStyle = '#333'; g.lineWidth = 1
    g.fillRect(caja.x, y0, ANCHO, caja.alto); g.strokeRect(caja.x, y0, ANCHO, caja.alto)
    ids.forEach((id, i) => {
      const h = caja.alto / 2, y = y0 + i * h
      const txt = torneo.equipos.find((e) => e.id === id)?.nombre ?? (esTarjeta(n) ? 'Sin rival' : 'Por definir')
      if (id != null && id === gan) { g.fillStyle = '#e8d9a8'; g.fillRect(caja.x + 1, y + 1, ANCHO - 2, h - 2) }
      g.fillStyle = id == null ? '#999' : gan != null && id !== gan ? '#888' : '#111'
      g.fillText(txt, caja.x + 8, y + h / 2, ANCHO - 16)
    })
    g.beginPath(); g.moveTo(caja.x, y0 + caja.alto / 2); g.lineTo(caja.x + ANCHO, y0 + caja.alto / 2); g.stroke()
  }
  return c
}

function bajar(blob: Blob, nombre: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = nombre
  a.click()
  URL.revokeObjectURL(a.href)
}

const NL = String.fromCharCode(10)
const slug = (t: Torneo) => t.nombre.replace(/[^\p{L}\p{N}]+/gu, '-')

function descargarPng(torneo: Torneo) {
  dibujar(torneo).toBlob((b) => { if (b) bajar(b, `${slug(torneo)}.png`) })
}

/** PDF de una página apaisada con el cuadro como imagen JPEG (PDF mínimo, sin dependencias). */
function descargarPdf(torneo: Torneo) {
  const c = dibujar(torneo)
  c.toBlob(async (b) => {
    if (!b) return
    const jpg = new Uint8Array(await b.arrayBuffer())
    const w = 842, h = Math.round(w * c.height / c.width) // A4 apaisado en puntos de ancho; alto proporcional
    const enc = new TextEncoder()
    const partes: Uint8Array[] = []
    const pos: number[] = []
    let len = 0
    const add = (x: Uint8Array | string) => { const u = typeof x === 'string' ? enc.encode(x) : x; partes.push(u); len += u.length }
    const obj = (n: number, cuerpo: string, datos?: Uint8Array) => {
      pos[n] = len
      add(`${n} 0 obj${NL}${cuerpo}`)
      if (datos) { add(`${NL}stream${NL}`); add(datos); add(`${NL}endstream`) }
      add(`${NL}endobj${NL}`)
    }
    const contenido = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`
    add(`%PDF-1.4${NL}`)
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
    obj(4, `<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>`, jpg)
    obj(5, `<< /Length ${contenido.length} >>`, enc.encode(contenido))
    const xref = len
    add(`xref${NL}0 6${NL}0000000000 65535 f ${NL}${[1, 2, 3, 4, 5].map((n) => `${String(pos[n]).padStart(10, '0')} 00000 n ${NL}`).join('')}`)
    add(`trailer${NL}<< /Size 6 /Root 1 0 R >>${NL}startxref${NL}${xref}${NL}%%EOF`)
    bajar(new Blob(partes as BlobPart[], { type: 'application/pdf' }), `${slug(torneo)}.pdf`)
  }, 'image/jpeg', 0.92)
}

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
    <>
    <div className="filtros no-imprimir">
      <button onClick={() => descargarPng(torneo)}>Descargar imagen (PNG)</button>
      <button onClick={() => descargarPdf(torneo)}>Descargar PDF</button>
      <button onClick={() => window.print()}>Imprimir</button>
    </div>
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
    </>
  )
}

