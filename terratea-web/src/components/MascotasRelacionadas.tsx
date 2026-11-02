import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mascotasDeGremio, mascotasDePersonaje, type ResumenMascota } from '../lib/mascotas'
import { urlImagen } from '../lib/sync'

/** Mascotas y monturas de un personaje (dueño) o de un gremio. No pinta nada si no hay ninguna. */
export default function MascotasRelacionadas({ de, id }: { de: 'personaje' | 'gremio'; id: number }) {
  const [lista, setLista] = useState<ResumenMascota[]>([])

  useEffect(() => {
    const carga = de === 'personaje' ? mascotasDePersonaje(id) : mascotasDeGremio(id)
    carga.then(setLista).catch(() => setLista([]))
  }, [de, id])

  if (!lista.length) return null
  return (
    <div className="bloque no-print no-imprimir">
      <h3>Mascotas y monturas</h3>
      <div className="tarjetas">
        {lista.map((m) => (
          <div key={m.id} className="tarjeta">
            <Link to={`/mis-mascotas/${m.id}`} className="enlace-tarjeta">
              {m.image && <img src={urlImagen(m.image)} alt={m.name} loading="lazy" />}
              <h2>{m.name}</h2>
              <small>{m.species || 'Sin raza'} · {m.role} · Nivel {m.level}</small>
              {de === 'gremio' && <small>Dueño: {m.owner_name ?? '—'}</small>}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
