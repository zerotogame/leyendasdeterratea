import datos from '../data/gladiadores.json'
import { conAuth } from './auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const SIN_SERVIDOR = 'No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).'

// Sistema oficial de puntuación (ticket SD-24).
export const PUNTOS = { oro: 5, plata: 3, bronce: 1 } as const
export type Puesto = keyof typeof PUNTOS
export const PUESTOS: Record<Puesto, string> = { oro: '🥇 Ganador', plata: '🥈 Subcampeón', bronce: '🥉 Tercer clasificado' }

export type Resultado = { juego: string; puesto: Puesto; gladiador: string; gremio?: string }
export type Edicion = {
  numero: number
  anio: number | null
  estado: string
  fecha?: string
  resultados: Resultado[]
  cronica: string
}
export type Juego = { id: string; nombre: string; modalidad: string; nuevo: boolean; desde?: number }

export const promotor = datos.promotor
export const lugar = datos.lugar
export const juegos = datos.juegos as Juego[]

const ROMANOS: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
export function romano(n: number): string {
  let r = ''
  for (const [v, s] of ROMANOS) while (n >= v) { r += s; n -= v }
  return r
}

export type Fila = { nombre: string; puntos: number; oro: number; plata: number; bronce: number; participaciones: number }

/** Ranking acumulado por gladiador o por gremio, opcionalmente filtrado por juego. */
export function ranking(eds: Edicion[], por: 'gladiador' | 'gremio', juego?: string): Fila[] {
  const m = new Map<string, Fila>()
  for (const e of eds) {
    for (const r of e.resultados) {
      if (juego && r.juego !== juego) continue
      const nombre = por === 'gladiador' ? r.gladiador : r.gremio
      if (!nombre) continue
      const f = m.get(nombre) ?? { nombre, puntos: 0, oro: 0, plata: 0, bronce: 0, participaciones: 0 }
      f.puntos += PUNTOS[r.puesto]
      f[r.puesto]++
      f.participaciones++
      m.set(nombre, f)
    }
  }
  return [...m.values()].sort((a, b) => b.puntos - a.puntos || b.oro - a.oro || a.nombre.localeCompare(b.nombre))
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response
  try { r = await fetch(`${API}${url}`, conAuth(init)) } catch { throw new Error(SIN_SERVIDOR) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`)
  return j as T
}

export const listarEdiciones = () => pedir<Edicion[]>('/gladiators/editions')
export const guardarEdicion = (e: Edicion) =>
  pedir<Edicion>(`/gladiators/editions/${e.numero}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) })
export const borrarEdicion = (numero: number) => pedir<unknown>(`/gladiators/editions/${numero}`, { method: 'DELETE' })
