import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { introNiveles, nivelesGremio, rankingLibro } from '../lib/nivelesGremio'

export default function NivelesGremio() {
  const [params] = useSearchParams()
  const actual = params.get('nivel')

  // Con rutas «#» no valen los anclas: se desplaza a mano al nivel resaltado.
  useEffect(() => {
    if (actual != null) document.getElementById(`nivel-${actual}`)?.scrollIntoView({ block: 'center' })
  }, [actual])

  return (
    <>
      <Link to="/gremios" className="volver">← Gremios</Link>
      <h1>Niveles de gremio</h1>
      <p>{introNiveles}</p>
      <p className="nota">Libro 1, capítulo Gremio. El nivel de un gremio es su número de estrellas (0-10).</p>

      {nivelesGremio.map((n) => (
        <article key={n.nivel} className={`bloque nivel-gremio${actual === String(n.nivel) ? ' actual' : ''}`} id={`nivel-${n.nivel}`}>
          <h3>Nivel {n.nivel}: {n.nombre} <span className="estrellas" aria-hidden="true">{'★'.repeat(n.nivel)}</span></h3>
          <p>{n.descripcion}</p>
          {n.ventajas.length > 0 && <ul>{n.ventajas.map((v, i) => <li key={i}>{v}</li>)}</ul>}
        </article>
      ))}

      <h2 id="ranking">Ranking de Gremios</h2>
      <p>{rankingLibro.introduccion}</p>
      <p>Algunos de los factores que se consideran:</p>
      <ul>
        {rankingLibro.criterios.map((c) => <li key={c.campo}><strong>{c.campo}:</strong> {c.descripcion}</li>)}
      </ul>
      <p>{rankingLibro.cierre}</p>
    </>
  )
}
