import { Link, useSearchParams } from 'react-router-dom'
import { useRef, useState, type CSSProperties } from 'react'
import mapas from '../data/mapas.json'
import { img } from '../lib/img'

type Region = { titulo: string; parrafos: string[]; imagenes: string[] }

// Texto íntegro del Libro 1, cap. «Mapas y reinos». Las tres familias de samuráis
// pertenecen al reino del Este, así que cuelgan de Revelfbolth.
const regiones = mapas.regiones as Region[]

type Punto = 'norte' | 'oeste' | 'este' | 'sur' | 'centro'
type Seccion = { id: string; nombre: string; punto: Punto; rumbo: string; color: string; indices: number[] }

// El color es solo identidad visual de cada reino (no sale del libro).
const SECCIONES: Seccion[] = [
  { id: 'stungerb', nombre: 'Stungerb', punto: 'norte', rumbo: 'Reino del Norte', color: '#8ec1d6', indices: [0] },
  { id: 'maurizanian', nombre: 'Maurizanian', punto: 'oeste', rumbo: 'Reino del Oeste', color: '#8fb36b', indices: [1] },
  { id: 'revelfbolth', nombre: 'Revelfbolth', punto: 'este', rumbo: 'Reino del Este', color: '#d4637a', indices: [3, 4, 5, 6] },
  { id: 'lusitanius', nombre: 'Lusitanius', punto: 'sur', rumbo: 'Reino del Sur', color: '#e0914a', indices: [2] },
  { id: 'overfield', nombre: 'Overfield', punto: 'centro', rumbo: 'Ciudad del Parlamento', color: '#d4a24c', indices: [7] },
]

// «LA FAMILIA AOINU» → «La familia Aoinu»
const limpio = (t: string) => t === t.toUpperCase()
  ? t.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()).replace(/(familia )(\w)/, (_, a, b) => a + b.toUpperCase())
  : t

// Líneas cortas sin punto final (p. ej. «Freiya, capital del reino de Stungerb») son pies de imagen o subtítulos.
const esSubtitulo = (p: string) => p.length < 70 && !/[.:;]$/.test(p.trim())

// Posición de cada reino sobre el mapa del mundo (% del ancho y alto de la imagen).
const PINES: Record<string, [number, number]> = {
  stungerb: [49, 8], maurizanian: [14, 52], revelfbolth: [86, 50], lusitanius: [51, 91], overfield: [49, 50],
}

const vars = (s: Seccion) => ({ '--reino': s.color }) as CSSProperties

function Brujula({ actual }: { actual?: string }) {
  return (
    <nav className="brujula" aria-label="Reinos de Terratea">
      {SECCIONES.map((s) => (
        <Link
          key={s.id}
          to={`?reino=${s.id}`}
          replace
          className={`punto ${s.punto}${actual === s.id ? ' activo' : ''}`}
          style={vars(s)}
          aria-current={actual === s.id ? 'page' : undefined}
        >
          <span className="rumbo">{s.punto === 'centro' ? 'Centro' : s.punto[0].toUpperCase() + s.punto.slice(1)}</span>
          <span className="nombre">{s.nombre}</span>
        </Link>
      ))}
    </nav>
  )
}

// En los datos, la 1.ª imagen de cada región es su emblema (PNG negro transparente) y la 2.ª el plano de su capital.
function Medallon({ src, alt, tam }: { src: string; alt: string; tam?: number }) {
  return (
    <div className="medallon" style={tam ? ({ '--d': `${tam}px` } as CSSProperties) : undefined}>
      <img src={img(src)} alt={alt} loading="lazy" />
    </div>
  )
}

// Párrafo plegable: se ve la primera frase y, al tocarlo, el resto.
function dividir(p: string): [string, string] {
  const m = /^(.+?[.!?…])\s+([\s\S]+)$/.exec(p)
  return m && p.length > 230 ? [m[1], m[2]] : [p, '']
}

