import { Link } from 'react-router-dom'
import { img } from '../lib/img'
import TiraDado from '../components/TiraDado'

// la diosa es una silueta sin fondo: se coloca sobre un resplandor dorado para que se vea
const BRILLO = 'radial-gradient(circle at 50% 32%, #f6d27a 0%, #b98f35 38%, #1e1d1b 80%)'

const PUERTAS = [
  { a: '/razas', titulo: 'Elige tu raza', texto: 'Elfos, autómatas, aviroides… cada pueblo cambia cómo juegas.', img: 'img/razas/elfo-ilustracion-1.webp' },
  { a: '/clases', titulo: 'Elige tu clase', texto: 'Habilidades y poderes de cada clase, nivel a nivel.', img: 'img/clases/paladin-ilustracion-1.webp' },
  { a: '/bestiario', titulo: 'Descubre las bestias de este mundo', texto: '450 criaturas con todo lo necesario para enfrentarlas.', img: 'img/libro2/bestiario/amarok.webp' },
  { a: '/panteon', titulo: 'Conoce a los dioses', texto: 'Las deidades que mueven los hilos de Terratea.', img: 'img/libro2/deidades/afrodita.webp', silueta: true },
]

// No importes datos pesados aquí: Inicio carga al arrancar.
export default function Inicio() {
  return (
    <div className="inicio">
      <section className="inicio-hero">
        <div className="inicio-texto">
          <h1>Leyendas de Terratea</h1>
          <p className="inicio-lema">Cuatro reinos alrededor de una ciudad que no pertenece a ninguno.</p>
          <p className="inicio-sub">Compañero de mesa del juego de rol: consulta las reglas, recorre el mundo y crea tu personaje paso a paso.</p>
          <div className="inicio-acciones">
            <Link to="/creador" className="boton-oro">Crear personaje</Link>
            <Link to="/mundo" className="boton-borde">Recorrer el mundo</Link>
          </div>
        </div>
        <figure className="inicio-mapa">
          <Link to="/mundo" className="marco-oro" aria-label="Abrir el mapa de Terratea">
            <img src={img('img/mapas/mapas-02.webp')} alt="Mapa de Terratea" />
          </Link>
        </figure>
      </section>

      <TiraDado />

      <section className="puertas">
        <h2>¿Qué quieres descubrir?</h2>
        <ul>
          {PUERTAS.map((p) => (
            <li key={p.a}>
              <Link to={p.a} className={p.silueta ? 'puerta silueta' : 'puerta'} style={{ backgroundImage: p.silueta ? `url(${img(p.img)}), ${BRILLO}` : `url(${img(p.img)})` }}>
                <strong>{p.titulo}</strong>
                <span>{p.texto}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
