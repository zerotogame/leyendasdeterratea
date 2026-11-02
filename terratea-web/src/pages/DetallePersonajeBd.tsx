import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import FichaBd from '../components/FichaBd'
import MascotasRelacionadas from '../components/MascotasRelacionadas'
import FichaConOficial from '../components/FichaConOficial'
import { clases } from '../lib/datos'
import { hojaDeBd } from '../lib/hoja'
import { cargarDeBd, type PersonajeBd } from '../lib/sync'

export default function DetallePersonajeBd() {
  const { id } = useParams()
  const [p, setP] = useState<PersonajeBd | null>(null)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    cargarDeBd(Number(id)).then(setP).catch((e: Error) => setError(e.message))
  }, [id, intento])
  return (
    <>
      <div className="filtros no-print">
        <Link to="/personajes" className="volver">← Mis personajes</Link>
        {p && <Link to={`/personajes/bd/${p.id}/editar`} className="boton">Editar ficha</Link>}
        {p && <button onClick={() => window.print()}>Imprimir</button>}
      </div>
      {p && <MascotasRelacionadas de="personaje" id={p.id} />}
      {error ? (
        <>
          <p>{error}</p>
          <button onClick={() => { setError(''); setIntento((n) => n + 1) }}>Reintentar</button>
        </>
      ) : p ? <FichaConOficial datos={hojaDeBd(p, clases.find((c) => c.nombre.toLowerCase() === p.class.trim().toLowerCase()))}><FichaBd p={p} /></FichaConOficial> : <p>Cargando…</p>}
    </>
  )
}
