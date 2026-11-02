import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gremiosData, img2 } from '../lib/mundo'
import { RazaEnlace } from '../components/Raza'
import { listarGremios, MAX_ESTRELLAS, type ResumenGremio } from '../lib/gremios'
import { nivelDeGremio, rankingGremios } from '../lib/nivelesGremio'

/** Enlace solo si hay destino (sin sesión no se enlaza); si no, texto plano. */
function EnlaceSi({ to, className, children }: Readonly<{ to: string | false; className?: string; children: ReactNode }>) {
  return to ? <Link to={to} className={className}>{children}</Link> : <>{children}</>
}

export default function Gremios() {
  const [propios, setPropios] = useState<ResumenGremio[]>([])
  const logueado = true // sin login todavía (ver rama roles-login)

  // Si el servidor no responde, simplemente no salen los gremios de jugadores.
  useEffect(() => { listarGremios().then(setPropios).catch(() => setPropios([])) }, [])

  return (
    <>
      <h1>Gremios</h1>
      <h2>Gremios de jugadores</h2>
      <div className="tarjetas">
        {propios.map((g) => (
          <div key={g.id} className="tarjeta">
            <EnlaceSi to={logueado && `/mis-gremios/${g.id}`} className="enlace-tarjeta">
              <h2>{g.name}</h2>
              <small>{g.location || 'Sin localización'} · {g.members} miembro{g.members === 1 ? '' : 's'}</small>
              <small>Reputación {g.reputation}% · {'★'.repeat(g.stars)}{'☆'.repeat(MAX_ESTRELLAS - g.stars)}</small>
            </EnlaceSi>
          </div>
        ))}
      </div>

      <h2 id="ranking">Ranking de Gremios</h2>
      {propios.length === 0 ? (
        <p className="nota">Aún no hay gremios de jugadores que clasificar.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead><tr><th>Puesto</th><th>Gremio</th><th>Nivel</th><th>Reputación</th><th>Miembros</th></tr></thead>
            <tbody>
              {rankingGremios(propios).map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.puesto}</strong></td>
                  <td><EnlaceSi to={logueado && `/mis-gremios/${g.id}`}>{g.name}</EnlaceSi></td>
                  <td><EnlaceSi to={logueado && `/gremios/niveles?nivel=${g.stars}`}>{g.stars} · {nivelDeGremio(g.stars).nombre}</EnlaceSi></td>
                  <td>{g.reputation}%</td>
                  <td>{g.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="nota">
        Se ordena por nivel (estrellas) y, a igualdad, por reputación. {logueado && <Link to="/gremios/niveles">Ver los niveles, sus ventajas y los criterios del ranking</Link>}
      </p>

      <h2>Gremios del Libro 2</h2>
      <p>{gremiosData.introduccion}</p>
      {gremiosData.gremios.map((g) => (
        <article key={g.id} className="gremio bloque">
          {g.emblema && <img className="emblema" src={img2(g.emblema)} alt={`Emblema de ${g.nombre}`} loading="lazy" />}
          <div>
            <h2>{g.nombre}</h2>
            <p>{g.descripcion}</p>
            <table className="tabla">
              <thead><tr><th>Cargo</th><th>Nombre</th><th>Raza</th></tr></thead>
              <tbody>
                {g.miembros.map((m, i) => (
                  <tr key={i}>
                    <td>{m.cargo}</td>
                    <td><strong>{m.nombre}</strong><br /><small className="nota">{m.descripcion}</small></td>
                    <td><RazaEnlace texto={m.raza} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="nota">Libro 2, p. {g.pagina}</p>
          </div>
        </article>
      ))}
    </>
  )
}
