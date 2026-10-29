import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio'
import ListaRazas from './pages/ListaRazas'
import DetalleRaza from './pages/DetalleRaza'
import ListaClases from './pages/ListaClases'
import DetalleClase from './pages/DetalleClase'
import Creador from './pages/Creador'
import ListaPersonajes from './pages/ListaPersonajes'
import DetallePersonaje from './pages/DetallePersonaje'
import DetallePersonajeBd from './pages/DetallePersonajeBd'
import EditarPersonajeBd from './pages/EditarPersonajeBd'
import Registro from './pages/Registro'

// El Libro 2 (450 criaturas) va en chunks aparte para no engordar la carga inicial.
const ListaBestiario = lazy(() => import('./pages/ListaBestiario'))
const DetalleCriatura = lazy(() => import('./pages/DetalleCriatura'))
const Master = lazy(() => import('./pages/Master'))
const Figuras = lazy(() => import('./pages/Figuras'))
const Gremios = lazy(() => import('./pages/Gremios'))
const Panteon = lazy(() => import('./pages/Panteon'))
const Objetos = lazy(() => import('./pages/Objetos'))
const Chuleta = lazy(() => import('./pages/Chuleta'))

export default function App() {
  return (
    <>
      <header className="cabecera">
        <NavLink to="/" className="logo">Leyendas de Terratéa</NavLink>
        <nav>
          <NavLink to="/razas">Razas</NavLink>
          <NavLink to="/clases">Clases</NavLink>
          <NavLink to="/bestiario">Bestiario</NavLink>
          <NavLink to="/objetos">Objetos</NavLink>
          <NavLink to="/chuleta">Chuleta</NavLink>
          <NavLink to="/figuras">Figuras</NavLink>
          <NavLink to="/gremios">Gremios</NavLink>
          <NavLink to="/panteon">Panteón</NavLink>
          <NavLink to="/master">Máster</NavLink>
          <NavLink to="/personajes">Mis personajes</NavLink>
          <NavLink to="/registro">Registro</NavLink>
          <NavLink to="/creador" className="cta">Crear personaje</NavLink>
        </nav>
      </header>
      <main>
        <Suspense fallback={<p>Cargando…</p>}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/razas" element={<ListaRazas />} />
          <Route path="/razas/:id" element={<DetalleRaza />} />
          <Route path="/clases" element={<ListaClases />} />
          <Route path="/clases/:id" element={<DetalleClase />} />
          <Route path="/creador" element={<Creador />} />
          <Route path="/bestiario" element={<ListaBestiario />} />
          <Route path="/bestiario/:id" element={<DetalleCriatura />} />
          <Route path="/objetos" element={<Objetos />} />
          <Route path="/chuleta" element={<Chuleta />} />
          <Route path="/figuras" element={<Figuras />} />
          <Route path="/gremios" element={<Gremios />} />
          <Route path="/panteon" element={<Panteon />} />
          <Route path="/master" element={<Master />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/personajes" element={<ListaPersonajes />} />
          <Route path="/personajes/bd/:id/editar" element={<EditarPersonajeBd />} />
          <Route path="/personajes/bd/:id" element={<DetallePersonajeBd />} />
          <Route path="/personajes/:id" element={<DetallePersonaje />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
        </Suspense>
      </main>
    </>
  )
}
