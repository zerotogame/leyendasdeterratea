import { useState } from 'react'
import { Link } from 'react-router-dom'
import { razas, img, imgRaza } from '../lib/datos'

export default function ListaRazas() {
  const [q, setQ] = useState('')
  const lista = razas.filter((r) => r.nombre.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <h1>Razas</h1>
      <input className="buscador" placeholder="Buscar raza…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="tarjetas">
        {lista.map((r) => (
          <Link key={r.id} to={`/razas/${r.id}`} className="tarjeta">
            <img src={img(imgRaza(r))} alt={r.nombre} loading="lazy" />
            <h2>{r.nombre}</h2>
          </Link>
        ))}
      </div>
    </>
  )
}
