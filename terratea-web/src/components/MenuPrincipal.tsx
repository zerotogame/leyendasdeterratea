import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

type Enlace = { to: string; titulo: string; ayuda: string }
type Grupo = { nombre: string; enlaces: Enlace[] }

const GRUPOS: Grupo[] = [
  {
    nombre: 'Reglas',
    enlaces: [
      { to: '/razas', titulo: 'Razas', ayuda: 'Pueblos jugables y sus rasgos' },
      { to: '/clases', titulo: 'Clases', ayuda: 'Habilidades por nivel' },
      { to: '/objetos', titulo: 'Objetos y equipo', ayuda: 'Armas, armaduras y precios' },
      { to: '/chuleta', titulo: 'Chuleta de tiradas', ayuda: 'Consulta rápida en la mesa' },
    ],
  },
  {
    nombre: 'El mundo',
    enlaces: [
      { to: '/bestiario', titulo: 'Bestiario', ayuda: 'Criaturas y monstruos' },
      { to: '/figuras', titulo: 'Figuras notables', ayuda: 'Personajes del mundo (PNJ)' },
      { to: '/gremios', titulo: 'Gremios', ayuda: 'Organizaciones y sus miembros' },
      { to: '/panteon', titulo: 'Panteón', ayuda: 'Deidades y sus dominios' },
    ],
  },
  {
    nombre: 'Personajes',
    enlaces: [
      { to: '/personajes', titulo: 'Mis personajes', ayuda: 'Tus fichas guardadas' },
      { to: '/registro', titulo: 'Registro de jugadores', ayuda: 'Jugadores y sus personajes' },
    ],
  },
  {
    nombre: 'Máster',
    enlaces: [
      { to: '/master', titulo: 'Generador de encuentros', ayuda: 'Monstruos según nivel y terreno' },
      { to: '/master?tab=combate', titulo: 'Combate', ayuda: 'Turnos, vida y ataques' },
    ],
  },
]

export default function MenuPrincipal() {
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState<string | null>(null)
  const [movil, setMovil] = useState(false)
  const raiz = useRef<HTMLElement>(null)

  const cerrar = () => { setAbierto(null); setMovil(false) }

  // Cerrar al pulsar fuera o con Escape.
  useEffect(() => {
    const fuera = (e: MouseEvent) => { if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(null) }
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(null) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla) }
  }, [])

  return (
    <header className="cabecera" ref={raiz}>
      <NavLink to="/" className="logo">Leyendas de Terratéa</NavLink>
      <button
        className="menu-movil"
        aria-expanded={movil}
        aria-controls="menu-principal"
        onClick={() => setMovil((m) => !m)}
      >
        {movil ? 'Cerrar' : 'Menú'}
      </button>
      <nav id="menu-principal" aria-label="Principal" className={movil ? 'abierto' : ''}>
        {GRUPOS.map((g) => {
          const activo = g.enlaces.some((e) => pathname.startsWith(e.to.split('?')[0]))
          const id = `grupo-${g.nombre}`
          return (
            <div key={g.nombre} className={`grupo${abierto === g.nombre ? ' abierto' : ''}${activo ? ' activo' : ''}`}>
              <button
                aria-expanded={abierto === g.nombre}
                aria-controls={id}
                onClick={() => setAbierto(abierto === g.nombre ? null : g.nombre)}
              >
                {g.nombre} <span aria-hidden="true" className="flecha">▾</span>
              </button>
              <ul id={id}>
                {g.enlaces.map((e) => (
                  <li key={e.to}>
                    <Link to={e.to} onClick={cerrar}>
                      <strong>{e.titulo}</strong>
                      <small>{e.ayuda}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        <NavLink to="/creador" className="cta" onClick={cerrar}>Crear personaje</NavLink>
      </nav>
    </header>
  )
}
