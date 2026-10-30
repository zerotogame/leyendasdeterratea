import { armaduras, clasePorId, razaPorId, NOMBRE_ATRIBUTO } from './datos'
import { IDS_ATRIBUTO, aCobre, calcularCA, limpiar, modificador, tipoArmadura, vitalidadInicial } from './reglas'
import { costeCompra, itemCompra, nombreCompra, puntuacionesDe, type Personaje } from './personajes'
import type { Arma } from '../data/types'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const USER_ID = Number(import.meta.env.VITE_USER_ID ?? 7)

/** Misma ficha que dibuja `Ficha`, con la forma que espera POST /characters/web del backend. */
export function cuerpoBd(p: Personaje) {
  const raza = razaPorId(p.razaId)!
  const clase = clasePorId(p.claseId)!
  const pt = puntuacionesDe(p)
  const piezas = p.compras.filter((c) => c.tipo === 'armadura').map((c) => armaduras[c.idx])
    .filter((a) => tipoArmadura(a) || /ESCUDO/i.test(a.categoria ?? ''))
  const modCon = modificador('constitucion', pt.constitucion ?? 10)
  const resto = p.fortuna ? Math.max(0, aCobre(p.fortuna) - p.compras.reduce((s, c) => s + (costeCompra(c) ?? 0), 0)) : 0
  return {
    user_id: USER_ID,
    name: p.nombre,
    race_name: raza.nombre,
    class_name: clase.nombre,
    stats: IDS_ATRIBUTO.map((id) => ({ name: NOMBRE_ATRIBUTO[id], value: pt[id], modifier: modificador(id, pt[id] ?? 10) })),
    hit_points: p.vida != null ? vitalidadInicial(p.vida, modCon) : 3,
    armor_class: calcularCA(piezas),
    gold: Math.floor(resto / 100), silver: Math.floor((resto % 100) / 10), copper: resto % 10,
    weapons: p.compras.filter((c) => c.tipo === 'arma').map((c) => {
      const a = itemCompra(c) as Arma
      return { name: nombreCompra(c), damage: limpiar(a.dano) || null, weight: a.peso ?? null, hands: Number(a.manos) || null }
    }),
    items: p.compras.filter((c) => c.tipo === 'objeto').map(nombreCompra),
  }
}

/** Guarda el personaje en la BD y devuelve su id. Lanza un Error con el motivo si falla. */
export async function guardarEnBd(p: Personaje): Promise<number> {
  let r: Response
  try {
    r = await fetch(`${API}/characters/web`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpoBd(p)) })
  } catch {
    throw new Error('No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).')
  }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((j.errors ?? [j.error]).filter(Boolean).join(' ') || `Error ${r.status}`)
  return j.id as number
}

export type ImagenBd = { id: number; file: string }

/** URL pública de una imagen guardada por el backend (la BD solo guarda la ruta relativa). */
export const urlImagen = (file: string) => `${API}/images/${file}`

/** Personaje tal y como lo devuelve GET /characters/:id (el backend es la fuente de verdad). */
export type PersonajeBd = {
  id: number; name: string; race: string; class: string; level: number; exp: number; required_experience: number | null
  alignment?: string; player_name?: string; guild?: string; age?: number; height?: string; weight?: string
  sex?: string; hair?: string; eyes?: string; marks?: string
  images: ImagenBd[]
  hit_points: number; armor_class: number; dodge?: number; range_reach?: string
  gold: number; silver: number; copper: number; max_carry_kg?: number
  attributes: Record<string, { value: number; modifier: number }>
  rollSalvations: Record<string, number>
  rollMovements: Record<string, number>
  inventory: { object_id: number; name: string; quantity: number; weight_kg: string | null; note?: string | null }[]
  weapons: { slot: number; name: string; damage?: string | null; total: string | null; special: string | null; hands: number | null; weight: string | null }[]
  specialSkills: string[]
  extraAttributes: string[]
}

export async function cargarDeBd(id: number): Promise<PersonajeBd> {
  let r: Response
  try { r = await fetch(`${API}/characters/${id}`) }
  catch { throw new Error('No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).') }
  if (!r.ok) throw new Error(`Error ${r.status}`)
  return r.json()
}

export type ResumenBd = { id: number; name: string; level: number; race: string; class: string; image: string | null }

export async function listarDeBd(): Promise<ResumenBd[]> {
  let r: Response
  try { r = await fetch(`${API}/users/${USER_ID}/characters`) }
  catch { throw new Error('No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).') }
  if (!r.ok) throw new Error(`Error ${r.status}`)
  return r.json()
}

export async function borrarDeBd(id: number): Promise<void> {
  let r: Response
  try { r = await fetch(`${API}/characters/${id}`, { method: 'DELETE' }) }
  catch { throw new Error('No se pudo conectar con el servidor.') }
  if (!r.ok && r.status !== 404) throw new Error(`Error ${r.status}`)
}

const SIN_SERVIDOR = 'No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).'

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response
  try { r = await fetch(`${API}${url}`, init) } catch { throw new Error(SIN_SERVIDOR) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((j.errors ?? [j.error]).filter(Boolean).join(' ') || `Error ${r.status}`)
  return j as T
}

/** Campos de la ficha que se pueden editar (el resto lo deciden las reglas). Vacío = borrar el dato. */
export type CambiosFicha = {
  name: string; player_name: string; guild: string; alignment: string; sex: string
  age: string; height: string; weight: string; hair: string; eyes: string; marks: string
  armor_class: string; gold: string; silver: string; copper: string
  specialSkills: string[]; extraAttributes: string[]
}

export const actualizarEnBd = (id: number, cambios: CambiosFicha) =>
  pedir<PersonajeBd>(`/characters/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cambios) })

/** El backend suma la experiencia y sube de nivel solo si toca; `levels_gained` dice cuántos niveles ha subido. */
export const darExperiencia = (id: number, amount: number) =>
  pedir<PersonajeBd & { levels_gained: number }>(`/characters/${id}/experience`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) })

/** Suma monedas a las que ya tiene (el PUT del backend solo cambia los campos que se le mandan). */
export async function sumarMonedas(id: number, m: { oro: number; plata: number; cobre: number }) {
  const p = await cargarDeBd(id)
  return pedir<PersonajeBd>(`/characters/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gold: p.gold + m.oro, silver: p.silver + m.plata, copper: p.copper + m.cobre }),
  })
}

export const reglasBd = () => pedir<{ alignments: string[]; sexes: string[] }>('/rules')

export const subirImagen = (id: number, f: File) =>
  pedir<ImagenBd>(`/characters/${id}/images`, { method: 'POST', headers: { 'Content-Type': f.type }, body: f })

export const borrarImagen = (id: number, imagenId: number) =>
  pedir<unknown>(`/characters/${id}/images/${imagenId}`, { method: 'DELETE' })
