import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import { borrarMascota, CATEGORIAS, listarMascotas, type ResumenMascota } from '../lib/mascotas'
import { urlImagen } from '../lib/sync'

export default function ListaMascotas() {
  const [lista, setLista] = useState<ResumenMascota[] | null>(null)
  const [error, setError] = useState('')
  const confirmar = useConfirmar()

  useEffect(() => {
    listarMascotas().then(setLista).catch((e: Error) => { setLista([]); setError(e.message) })
  }, [])

  const eliminar = async (m: ResumenMascota) => {
    if (!(await confirmar(`¿Eliminar la ficha de ${m.name}? No se puede deshacer (el dueño no se borra).`, { aceptar: 'Eliminar', peligro: true }))) return
    try {
      await borrarMascota(m.id)
      setLista((l) => l?.filter((x) => x.id !== m.id) ?? null)
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <h1>Mis mascotas y monturas</h1>
      <p className="nota">Fichas de las mascotas y monturas de tus jugadores, con su dueño y su gremio.</p>
      {error && <p className="nota" role="alert">{error}</p>}
      {lista == null ? <p>Cargando mascotas…</p> : lista.length === 0 ? (
        <p>Todavía no has creado ninguna mascota.</p>
      ) : (
        <div className="tarjetas">
          {lista.map((m) => (
            <div key={m.id} className="tarjeta">
              <Link to={`/mis-mascotas/${m.id}`} className="enlace-tarjeta">
                {m.image && <img src={urlImagen(m.image)} alt={m.name} loading="lazy" />}
                <h2>{m.name}</h2>
                <small>{m.species || 'Sin raza'} · {m.role} · Nivel {m.level}</small>
                <small>{CATEGORIAS.find((c) => c.id === m.category)?.etiqueta}</small>
                <small>Dueño: {m.owner_name ?? '—'}{m.guild_name && ` · Gremio: ${m.guild_name}`}</small>
              </Link>
              <button className="peligro" onClick={() => eliminar(m)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
      <p><Link to="/mis-mascotas/nuevo" className="boton primario">+ Crear mascota</Link></p>
    </>
  )
}
