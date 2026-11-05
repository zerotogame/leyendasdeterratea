import type { CSSProperties, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { ResumenGremio } from '../lib/gremios'
import Estrellas from './Estrellas'

/** El brillo dorado sigue al puntero dentro del estandarte. */
const brillo = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

type Props = {
  gremios: ResumenGremio[]
  /** Pone el filete de oro, plata y bronce a los tres primeros. */
  podio?: boolean
  eliminar?: (g: ResumenGremio) => void
}

/** Gremios de jugadores como estandartes colgados; el enlace lleva a su ficha. */
export default function Estandartes({ gremios, podio, eliminar }: Readonly<Props>) {
  return (
    <div className="estandartes">
      {gremios.map((g, i) => (
        <article
          key={g.id}
          className={`estandarte${podio && i < 3 ? ` puesto-${i + 1}` : ''}`}
          style={{ '--i': Math.min(i, 12), '--rep': `${Math.min(100, Math.max(0, g.reputation))}%` } as CSSProperties}
          onPointerMove={brillo}
        >
          <Link to={`/mis-gremios/${g.id}`} className="estandarte-enlace">
            <span className="medallon" aria-hidden="true"><span className="inicial">{g.name.trim().charAt(0).toUpperCase()}</span></span>
            <h2>{g.name}</h2>
            <small>{g.location || 'Sin localización'}</small>
            <Estrellas n={g.stars} />
            <span className="reputacion" title={`Reputación ${g.reputation}%`}>
              <span className="reputacion-barra" aria-hidden="true" />
              <small>{g.members} miembro{g.members === 1 ? '' : 's'}, reputación {g.reputation}%</small>
            </span>
          </Link>
          {eliminar && <button className="peligro" onClick={() => eliminar(g)}>Eliminar</button>}
        </article>
      ))}
    </div>
  )
}
