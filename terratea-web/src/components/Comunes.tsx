import type { ReactNode } from 'react'
import { img } from '../lib/datos'
import type { Rasgo, Imagenes } from '../data/types'

export function Rasgos({ titulo, rasgos, tipo }: { titulo: string; rasgos: Rasgo[]; tipo: 'bien' | 'mal' }) {
  if (!rasgos?.length) return null
  return (
    <section className="bloque">
      <h3>{titulo}</h3>
      <ul className={`rasgos ${tipo}`}>
        {rasgos.map((r, i) => <li key={i}>{r.texto}</li>)}
      </ul>
    </section>
  )
}

export function Galeria({ imagenes, alt }: { imagenes: Imagenes; alt: string }) {
  return (
    <div className="galeria">
      {imagenes.ilustraciones.map((src) => (
        <img key={src} src={img(src)} alt={alt} loading="lazy" />
      ))}
    </div>
  )
}

export function Parrafos({ texto }: { texto: string[] }) {
  return <>{texto.map((p, i) => <p key={i}>{p}</p>)}</>
}

export function Chip({ children, tono }: { children: ReactNode; tono?: 'ok' | 'no' }) {
  return <span className={`chip ${tono ?? ''}`}>{children}</span>
}
