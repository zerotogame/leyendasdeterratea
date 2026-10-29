import { Link } from 'react-router-dom'
import { razaDeTexto } from '../lib/mundo'

/** Raza de un PNJ: enlaza a la ficha del Libro 1 cuando el nombre coincide; si no, solo el texto del libro. */
export function RazaEnlace({ texto }: { texto: string | null }) {
  if (!texto) return <>—</>
  const id = razaDeTexto(texto)
  return id ? <Link to={`/razas/${id}`}>{texto}</Link> : <>{texto}</>
}
