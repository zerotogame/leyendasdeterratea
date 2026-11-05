import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MenuPrincipal from './components/MenuPrincipal'
import Inicio from './pages/Inicio'
import Protegido from './components/Protegido'

const ListaRazas = lazy(() => import('./pages/ListaRazas'))
const DetalleRaza = lazy(() => import('./pages/DetalleRaza'))
const ListaClases = lazy(() => import('./pages/ListaClases'))
const DetalleClase = lazy(() => import('./pages/DetalleClase'))
const Creador = lazy(() => import('./pages/Creador'))
const ListaPersonajes = lazy(() => import('./pages/ListaPersonajes'))
const DetallePersonaje = lazy(() => import('./pages/DetallePersonaje'))
const DetallePersonajeBd = lazy(() => import('./pages/DetallePersonajeBd'))
const EditarPersonajeBd = lazy(() => import('./pages/EditarPersonajeBd'))
const Mundo = lazy(() => import('./pages/Mundo'))
const Login = lazy(() => import('./pages/Login'))

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
const Usuarios = lazy(() => import('./pages/Usuarios'))
const Gladiadores = lazy(() => import('./pages/Gladiadores'))
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
          <Route path="/mis-gremios" element={<Protegido minimo="GUILD_LEADER"><ListaGremios /></Protegido>} />
          <Route path="/mis-gremios/nuevo" element={<Protegido minimo="GUILD_LEADER"><EditorGremio /></Protegido>} />
          <Route path="/mis-gremios/:id/editar" element={<Protegido minimo="GUILD_LEADER"><EditorGremio /></Protegido>} />
          <Route path="/mis-gremios/:id" element={<Protegido minimo="GUILD_LEADER"><DetalleGremio /></Protegido>} />
          <Route path="/mis-mascotas" element={<Protegido minimo="PLAYER"><ListaMascotas /></Protegido>} />
          <Route path="/mis-mascotas/nuevo" element={<Protegido minimo="PLAYER"><EditorMascota /></Protegido>} />
          <Route path="/mis-mascotas/:id/editar" element={<Protegido minimo="PLAYER"><EditorMascota /></Protegido>} />
          <Route path="/mis-mascotas/:id" element={<Protegido minimo="PLAYER"><DetalleMascota /></Protegido>} />
          <Route path="/gladiadores" element={<Gladiadores />} />
          <Route path="/torneos" element={<Protegido minimo="MASTER"><ListaTorneos /></Protegido>} />
          <Route path="/torneos/:id" element={<Protegido minimo="MASTER"><DetalleTorneo /></Protegido>} />
          <Route path="/panteon"element={<Panteon />} />
          <Route path="/mundo" element={<Mundo />} />
          <Route path="/master" element={<Protegido minimo="MASTER"><Master /></Protegido>} />
          <Route path="/login" element={<Login />} />
          <Route path="/usuarios" element={<Protegido minimo="DEVELOPER"><Usuarios /></Protegido>} />
          <Route path="/personajes" element={<Protegido minimo="PLAYER"><ListaPersonajes /></Protegido>} />
          <Route path="/personajes/bd/:id/editar" element={<Protegido minimo="PLAYER"><EditarPersonajeBd /></Protegido>} />
          <Route path="/personajes/bd/:id" element={<Protegido minimo="PLAYER"><DetallePersonajeBd /></Protegido>} />
          <Route path="/personajes/:id" element={<Protegido minimo="PLAYER"><DetallePersonaje /></Protegido>} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
        </Suspense>
      </main>
    </>
  )
}