function Fragmento({ texto, abierto, siguiente, alTocar }: { texto: string; abierto: boolean; siguiente: boolean; alTocar: () => void }) {
  const [inicio, resto] = dividir(texto)
  const ref = useRef<HTMLDivElement>(null)
  if (!resto) return <p className="frag frag-corto">{texto}</p>
  // Al abrir, sube el fragmento hacia arriba para que se lea el texto desplegado.
  const tocar = () => {
    alTocar()
    if (abierto) return
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(() => ref.current?.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' }), 50)
  }
  return (
    <div ref={ref} className={`frag${abierto ? ' abierto' : ''}${siguiente && !abierto ? ' siguiente' : ''}`}>
      <button type="button" className="frag-cab" aria-expanded={abierto} onClick={tocar}>
        <span className="frag-inicio">{inicio}</span>
        <span className="frag-mas">{abierto ? 'Cerrar' : 'Seguir leyendo'}</span>
      </button>
      <div className="frag-cuerpo"><p>{resto}</p></div>
    </div>
  )
}

function Bloque({ r, principal, nombre }: { r: Region; principal: boolean; nombre: string }) {
  const [emblema, mapa] = r.imagenes
  const parrafos = [...r.parrafos]
  // «Sidi Khan, capital de Maurizanian»: la última línea corta es el pie del plano
  const pie = mapa && parrafos.length > 1 && esSubtitulo(parrafos[parrafos.length - 1]) ? parrafos.pop() : undefined
  const [abiertos, setAbiertos] = useState<Set<number>>(() => new Set([0]))
  const plegables = parrafos.map((p, k) => (!esSubtitulo(p) && dividir(p)[1] ? k : -1)).filter((k) => k >= 0)
  const todos = plegables.length > 0 && plegables.every((k) => abiertos.has(k))
  // el primer fragmento aún cerrado es el «siguiente» que invitamos a leer
  const siguiente = plegables.find((k) => !abiertos.has(k))
  const alternar = (k: number) => setAbiertos((a) => { const n = new Set(a); if (n.has(k)) n.delete(k); else n.add(k); return n })
  return (
    <section className={principal ? 'mundo-bloque' : 'mundo-bloque familia'}>
      {!principal && (
        <div className="mundo-fam-cab">
          {emblema && <Medallon src={emblema} alt={`Emblema: ${limpio(r.titulo)}`} tam={120} />}
          <h2 className="mundo-subtit">{limpio(r.titulo)}</h2>
        </div>
      )}
      {plegables.length > 1 && (
        <button type="button" className="mundo-todo" onClick={() => setAbiertos(todos ? new Set() : new Set(plegables))}>
          {todos ? 'Cerrar todo' : 'Abrir todo'}
        </button>
      )}
      <div className="mundo-texto">
        {parrafos.map((p, k) => esSubtitulo(p)
          ? <h3 key={k} className="mundo-subtit">{p}</h3>
          : <Fragmento key={k} texto={p} abierto={abiertos.has(k)} siguiente={k === siguiente} alTocar={() => alternar(k)} />)}
      </div>
      {mapa && (
        <figure className="mundo-mapa">
          <a href={img(mapa)} target="_blank" rel="noreferrer" title="Abrir el plano a tamaño completo">
            <img src={img(mapa)} alt={pie ?? `Plano de ${nombre}`} loading="lazy" />
          </a>
          <figcaption>{pie ?? `Plano de ${nombre}`} · toca el plano para verlo a tamaño completo</figcaption>
        </figure>
      )}
    </section>
  )
}

export default function Mundo() {
  const [sp] = useSearchParams()
  const idx = SECCIONES.findIndex((s) => s.id === sp.get('reino'))
  const sec = idx >= 0 ? SECCIONES[idx] : undefined

  if (!sec) {
    return (
      <article className="mundo">
        <div className="mundo-portada">
          <header className="pcol">
            <h1>Terratea</h1>
            <p className="mundo-lema">Cuatro reinos alrededor de una ciudad que no pertenece a ninguno.</p>
            {mapas.intro.map((p, k) => <p key={k} className="mundo-intro">{p}</p>)}
            <Brujula />
          </header>
          <figure className="mundo-mapa">
          <div className="mapa-pines">
            <img src={img(mapas.imagenes_intro[1])} alt="Mapa de Terratea" loading="lazy" />
            {SECCIONES.map((r) => (
              <Link key={r.id} to={`?reino=${r.id}`} replace className="pin" style={{ ...vars(r), left: `${PINES[r.id][0]}%`, top: `${PINES[r.id][1]}%` }}>
                <span>{r.nombre}</span>
              </Link>
            ))}
          </div>
          <figcaption>Mapa de Terratea. Toca un reino sobre el mapa o en la brújula.</figcaption>
          <p className="nota">Texto del Libro 1.</p>
          </figure>
        </div>
      </article>
    )
  }

  const [primera, ...resto] = sec.indices
  const ant = SECCIONES[(idx + SECCIONES.length - 1) % SECCIONES.length]
  const sig = SECCIONES[(idx + 1) % SECCIONES.length]

  return (
    <article className="mundo reino" style={vars(sec)}>
      <div className="mundo-layout">
      <aside className="mundo-lateral">
      <div className="mundo-barra">
        <Link to="?" replace className="mundo-volver">← Mapa del mundo</Link>
        <Brujula actual={sec.id} />
      </div>

      <header className="mundo-cabecera">
        {regiones[primera].imagenes[0] && <Medallon src={regiones[primera].imagenes[0]} alt={`Emblema de ${sec.nombre}`} />}
        <div>
          <p className="mundo-rumbo">{sec.rumbo}</p>
          <h1>{sec.nombre}</h1>
        </div>
      </header>
      </aside>

      <div className="mundo-contenido">
      <Bloque r={regiones[primera]} principal nombre={sec.nombre} />
      {resto.map((i) => <Bloque key={i} r={regiones[i]} principal={false} nombre={sec.nombre} />)}

      <footer className="mundo-pie">
        <Link to={`?reino=${ant.id}`} replace style={vars(ant)}>← {ant.nombre}</Link>
        <Link to={`?reino=${sig.id}`} replace style={vars(sig)}>{sig.nombre} →</Link>
      </footer>
      </div>
      </div>
    </article>
  )
}
