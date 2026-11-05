import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import Estandartes from '../components/Estandartes'
import { borrarGremio, listarGremios, MAX_ESTRELLAS, type ResumenGremio } from '../lib/gremios'

type Orden = 'nivel' | 'reputacion' | 'miembros' | 'nombre'

export default function ListaGremios() {
  const [lista, setLista] = useState<ResumenGremio[] | null>(null)
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [orden, setOrden] = useState<Orden>('nivel')
  const confirmar = useConfirmar()

  const [minimo, setMinimo] = useState(0)
  const [vista, setVista] = useState<number | null>(null)
  const navegar = useNavigate()

  const q = busca.trim().toLowerCase()
  const visibles = (lista ?? [])
    .filter((g) => g.stars >= minimo && `${g.name} ${g.location ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const dif: Record<Orden, number> = { nivel: b.stars - a.stars, reputacion: b.reputation - a.reputation, miembros: b.members - a.members, nombre: 0 }
      return dif[orden] || a.name.localeCompare(b.name, 'es')
    })

  useEffect(() => {
    listarGremios().then(setLista).catch((e: Error) => { setLista([]); setError(e.message) })
  }, [])

  const alAzar = () => {
    const g = (lista ?? [])[Math.floor(Math.random() * (lista?.length ?? 0))]
    if (g) navegar(`/mis-gremios/${g.id}`)
  }

  const eliminar = async (g: ResumenGremio) => {
    if (!(await confirmar(`¿Eliminar el gremio ${g.name}? No se puede deshacer (los personajes no se borran).`, { aceptar: 'Eliminar', peligro: true }))) return
    try {
      await borrarGremio(g.id)
      setLista((l) => l?.filter((x) => x.id !== g.id) ?? null)
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <header className="gremios-portada">
        <h1>Gremios de jugadores</h1>
        <p className="gremios-lema">Quien no tiene bandera, no tiene casa.</p>
        <p className="nota">Alta, edición y baja de gremios. Los gremios del Libro 2 están en «El mundo → Gremios».</p>
      </header>
      {error && <p className="nota" role="alert">{error}</p>}
      {lista == null ? <p>Cargando gremios…</p> : lista.length === 0 ? (
        <p>Todavía no has creado ningún gremio.</p>
      ) : (
        <>
        <div className="filtros">
          <input type="search" placeholder="Buscar gremio…" aria-label="Buscar gremio" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} aria-label="Ordenar por">
            <option value="nivel">Nivel (estrellas): mayor a menor</option>
            <option value="reputacion">Reputación: mayor a menor</option>
            <option value="miembros">Miembros: mayor a menor</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
          <button onClick={alAzar}>🎲 Gremio al azar</button>
        </div>
        <div className="filtro-estrellas" onMouseLeave={() => setVista(null)}>
          <span>Nivel mínimo</span>
          <span className="selector" role="group" aria-label="Nivel mínimo en estrellas">
            {Array.from({ length: MAX_ESTRELLAS }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={n <= (vista ?? minimo) ? 'on' : ''}
                aria-pressed={minimo === n}
                aria-label={`${n} estrella${n === 1 ? '' : 's'} o más`}
                onMouseEnter={() => setVista(n)}
                onFocus={() => setVista(n)}
                onBlur={() => setVista(null)}
                onClick={() => setMinimo(minimo === n ? 0 : n)}
              >★</button>
            ))}
          </span>
          <span className="contador">
            {minimo ? <>{minimo} o más · <button className="enlace" onClick={() => setMinimo(0)}>quitar</button></> : 'Todos los niveles'}
          </span>
        </div>
        {visibles.length === 0 && <p className="nota">Ningún gremio coincide con los filtros.</p>}
        <Estandartes key={`${orden}${q}${minimo}`} gremios={visibles} podio={orden === 'nivel' && !q && !minimo} eliminar={eliminar} />
        </>
      )}
      <p><Link to="/mis-gremios/nuevo" className="boton primario">+ Crear gremio</Link></p>
    </>
  )
}
