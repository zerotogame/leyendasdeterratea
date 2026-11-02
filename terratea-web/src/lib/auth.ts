import { useSyncExternalStore } from 'react'

const CLAVE = 'terratea-sesion'
const AVISO = 'terratea-sesion-cambio'
const ID_POR_DEFECTO = Number(import.meta.env.VITE_USER_ID ?? 7)

export type CodigoRol = 'PLAYER' | 'GUILD_LEADER' | 'MASTER' | 'DEVELOPER'
export type Sesion = { token: string; user: { id: number; email: string; roles: CodigoRol[] } }

/** Misma jerarquía que el backend: cada rol incluye los de abajo; Programador es admin. */
const NIVEL: Record<CodigoRol, number> = { PLAYER: 1, GUILD_LEADER: 2, MASTER: 3, DEVELOPER: 4 }

export const nivelDe = (roles: string[]) => Math.max(0, ...roles.map((r) => NIVEL[r as CodigoRol] ?? 0))
export const puede = (s: Sesion | null, minimo: CodigoRol) => !!s && nivelDe(s.user.roles) >= NIVEL[minimo]

let cache: { crudo: string | null; sesion: Sesion | null } = { crudo: null, sesion: null }

export function leerSesion(): Sesion | null {
  let crudo: string | null = null
  try { crudo = localStorage.getItem(CLAVE) } catch { /* sin almacenamiento */ }
  if (crudo === cache.crudo) return cache.sesion
  let sesion: Sesion | null = null
  try {
    const s = crudo ? JSON.parse(crudo) : null
    if (s && typeof s.token === 'string' && typeof s.user?.id === 'number') {
      sesion = { token: s.token, user: { id: s.user.id, email: String(s.user.email ?? ''), roles: Array.isArray(s.user.roles) ? s.user.roles : [] } }
    }
  } catch { /* sesión rota: se ignora */ }
  cache = { crudo, sesion }
  return sesion
}

export function guardarSesion(s: Sesion | null) {
  try {
    if (s) localStorage.setItem(CLAVE, JSON.stringify(s)); else localStorage.removeItem(CLAVE)
  } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new Event(AVISO))
}

const suscribir = (cb: () => void) => {
  window.addEventListener(AVISO, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(AVISO, cb); window.removeEventListener('storage', cb) }
}

export const useSesion = () => useSyncExternalStore(suscribir, leerSesion)

/** Usuario dueño de los datos: el de la sesión, o el de pruebas (VITE_USER_ID) si nadie ha entrado. */
export const idUsuario = () => leerSesion()?.user.id ?? ID_POR_DEFECTO

/** Añade el token de la sesión (si hay) a una petición. */
export function conAuth(init: RequestInit = {}): RequestInit {
  const s = leerSesion()
  if (!s) return init
  return { ...init, headers: { ...(init.headers as Record<string, string> | undefined), Authorization: `Bearer ${s.token}` } }
}
