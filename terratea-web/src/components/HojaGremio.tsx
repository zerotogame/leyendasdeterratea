import { useEffect } from 'react'
import { MAX_ESTRELLAS, type GremioBd } from '../lib/gremios'
import { urlImagen, type ResumenBd } from '../lib/sync'

const HUECOS = 6 // retratos por lado (los vacíos se dibujan como en la plantilla)
const RENGLONES = 17 // renglones mínimos de cada columna inferior

const Estrella = ({ llena }: { llena: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="12,1.5 15,9 23,9.3 16.8,14.3 19,22.3 12,17.8 5,22.3 7.2,14.3 1,9.3 9,9"
      fill={llena ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)

function Retrato({ m }: { m?: ResumenBd }) {
  return (
    <div className="hg-retrato">
      <div className="hg-circulo">{m?.image && <img src={urlImagen(m.image)} alt={m.name} crossOrigin="anonymous" />}</div>
      <span>{m?.name.split(' ')[0] ?? ''}</span>
    </div>
  )
}

function Columna({ titulo, items, ancho }: { titulo: string; items: string[]; ancho?: string }) {
  const filas = Math.max(RENGLONES, items.length)
  return (
    <section className="hg-col" style={ancho ? { flexBasis: ancho } : undefined}>
      <h2>{titulo}</h2>
      <ul>{Array.from({ length: filas }, (_, i) => <li key={i}>{items[i] ?? ''}</li>)}</ul>
    </section>
  )
}

/** Hoja del gremio con el aspecto de la plantilla (apaisada). Al imprimir solo sale la hoja. */
export default function HojaGremio({ g }: { g: GremioBd }) {
  // «Guardar como PDF» propone el título de la página como nombre de archivo
  useEffect(() => {
    const original = document.title
    const antes = () => { document.title = `${g.name.replace(/[\\/:*?"<>|]/g, '').trim() || 'gremio'}_hoja_de_gremio` }
    const despues = () => { document.title = original }
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => { window.removeEventListener('beforeprint', antes); window.removeEventListener('afterprint', despues) }
  }, [g.name])

  const huecos = Math.max(HUECOS, Math.ceil(g.members.length / 2))
  const izq = Array.from({ length: huecos }, (_, i) => g.members[i * 2])
  const der = Array.from({ length: huecos }, (_, i) => g.members[i * 2 + 1])
  // Las estrellas se rellenan de abajo arriba, de izquierda a derecha
  const orden = [8, 9, 6, 7, 4, 5, 2, 3, 0, 1]
  const llena = (pos: number) => orden.indexOf(pos) < g.stars
  const personal = g.staff.map((x) => (x.note ? `${x.name} (${x.note})` : x.name))

  return (
    <div className="hoja-gremio">
      <div className="hg-pagina">
        <div className="hg-arriba">
          <div className="hg-lateral">
            <div className="hg-caja"><small>Fecha de fundación</small><strong>{g.founded || '—'}</strong></div>
            <div className="hg-caja"><small>Localización</small><strong>{g.location || '—'}</strong></div>
          </div>
          <div className="hg-miembros">{izq.map((m, i) => <Retrato key={i} m={m} />)}</div>
          <div className="hg-centro">
            <h1>{g.name}</h1>
            <div className="hg-emblema" aria-hidden="true"><span>✦</span></div>
          </div>
          <div className="hg-miembros">{der.map((m, i) => <Retrato key={i} m={m} />)}</div>
          <div className="hg-lateral">
            <div className="hg-reputacion">Reputación: {g.reputation}%</div>
            <div className="hg-estrellas" aria-label={`${g.stars} de ${MAX_ESTRELLAS} estrellas`}>
              {Array.from({ length: MAX_ESTRELLAS }, (_, i) => <Estrella key={i} llena={llena(i)} />)}
            </div>
            <div className="hg-tesoro">
              <h2>Tesoro</h2>
              <p><b>Oro:</b> {g.gold}</p>
              <p><b>Plata:</b> {g.silver}</p>
              <p><b>Cobre:</b> {g.copper}</p>
              <h3>Gemas</h3>
              {g.gems.map((x, i) => <p key={i} className="hg-gema">{x.name}({x.quantity})</p>)}
            </div>
          </div>
        </div>

        <div className="hg-abajo">
          <div className="hg-almacen">
            <h2>Almacén</h2>
            <div>
              <ul>{g.storage.map((x, i) => <li key={i}>{x}</li>)}</ul>
              <ul>{g.harvest.length > 0 && <li className="hg-subtitulo">Cosecha</li>}{g.harvest.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          </div>
          <Columna titulo="Ventajas" items={g.advantages} />
          <Columna titulo="Beneficios" items={g.benefits} />
          <Columna titulo="Personal" items={personal} />
          <Columna titulo="Propiedades" items={g.properties} />
        </div>
      </div>
    </div>
  )
}
