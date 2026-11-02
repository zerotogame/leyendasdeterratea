import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { puede, useSesion, type CodigoRol } from '../lib/auth'

const NOMBRE: Record<CodigoRol, string> = { PLAYER: 'Jugador', GUILD_LEADER: 'Líder de gremio', MASTER: 'Master', DEVELOPER: 'Programador' }

/** Muestra la pantalla solo si el usuario tiene el rol indicado (o uno superior). El backend lo vuelve a comprobar. */
export default function Protegido({ minimo, children }: { minimo: CodigoRol; children: ReactNode }) {
  const sesion = useSesion()
  if (puede(sesion, minimo)) return <>{children}</>
  return (
    <div>
      <h1>Acceso restringido</h1>
      {sesion ? (
        <p>Esta sección es para el rol {NOMBRE[minimo]} o superior. Pídele a un Programador que te lo asigne.</p>
      ) : (
        <p>Esta sección es para el rol {NOMBRE[minimo]} o superior. <Link to="/login">Inicia sesión</Link> para entrar.</p>
      )}
    </div>
  )
}
