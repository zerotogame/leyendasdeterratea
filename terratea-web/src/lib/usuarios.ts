import { conAuth } from './auth'
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const SIN_SERVIDOR = 'No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).'

export type Rol = { id: number; code: string; name: string; description: string | null; users: number }
export type Usuario = { id: number; email: string; roles: string[]; characters?: number }
export type PersonajeAdmin = { id: number; name: string; level: number; user_id: number | null; owner_email: string | null }

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response
  try { r = await fetch(`${API}${url}`, conAuth(init)) } catch { throw new Error(SIN_SERVIDOR) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`)
  return j as T
}

export const listarRoles = () => pedir<Rol[]>('/roles')
export const listarUsuarios = () => pedir<Usuario[]>('/users')
export const guardarRoles = (id: number, roles: string[]) =>
  pedir<{ id: number; roles: string[] }>(`/users/${id}/roles`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roles }),
  })

/** Añade o quita un rol de la lista, sin repetir. */
export const alternarRol = (roles: string[], code: string): string[] =>
  roles.includes(code) ? roles.filter((c) => c !== code) : [...roles, code]

const JSON_H = { 'Content-Type': 'application/json' }
export const crearUsuario = (d: { email: string; password: string; roles: string[] }) =>
  pedir<Usuario>('/users', { method: 'POST', headers: JSON_H, body: JSON.stringify(d) })
export const editarUsuario = (id: number, d: { email?: string; password?: string }) =>
  pedir<{ id: number; email: string }>(`/users/${id}`, { method: 'PUT', headers: JSON_H, body: JSON.stringify(d) })
export const listarPersonajesAdmin = () => pedir<PersonajeAdmin[]>('/admin/characters')
export const asignarPersonaje = (personajeId: number, userId: number) =>
  pedir<PersonajeAdmin>(`/admin/characters/${personajeId}/owner`, { method: 'PUT', headers: JSON_H, body: JSON.stringify({ user_id: userId }) })
export const borrarUsuario = (id: number) => pedir<{ id: number }>(`/users/${id}`, { method: 'DELETE' })
