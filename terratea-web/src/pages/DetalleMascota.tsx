import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HojaMascota from '../components/HojaMascota'
import { CATEGORIAS, cargarMascota, type MascotaBd } from '../lib/mascotas'

export default function DetalleMascota() {
  const id = Number(useParams().id)
  const [m, setM] = useState<MascotaBd | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { cargarMascota(id).then(setM).catch((e: Error) => setError(e.message)) }, [id])

  if (!m) return error ? <><p>{error}</p><Link to="/mis-mascotas" className="volver">← Mis mascotas</Link></> : <p>Cargando…</p>

  return (
    <>
      {/* Al imprimir solo sale la plantilla (más abajo): todo lo marcado «no-imprimir» se oculta. */}
      <div className="no-imprimir">
        <Link to="/mis-mascotas" className="volver">← Mis mascotas</Link>
        <h1>{m.name}</h1>
        <p className="filtros">
          <Link to={`/mis-mascotas/${id}/editar`} className="boton primario">Editar mascota</Link>
          <a href="#plantilla" className="boton">Ir a la plantilla</a>
          <button onClick={() => window.print()}>Exportar PDF / Imprimir</button>
        </p>
        <div className="bloque">
          <p>
            <strong>{m.role}</strong> · {m.species || 'Sin raza'} · Nivel {m.level} · {CATEGORIAS.find((c) => c.id === m.category)?.etiqueta}
          </p>
          <p>
            <strong>Dueño:</strong> {m.owner_id ? <Link to={`/personajes/bd/${m.owner_id}`}>{m.owner_name}</Link> : '—'}
            {' · '}<strong>Gremio:</strong> {m.guild_id ? <Link to={`/mis-gremios/${m.guild_id}`}>{m.guild_name}</Link> : '—'}
          </p>
        </div>
        <h2 id="plantilla">Plantilla de la mascota</h2>
        <p className="nota">Esto es lo que se imprime. En el diálogo elige «Guardar como PDF», papel A4 apaisado y activa «Gráficos de fondo».</p>
      </div>
      <HojaMascota m={m} />
    </>
  )
}
