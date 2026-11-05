import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type Hallazgo = { id: string; nombre: string; imagen: string; frase: string }

const PASOS = 14 // cambios de número; con el frenado suman ~1,2 s, lo que dura la animación `rueda`
const reducir =() => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const primeraFrase = (t: string) => (t.match(/^.*?[.!?](\s|$)/)?.[0] ?? t).trim()

/** Tira un d20 y enseña una criatura real del bestiario. El bestiario se carga al pulsar, no al arrancar. */
export default function TiraDado() {
  const [cara, setCara] = useState<number | null>(null)
  const [tirando, setTirando] = useState(false)
  const [hallazgo, setHallazgo] = useState<Hallazgo | null>(null)
  const reloj = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(reloj.current), [])

  async function tirar() {
    if (tirando) return
    setTirando(true)
    setHallazgo(null)
    const { criaturas, img2 } = await import('../lib/bestiario')
    const final = 1 + Math.floor(Math.random() * 20)
    const c = criaturas[Math.floor(Math.random() * criaturas.length)]
    const acabar = () => {
      setCara(final)
      setHallazgo({ id: c.id, nombre: c.nombre, imagen: img2(c.imagen), frase: primeraFrase(c.descripcion) })
      setTirando(false)
    }
    if (reducir()) return acabar()
    // los números cambian cada vez más despacio, como un dado que pierde fuerza
    let n = 0
    const paso = () => {
      if (n >= PASOS) return acabar()
      setCara(1 + Math.floor(Math.random() * 20))
      reloj.current = window.setTimeout(paso, 45 + n * n * 1.6)
      n++
    }
    paso()
  }

  return (
    <section className="tira-dado" aria-labelledby="dado-t">
      <div className="tira-dado-izq">
        <h2 id="dado-t">Deja que el dado decida</h2>
        <p>Tira un d20 y mira qué criatura del bestiario se cruza en tu camino.</p>
        <button type="button" className="boton-borde" onClick={tirar} disabled={tirando}>
          {hallazgo ? 'Tirar otra vez' : 'Tirar el d20'}
        </button>
      </div>
      <div className="tira-dado-der" aria-live="polite">
        <div className={`d20${tirando ? ' girando' : ''}`} aria-label={cara ? `Resultado: ${cara}` : 'Dado de veinte caras'}>
          <div className="d20-cuerpo">
            <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,4 93,28 93,72 50,96 7,72 7,28" /></svg>
            <span>{cara ?? '20'}</span>
          </div>
        </div>
        {hallazgo && (
          <Link to={`/bestiario/${hallazgo.id}`} className="hallazgo">
            <img src={hallazgo.imagen} alt="" width={96} height={128} />
            <span>
              <strong>{hallazgo.nombre}</strong>
              <small>{hallazgo.frase}</small>
            </span>
          </Link>
        )}
      </div>
    </section>
  )
}
