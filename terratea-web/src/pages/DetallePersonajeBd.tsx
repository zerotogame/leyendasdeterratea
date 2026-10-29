import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import FichaBd from '../components/FichaBd'
import { cargarDeBd, type PersonajeBd } from '../lib/sync'

export default function DetallePersonajeBd() {
  const { id } = useParams()
  const [p, setP] = useState<PersonajeBd | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    cargarDeBd(Number(id)).then(setP).catch((e: Error) => setError(e.message))
  }, [id])
  return (
    <>
      <div className="filtros no-print">
        <Link to="/personajes" className="volver">← Mis personajes</Link>
        {p && <Link to={`/personajes/bd/${p.id}/editar`} className="boton">Editar ficha</Link>}
        {p && <button onClick={() => window.print()}>Imprimir</button>}
      </div>
      {error ? <p>{error}</p> : p ? <FichaBd p={p} /> : <p>Cargando…</p>}
    </>
  )
}
