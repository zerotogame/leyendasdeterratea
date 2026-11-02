import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CuadroTorneo from '../components/CuadroTorneo'
import { useConfirmar } from '../components/Confirmar'
import { cargarGremio, listarGremios, type ResumenGremio } from '../lib/gremios'
import type { ResumenBd } from '../lib/sync'
import {
  alternarJugador, campeon, cargarTorneo, conCuadro, FORMATOS, guardarTorneo, hayResultados, nuevoEquipo,
  quitarEquipo, sinResultados, type Torneo,
} from '../lib/torneos'

export default function DetalleTorneo() {
  const { id = '' } = useParams()
  const [torneo, setTorneo] = useState<Torneo | null>(() => cargarTorneo(id))
  const [gremios, setGremios] = useState<ResumenGremio[]>([])
  const [miembros, setMiembros] = useState<Record<number, ResumenBd[]>>({})
  const [error, setError] = useState('')
  const [elegido, setElegido] = useState('')
  const [editar, setEditar] = useState(false)
  const confirmar = useConfirmar()

  useEffect(() => { listarGremios().then(setGremios).catch((e: Error) => setError(e.message)) }, [])

  // Los miembros de cada gremio inscrito se cargan una vez para poder elegir sus personajes.
  const gremiosInscritos = torneo?.equipos.map((e) => e.gremioId).filter((g): g is number => g != null).join(',') ?? ''
  useEffect(() => {
    for (const gid of gremiosInscritos.split(',').filter(Boolean).map(Number)) {
      if (miembros[gid]) continue
      cargarGremio(gid)
        .then((g) => setMiembros((m) => ({ ...m, [gid]: g.members })))
        .catch((e: Error) => setError(e.message))
    }
  }, [gremiosInscritos, miembros])

  if (!torneo) return <><h1>Torneo</h1><p>No existe este torneo. <Link to="/torneos">Volver a la lista</Link></p></>
  const f = FORMATOS[torneo.formato]

  const cambiar = (t: Torneo) => { guardarTorneo(t); setTorneo(t) }

  const añadir = () => {
    const g = gremios.find((x) => String(x.id) === elegido)
    if (!g) return
    // Añadir un gremio invalida el cuadro (cambia el nº de equipos).
    cambiar(conCuadro({ ...torneo, equipos: [...torneo.equipos, nuevoEquipo(g.name, g.id)] }))
    setElegido('')
  }

  const regenerar = async (mezclar: boolean) => {
    if (hayResultados(torneo) && !(await confirmar('Se perderán los resultados ya marcados. ¿Generar el cuadro de nuevo?', { aceptar: 'Generar', peligro: true }))) return
    cambiar(conCuadro(torneo, mezclar))
  }

  const quitar = async (eid: string, nombre: string) => {
    if (torneo.nodos.length && !(await confirmar(`Quitar a ${nombre} regenera el cuadro y borra los resultados. ¿Continuar?`, { aceptar: 'Quitar', peligro: true }))) return
    cambiar(quitarEquipo(torneo, eid))
  }

  const libres = gremios.filter((g) => !torneo.equipos.some((e) => e.gremioId === g.id))
  const ganador = torneo.equipos.find((e) => e.id === campeon(torneo))
  const incompletos = f.porEquipo != null ? torneo.equipos.filter((e) => e.jugadores.length < f.porEquipo!) : []

  return (
    <>
      <p><Link to="/torneos">← Torneos</Link></p>
      <h1>{torneo.nombre}</h1>
      <p className="nota">{f.titulo}{f.porEquipo ? ` · ${f.porEquipo} personaje${f.porEquipo === 1 ? '' : 's'} por gremio` : ' · el gremio entero'}</p>
      {error && <p className="nota" role="alert">{error}</p>}
      {ganador && <p className="campeon">🏆 Campeón: <strong>{ganador.nombre}</strong></p>}

      <div className="bloque">
        <h3>Gremios participantes ({torneo.equipos.length})</h3>
        <div className="filtros">
          <select value={elegido} onChange={(e) => setElegido(e.target.value)} aria-label="Gremio a inscribir">
            <option value="">— Elige un gremio —</option>
            {libres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button className="primario" disabled={!elegido} onClick={añadir}>+ Inscribir gremio</button>
          <Link to="/mis-gremios/nuevo" className="boton">Crear gremio</Link>
        </div>
        {gremios.length === 0 && <p className="nota">No hay gremios de jugadores. Créalos en «Mis gremios» (hace falta el servidor encendido).</p>}

        {torneo.equipos.map((e) => {
          const lista = e.gremioId != null ? miembros[e.gremioId] : undefined
          return (
            <div key={e.id} className="equipo">
              <div className="filtros">
                <strong>{e.nombre}</strong>
                {f.porEquipo != null && <small>{e.jugadores.length}/{f.porEquipo} personaje{f.porEquipo === 1 ? '' : 's'}</small>}
                <button className="peligro" onClick={() => quitar(e.id, e.nombre)}>Quitar</button>
              </div>
              {e.gremioId == null ? null : lista == null ? <small>Cargando personajes…</small> : lista.length === 0 ? (
                <small>Este gremio no tiene personajes. Añádelos en su ficha.</small>
              ) : (
                <div className="filtros">
                  {lista.map((p) => {
                    const dentro = e.jugadores.some((j) => j.id === p.id)
                    const lleno = !dentro && f.porEquipo != null && f.porEquipo > 1 && e.jugadores.length >= f.porEquipo
                    return (
                      <button key={p.id} className={dentro ? 'activo' : ''} disabled={lleno} aria-pressed={dentro}
                        onClick={() => cambiar({ ...torneo, equipos: torneo.equipos.map((x) => x.id === e.id ? alternarJugador(x, { id: p.id, nombre: p.name }, torneo.formato) : x) })}>
                        {p.name} <small>Nv {p.level} {p.class}</small>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {incompletos.length > 0 && (
          <p className="nota">Faltan personajes en: {incompletos.map((e) => e.nombre).join(', ')}.</p>
        )}
      </div>

      <div className="bloque">
        <h3>Cuadro</h3>
        {torneo.equipos.length < 2 ? <p>Inscribe al menos 2 gremios para generar el cuadro.</p> : (
          <>
            <div className="filtros">
              <button className="primario" onClick={() => regenerar(true)}>{torneo.nodos.length ? 'Sorteo nuevo' : 'Sortear y generar cuadro'}</button>
              {torneo.nodos.length > 0 && (
                <>
                  <button onClick={() => regenerar(false)}>Ordenar por inscripción</button>
                  <button className={editar ? 'activo' : ''} aria-pressed={editar} onClick={() => setEditar(!editar)}>Editar emparejamientos</button>
                  <button disabled={!hayResultados(torneo)} onClick={() => cambiar(sinResultados(torneo))}>Borrar resultados</button>
                </>
              )}
            </div>
            {torneo.nodos.length > 0 && (
              <>
                <p className="nota">
                  {editar ? 'Elige el gremio de cada hueco; si ya estaba en otro, se intercambian.'
                    : 'Pulsa un gremio para marcarlo como ganador y que avance (púlsalo otra vez para quitarlo). Las ramas de la clasificatoria se juntan en una sola entrada.'}
                </p>
                <CuadroTorneo torneo={torneo} onCambio={cambiar} editar={editar} />
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
