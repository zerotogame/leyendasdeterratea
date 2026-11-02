import { conAuth, idUsuario } from './auth'
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const SIN_SERVIDOR = 'No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).'

export type Categoria = 'comun' | 'poco_comun' | 'epico_mitico' | 'legendario'
export const CATEGORIAS: { id: Categoria; etiqueta: string }[] = [
  { id: 'comun', etiqueta: 'Común' },
  { id: 'poco_comun', etiqueta: 'Poco Común' },
  { id: 'epico_mitico', etiqueta: 'Épico/ Mítico' },
  { id: 'legendario', etiqueta: 'Legendario' },
]

/** Tintas de la hoja (las de las plantillas: azul, verde, morado) más el granate de los gremios. */
export const TINTAS = [
  { nombre: 'Azul', color: '#3a4458' },
  { nombre: 'Verde', color: '#2e5a40' },
  { nombre: 'Morado', color: '#55385f' },
  { nombre: 'Granate', color: '#a1102f' },
]

export const MOVIMIENTOS = [
  ['move_base', 'Base'], ['move_combat', 'Combate'], ['move_run', 'Carrera'],
  ['move_overweight', 'Sobrepeso'], ['move_flee', 'Huida'],
] as const
export type ClaveMov = (typeof MOVIMIENTOS)[number][0]

export type CuerpoMascota = {
  owner_id: number | null; guild_id: number | null
  name: string; species: string; alignment: string; role: string
  level: number; category: Categoria; hp: number; ac: number; dodge: number
  attack: string; attack_note: string; reach: string; extras: string; load_total: string; color: string
  specials: string[]; inventory: string[]
} & Record<ClaveMov, number | null>

/** Mascota tal y como la devuelve el backend (con datos del dueño y del gremio). */
export type MascotaBd = Omit<CuerpoMascota, 'species' | 'alignment' | 'attack' | 'attack_note' | 'reach' | 'extras' | 'load_total'> & {
  id: number
  species: string | null; alignment: string | null; attack: string | null; attack_note: string | null
  reach: string | null; extras: string | null; load_total: string | null
  image: string | null
  owner_name: string | null; owner_image: string | null; guild_name: string | null
}

export type ResumenMascota = {
  id: number; name: string; species: string | null; role: string; level: number; category: Categoria
  color: string; image: string | null
  owner_id: number | null; owner_name: string | null; guild_id: number | null; guild_name: string | null
}

export const mascotaVacia = (): CuerpoMascota => ({
  owner_id: null, guild_id: null, name: '', species: '', alignment: '', role: 'Mascota',
  level: 1, category: 'comun', hp: 0, ac: 10, dodge: 0, attack: '', attack_note: '', reach: '1', extras: '',
  load_total: '', color: TINTAS[0].color, specials: [], inventory: [],
  move_base: null, move_combat: null, move_run: null, move_overweight: null, move_flee: null,
})

export const cuerpoDesde = (m: MascotaBd): CuerpoMascota => ({
  ...mascotaVacia(), ...m,
  species: m.species ?? '', alignment: m.alignment ?? '', attack: m.attack ?? '', attack_note: m.attack_note ?? '',
  reach: m.reach ?? '', extras: m.extras ?? '', load_total: m.load_total ?? '',
})

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response
  try { r = await fetch(`${API}${url}`, conAuth(init)) } catch { throw new Error(SIN_SERVIDOR) }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`)
  return j as T
}

const json = (metodo: string, cuerpo: unknown): RequestInit =>
  ({ method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })

export const listarMascotas = () => pedir<ResumenMascota[]>(`/users/${idUsuario()}/pets`)
export const mascotasDePersonaje = (id: number) => pedir<ResumenMascota[]>(`/characters/${id}/pets`)
export const mascotasDeGremio = (id: number) => pedir<ResumenMascota[]>(`/guilds/${id}/pets`)
export const cargarMascota = (id: number) => pedir<MascotaBd>(`/pets/${id}`)
export const crearMascota = (m: CuerpoMascota) => pedir<MascotaBd>('/pets', json('POST', { ...m, user_id: idUsuario() }))
export const guardarMascota = (id: number, m: CuerpoMascota) => pedir<MascotaBd>(`/pets/${id}`, json('PUT', m))
export const borrarMascota = (id: number) => pedir<unknown>(`/pets/${id}`, { method: 'DELETE' })
export const subirImagenMascota = (id: number, f: File) =>
  pedir<{ image: string }>(`/pets/${id}/image`, { method: 'POST', headers: { 'Content-Type': f.type }, body: f })
export const quitarImagenMascota = (id: number) => pedir<unknown>(`/pets/${id}/image`, { method: 'DELETE' })

/** «+3» / «-1» / «0» */
export const conSigno = (n: number) => (n > 0 ? `+${n}` : String(n))
