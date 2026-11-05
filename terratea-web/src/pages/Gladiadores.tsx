import { useEffect, useState } from 'react'
import {
  borrarEdicion, guardarEdicion, juegos, listarEdiciones, lugar, promotor, PUESTOS, PUNTOS, ranking, romano,
  type Edicion, type Puesto, type Resultado,
} from '../lib/gladiadores'
import { useConfirmar } from '../components/Confirmar'
import ListaTorneos from './ListaTorneos'

const SECCIONES = ['Coliseo', 'Los Juegos', 'Memorándum', 'Rankings', 'Ediciones', 'Torneos'] as const
type Seccion = (typeof SECCIONES)[number]

function Tabla({ ediciones, por, juego }: { ediciones: Edicion[]; por: 'gladiador' | 'gremio'; juego?: string }) {
  const [busca, setBusca] = useState('')
  const [orden, setOrden] = useState<'desc' | 'asc' | 'nombre'>('desc')
  const filas = ranking(ediciones, por, juego)
  if (filas.length === 0) return <p className="nota">Aún no hay resultados registrados.</p>
  const q = busca.trim().toLowerCase()
  // El puesto (#) es el del ranking completo, aunque se filtre o se reordene.
  const visibles = filas
    .map((f, i) => ({ f, puesto: i + 1 }))
    .filter(({ f }) => f.nombre.toLowerCase().includes(q))
  if (orden === 'asc') visibles.sort((a, b) => a.f.puntos - b.f.puntos || a.f.nombre.localeCompare(b.f.nombre, 'es'))
  if (orden === 'nombre') visibles.sort((a, b) => a.f.nombre.localeCompare(b.f.nombre, 'es'))
  return (
    <>
      <div className="filtros">
        <input type="search" placeholder={`Buscar ${por}…`} aria-label={`Buscar ${por}`} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)} aria-label="Ordenar por">
          <option value="desc">Puntuación: mayor a menor</option>
          <option value="asc">Puntuación: menor a mayor</option>
          <option value="nombre">Nombre (A-Z)</option>
        </select>
      </div>
      {visibles.length === 0 ? <p className="nota">Ningún resultado para «{busca}».</p> : (
        <table>
          <thead><tr><th>#</th><th>{por === 'gladiador' ? 'Gladiador' : 'Gremio'}</th><th>Puntos</th><th>🥇</th><th>🥈</th><th>🥉</th><th>Part.</th></tr></thead>
          <tbody>
            {visibles.map(({ f, puesto }) => (
              <tr key={f.nombre}><td>{puesto}</td><td>{f.nombre}</td><td>{f.puntos}</td><td>{f.oro}</td><td>{f.plata}</td><td>{f.bronce}</td><td>{f.participaciones}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

const vacia = (numero: number): Edicion => ({ numero, anio: null, estado: 'celebrada', resultados: [], cronica: '' })

function EditorEdiciones({ ediciones, alGuardar }: { ediciones: Edicion[]; alGuardar: () => void }) {
  const [sel, setSel] = useState<Edicion | null>(null)
  const [aviso, setAviso] = useState('')
  const confirmar = useConfirmar()
  const siguiente = Math.max(0, ...ediciones.map((e) => e.numero)) + 1

  const cambiarRes = (i: number, c: Partial<Resultado>) =>
    setSel((e) => e && { ...e, resultados: e.resultados.map((r, j) => (j === i ? { ...r, ...c } : r)) })

  const guardar = async () => {
    if (!sel) return
    try { setSel(await guardarEdicion(sel)); setAviso('Guardado.'); alGuardar() } catch (e) { setAviso((e as Error).message) }
  }
  const borrar = async () => {
    if (!sel || !(await confirmar(`¿Borrar la ${romano(sel.numero)} Edición y sus resultados?`, { aceptar: 'Borrar', peligro: true }))) return
    try { await borrarEdicion(sel.numero); setSel(null); alGuardar() } catch (e) { setAviso((e as Error).message) }
  }

  return (
    <div className="bloque">
      <h2>Ediciones</h2>
      <div className="filtros">
        {ediciones.map((e) => (
          <button key={e.numero} className={sel?.numero === e.numero ? 'activo' : ''} onClick={() => { setSel(e); setAviso('') }}>{romano(e.numero)} Edición</button>
        ))}
        <button className="primario" onClick={() => { setSel(vacia(siguiente)); setAviso('') }}>+ Nueva edición ({romano(siguiente)})</button>
      </div>
      {sel && (
        <>
          <h3>{romano(sel.numero)} Edición</h3>
          <div className="filtros">
            <input type="number" placeholder="Año" aria-label="Año" value={sel.anio ?? ''} onChange={(e) => setSel({ ...sel, anio: e.target.value ? Number(e.target.value) : null })} />
            <select aria-label="Estado" value={sel.estado} onChange={(e) => setSel({ ...sel, estado: e.target.value })}>
              <option value="celebrada">Celebrada</option>
              <option value="proxima">Próxima</option>
            </select>
            <input placeholder="Fecha (p. ej. Diciembre)" aria-label="Fecha" value={sel.fecha ?? ''} onChange={(e) => setSel({ ...sel, fecha: e.target.value })} />
          </div>
          <textarea rows={4} placeholder="Crónica de la edición" aria-label="Crónica" value={sel.cronica} onChange={(e) => setSel({ ...sel, cronica: e.target.value })} />
          <h3>Podios</h3>
          {sel.resultados.map((r, i) => (
            <div key={i} className="filtros">
              <select aria-label="Juego" value={r.juego} onChange={(e) => cambiarRes(i, { juego: e.target.value })}>
                {juegos.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
              </select>
              <select aria-label="Puesto" value={r.puesto} onChange={(e) => cambiarRes(i, { puesto: e.target.value as Puesto })}>
                {(Object.keys(PUESTOS) as Puesto[]).map((p) => <option key={p} value={p}>{PUESTOS[p]}</option>)}
              </select>
              <input placeholder="Gladiador" aria-label="Gladiador" value={r.gladiador} onChange={(e) => cambiarRes(i, { gladiador: e.target.value })} />
              <input placeholder="Gremio" aria-label="Gremio" value={r.gremio ?? ''} onChange={(e) => cambiarRes(i, { gremio: e.target.value })} />
              <button className="peligro" onClick={() => setSel({ ...sel, resultados: sel.resultados.filter((_, j) => j !== i) })}>Quitar</button>
            </div>
          ))}
          <div className="filtros">
            <button onClick={() => setSel({ ...sel, resultados: [...sel.resultados, { juego: juegos[0].id, puesto: 'oro', gladiador: '', gremio: '' }] })}>+ Añadir resultado</button>
            <button className="primario" onClick={guardar}>Guardar edición</button>
            {ediciones.some((e) => e.numero === sel.numero) && <button className="peligro" onClick={borrar}>Borrar edición</button>}
          </div>
          {aviso && <p className="nota" role="status">{aviso}</p>}
        </>
      )}
    </div>
  )
}

export default function Gladiadores() {
  const [sec, setSec] = useState<Seccion>('Coliseo')
  const [juego, setJuego] = useState('')
  const [ediciones, setEdiciones] = useState<Edicion[]>([])
  const [error, setError] = useState('')
  const recargar = () => listarEdiciones().then((e) => { setEdiciones(e); setError('') }).catch((e: Error) => setError(e.message))
  useEffect(() => { recargar() }, [])
  const proxima = ediciones.find((e) => e.estado === 'proxima')

  return (
    <>
      <h1>🏟️ Juego de Gladiadores</h1>
      <p className="nota">Archivo histórico y clasificación de los Juegos del {lugar}. Promotor: {promotor}.</p>
      <div className="filtros" role="tablist">
        {SECCIONES.map((s) => (
          <button key={s} role="tab" aria-selected={sec === s} className={sec === s ? 'activo' : ''} onClick={() => setSec(s)}>{s}</button>
        ))}
      </div>

      {error && <p className="nota" role="alert">{error}</p>}

      {sec === 'Coliseo' && (
        <div className="bloque">
          <h2>El Coliseo</h2>
          <p><strong>Promotor:</strong> {promotor}<br /><strong>Lugar:</strong> {lugar}</p>
          {proxima && <p className="campeon">Próxima edición: <strong>{romano(proxima.numero)} Edición</strong>{proxima.fecha ? ` — ${proxima.fecha}` : ''}</p>}
          <p className="nota">Introducción a los Juegos: ¿? (pendiente de texto oficial).</p>
        </div>
      )}

      {sec === 'Los Juegos' && (
        <div className="tarjetas">
          {juegos.map((j) => (
            <div key={j.id} className="tarjeta">
              <h2>{j.nombre}</h2>
              <small>Modalidad: {j.modalidad}</small>
              {j.nuevo && <small>NUEVO — {romano(j.desde ?? 3)} EDICIÓN</small>}
              <small>Descripción, objetivo y reglas: ¿?</small>
            </div>
          ))}
        </div>
      )}

      {sec === 'Memorándum' && (
        <div className="bloque">
          <h2>Memorándum · Línea histórica</h2>
          <ol>
            {ediciones.map((e) => (
              <li key={e.numero}>
                <strong>{romano(e.numero)} Edición</strong>{e.anio ? ` — ${e.anio}` : ''}{e.estado === 'proxima' ? ` (próxima${e.fecha ? `, ${e.fecha}` : ''})` : ''}
                {e.resultados.length === 0 ? <small> · sin resultados registrados</small> : (
                  <ul>
                    {e.resultados.map((r, i) => {
                      const nombre = juegos.find((j) => j.id === r.juego)?.nombre ?? r.juego
                      return <li key={i}>{nombre}: {PUESTOS[r.puesto]} — {r.gladiador}{r.gremio ? ` (${r.gremio})` : ''}</li>
                    })}
                  </ul>
                )}
                {e.cronica && <p>{e.cronica}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {sec === 'Rankings' && (
        <div className="bloque">
          <p className="nota">Puntos: 🥇 {PUNTOS.oro} · 🥈 {PUNTOS.plata} · 🥉 {PUNTOS.bronce}. Se acumulan entre ediciones.</p>
          <select value={juego} onChange={(e) => setJuego(e.target.value)} aria-label="Modalidad">
            <option value="">Todos</option>
            {juegos.map((j) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
          </select>
          <h3>Ranking de gladiadores</h3>
          <Tabla ediciones={ediciones} por="gladiador" juego={juego || undefined} />
          <h3>Ranking de gremios</h3>
          <Tabla ediciones={ediciones} por="gremio" juego={juego || undefined} />
        </div>
      )}

      {sec === 'Ediciones' && <EditorEdiciones ediciones={ediciones} alGuardar={recargar} />}

      {sec === 'Torneos' && <ListaTorneos />}
    </>
  )
}
