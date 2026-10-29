import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clases, razas, img } from '../lib/datos'

export default function ListaClases() {
  const [q, setQ] = useState('')
  const [raza, setRaza] = useState('')
  const [armadura, setArmadura] = useState('')
  const [alcance, setAlcance] = useState('')

  const lista = useMemo(() => clases.filter((c) => {
    if (q && !c.nombre.toLowerCase().includes(q.toLowerCase())) return false
    if (raza && !c.razas_disponibles.some((r) => r.disponible && r.raza.split('/')[0] === raza)) return false
    if (armadura && !c.armadura[armadura as 'ligera' | 'media' | 'pesada']) return false
    if (alcance === 'melee' && c.rango_distancia !== '1') return false
    if (alcance === 'distancia' && (c.rango_distancia === '1' || !c.rango_distancia)) return false
    return true
  }), [q, raza, armadura, alcance])

  return (
    <>
      <h1>Clases</h1>
      <div className="filtros">
        <input className="buscador" placeholder="Buscar clase…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={raza} onChange={(e) => setRaza(e.target.value)}>
          <option value="">Cualquier raza</option>
          {razas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <select value={armadura} onChange={(e) => setArmadura(e.target.value)}>
          <option value="">Cualquier armadura</option>
          <option value="ligera">Armadura ligera</option>
          <option value="media">Armadura media</option>
          <option value="pesada">Armadura pesada</option>
        </select>
        <select value={alcance} onChange={(e) => setAlcance(e.target.value)}>
          <option value="">Cualquier alcance</option>
          <option value="melee">Cuerpo a cuerpo (rango 1)</option>
          <option value="distancia">A distancia</option>
        </select>
      </div>
      <p className="contador">{lista.length} de {clases.length} clases</p>
      <div className="tarjetas">
        {lista.map((c) => (
          <Link key={c.id} to={`/clases/${c.id}`} className="tarjeta">
            <img src={img(c.imagenes.ilustraciones[0] ?? c.imagenes.titulo ?? '')} alt={c.nombre} loading="lazy" />
            <h2>{c.nombre}</h2>
          </Link>
        ))}
      </div>
    </>
  )
}
