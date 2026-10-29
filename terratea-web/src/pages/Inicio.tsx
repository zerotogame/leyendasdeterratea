import { Link } from 'react-router-dom'
import { clases, razas, img } from '../lib/datos'

export default function Inicio() {
  return (
    <div className="inicio">
      <h1>Leyendas de Terratéa</h1>
      <p className="lead">Compendio del Libro 1: {razas.length} razas, {clases.length} clases y un creador de personajes paso a paso.</p>
      <div className="tarjetas">
        <Link to="/razas" className="tarjeta"><img src={img('img/razas/humano-ilustracion-1.webp')} alt="" /><h2>Razas</h2></Link>
        <Link to="/clases" className="tarjeta"><img src={img('img/clases/alquimista-ilustracion-1.webp')} alt="" /><h2>Clases</h2></Link>
        <Link to="/creador" className="tarjeta"><img src={img('img/razas/elfo-ilustracion-1.webp')} alt="" /><h2>Crear personaje</h2></Link>
      </div>
    </div>
  )
}
