import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import { borrarGremio, listarGremios, MAX_ESTRELLAS, type ResumenGremio } from '../lib/gremios'

export default function ListaGremios() {
  const [lista, setLista] = useState<ResumenGremio[] | null>(null)
  const [error, setError] = useState('')
  const confirmar = useConfirmar()

  useEffect(() => {
    listarGremios().then(setLista).catch((e: Error) => { setLista([]); setError(e.message) })
  }, [])

  const eliminar = async (g: ResumenGremio) => {
    if (!(await confirmar(`¿Eliminar el gremio ${g.name}? No se puede deshacer (los personajes no se borran).`, { aceptar: 'Eliminar', peligro: true }))) return
    try {
      await borrarGremio(g.id)
      setLista((l) => l?.filter((x) => x.id !== g.id) ?? null)
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <h1>Gremios de jugadores</h1>
      <p className="nota">Alta, edición y baja de gremios. Los gremios del Libro 2 están en «El mundo → Gremios».</p>
      {error && <p className="nota" role="alert">{error}</p>}
      {lista == null ? <p>Cargando gremios…</p> : lista.length === 0 ? (
        <p>Todavía no has creado ningún gremio.</p>
      ) : (
        <div className="tarjetas">
          {lista.map((g) => (
            <div key={g.id} className="tarjeta">
              <Link to={`/mis-gremios/${g.id}`} className="enlace-tarjeta">
                <h2>{g.name}</h2>
                <small>{g.location || 'Sin localización'} · {g.members} miembro{g.members === 1 ? '' : 's'}</small>
                <small>Reputación {g.reputation}% · {'★'.repeat(g.stars)}{'☆'.repeat(MAX_ESTRELLAS - g.stars)}</small>
              </Link>
              <button className="peligro" onClick={() => eliminar(g)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
      <p><Link to="/mis-gremios/nuevo" className="boton primario">+ Crear gremio</Link></p>
    </>
  )
}
