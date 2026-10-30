import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { borrarPersonaje, listarPersonajes } from '../lib/personajes'
import { clasePorId, razaPorId, razas, img, imgRaza } from '../lib/datos'
import { borrarDeBd, listarDeBd, urlImagen, type ResumenBd } from '../lib/sync'

export default function ListaPersonajes() {
  const [locales, setLocales] = useState(listarPersonajes)
  const [bd, setBd] = useState<ResumenBd[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listarDeBd().then(setBd).catch((e: Error) => { setBd([]); setError(e.message) })
  }, [])

  // Los guardados en la BD son la fuente de verdad; aquí solo quedan los que aún no se han podido subir.
  const pendientes = locales.filter((p) => p.bdId == null)
  const total = (bd?.length ?? 0) + pendientes.length

  const eliminarBd = async (c: ResumenBd) => {
    if (!confirm(`¿Eliminar a ${c.name}? Se borra de la base de datos y no se puede deshacer.`)) return
    try {
      await borrarDeBd(c.id)
      setBd((l) => l?.filter((x) => x.id !== c.id) ?? null)
      for (const p of locales.filter((p) => p.bdId === c.id)) borrarPersonaje(p.id)
      setLocales(listarPersonajes())
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <h1>Mis personajes</h1>
      {error && <p className="nota">{error}</p>}
      {bd == null ? (
        <p>Cargando personajes…</p>
      ) : total === 0 ? (
        <p>Todavía no has guardado ningún personaje. <Link to="/creador">Crear uno</Link></p>
      ) : (
        <div className="tarjetas">
          {bd.map((c) => {
            const raza = razas.find((r) => r.nombre === c.race)
            return (
              <div key={`bd-${c.id}`} className="tarjeta">
                <Link to={`/personajes/bd/${c.id}`} className="enlace-tarjeta">
                  {c.image
                    ? <img src={urlImagen(c.image)} alt={c.name} loading="lazy" />
                    : raza && <img src={img(imgRaza(raza))} alt={c.name} loading="lazy" />}
                  <h2>{c.name || 'Sin nombre'}</h2>
                  <small>{c.race} · {c.class} · Nivel {c.level}</small>
                </Link>
                <button className="peligro" onClick={() => eliminarBd(c)}>Eliminar</button>
              </div>
            )
          })}
          {pendientes.map((p) => {
            const raza = razaPorId(p.razaId)
            const clase = clasePorId(p.claseId)
            const sub = raza?.subrazas?.find((s) => s.id === p.subrazaId)
            if (!raza || !clase) return null
            return (
              <div key={p.id} className="tarjeta">
                <Link to={`/personajes/${p.id}`} className="enlace-tarjeta">
                  <img src={img((sub?.imagenes ?? raza.imagenes).ilustraciones[0] ?? '')} alt={p.nombre} loading="lazy" />
                  <h2>{p.nombre || 'Sin nombre'}</h2>
                  <small>{raza.nombre}{sub && ` · ${sub.nombre}`} · {clase.nombre} · sin subir a la BD</small>
                </Link>
                <button
                  className="peligro"
                  onClick={() => {
                    if (confirm(`¿Eliminar a ${p.nombre || 'este personaje'}? No se puede deshacer.`)) {
                      borrarPersonaje(p.id)
                      setLocales(listarPersonajes())
                    }
                  }}
                >Eliminar</button>
              </div>
            )
          })}
        </div>
      )}
      <p><Link to="/creador">+ Crear otro personaje</Link></p>
    </>
  )
}
