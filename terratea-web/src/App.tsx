import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MenuPrincipal from './components/MenuPrincipal'
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
import Mundo from './pages/Mundo'

// El Libro 2 (450 criaturas) va en chunks aparte para no engordar la carga inicial.
const ListaBestiario = lazy(() => import('./pages/ListaBestiario'))
const DetalleCriatura = lazy(() => import('./pages/DetalleCriatura'))
const Master = lazy(() => import('./pages/Master'))
const Figuras = lazy(() => import('./pages/Figuras'))
const Gremios = lazy(() => import('./pages/Gremios'))
const NivelesGremio = lazy(() => import('./pages/NivelesGremio'))
const ListaGremios = lazy(() => import('./pages/ListaGremios'))
const DetalleGremio = lazy(() => import('./pages/DetalleGremio'))
const EditorGremio = lazy(() => import('./pages/EditorGremio'))
const ListaMascotas = lazy(() => import('./pages/ListaMascotas'))
const DetalleMascota = lazy(() => import('./pages/DetalleMascota'))
const EditorMascota = lazy(() => import('./pages/EditorMascota'))
const ListaTorneos = lazy(() => import('./pages/ListaTorneos'))
const DetalleTorneo = lazy(() => import('./pages/DetalleTorneo'))
const Panteon = lazy(() => import('./pages/Panteon'))
const Objetos = lazy(() => import('./pages/Objetos'))
const Chuleta = lazy(() => import('./pages/Chuleta'))

export default function App() {
  return (
    <>
      <MenuPrincipal />
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
          <Route path="/gremios/niveles" element={<NivelesGremio />} />
          <Route path="/mis-gremios" element={<ListaGremios />} />
          <Route path="/mis-gremios/nuevo" element={<EditorGremio />} />
          <Route path="/mis-gremios/:id/editar" element={<EditorGremio />} />
          <Route path="/mis-gremios/:id" element={<DetalleGremio />} />
          <Route path="/mis-mascotas" element={<ListaMascotas />} />
          <Route path="/mis-mascotas/nuevo" element={<EditorMascota />} />
          <Route path="/mis-mascotas/:id/editar" element={<EditorMascota />} />
          <Route path="/mis-mascotas/:id" element={<DetalleMascota />} />
          <Route path="/torneos" element={<ListaTorneos />} />
          <Route path="/torneos/:id" element={<DetalleTorneo />} />
          <Route path="/panteon"element={<Panteon />} />
          <Route path="/mundo" element={<Mundo />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/master" element={<Master />} />
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
