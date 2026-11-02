import { conAuth, idUsuario } from './auth'
import { listarDeBd, type ResumenBd } from './sync'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const SIN_SERVIDOR = 'No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).'

export const MAX_ESTRELLAS = 10

export type Gema = { name: string; quantity: number }
export type Empleado = { name: string; note: string }

/** Gremio tal y como lo guarda/devuelve el backend (las listas son texto libre, una entrada por línea). */
export type GremioBd = {
  id: number; name: string; founded: string | null; location: string | null
  reputation: number; stars: number; gold: number; silver: number; copper: number
  gems: Gema[]; storage: string[]; harvest: string[]; advantages: string[]; benefits: string[]
  staff: Empleado[]; properties: string[]
  members: ResumenBd[]
}

export type CuerpoGremio = Omit<GremioBd, 'id' | 'members'> & { members: number[] }

export type ResumenGremio = { id: number; name: string; location: string | null; stars: number; reputation: number; members: number }

export const gremioVacio = (): CuerpoGremio => ({
  name: '', founded: '', location: '', reputation: 0, stars: 0, gold: 0, silver: 0, copper: 0,
  gems: [], storage: [], harvest: [], advantages: [], benefits: [], staff: [], properties: [], members: [],
})

export const cuerpoDesde = (g: GremioBd): CuerpoGremio => ({ ...g, members: g.members.map((m) => m.id) })

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response
  try { r = await fetch(`${API}${url}`, conAuth(init)) } catch { throw new Error(SIN_SERVIDOR) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`)
  return j as T
}

const json = (metodo: string, cuerpo: unknown): RequestInit =>
  ({ method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })

export const listarGremios = () => pedir<ResumenGremio[]>(`/users/${idUsuario()}/guilds`)
export const cargarGremio = (id: number) => pedir<GremioBd>(`/guilds/${id}`)
export const crearGremio = (g: CuerpoGremio) => pedir<GremioBd>('/guilds', json('POST', { ...g, user_id: idUsuario() }))
export const guardarGremio = (id: number, g: CuerpoGremio) => pedir<GremioBd>(`/guilds/${id}`, json('PUT', g))
export const borrarGremio = (id: number) => pedir<unknown>(`/guilds/${id}`, { method: 'DELETE' })

/** Personajes que se pueden meter en un gremio (los del usuario). */
export const personajesDisponibles = () => listarDeBd()
