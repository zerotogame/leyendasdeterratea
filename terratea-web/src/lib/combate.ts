import type { Criatura } from '../data/libro2.types'

export type Combatiente = {
  uid: string
  criaturaId: string
  nombre: string // con número si hay varias: «Goblin 2»
  vidaMax: number | null // null = «¿?» en el libro
  vida: number
  ca: number | null
  movimiento: number | null
  alcance: number | null
}

const CLAVE = 'terratea-combate'
const entero = (x: unknown) => typeof x === 'number' && Number.isFinite(x)
const entNull = (x: unknown) => (entero(x) ? (x as number) : null)

/** Crea combatientes numerando los nombres repetidos respecto a los que ya hay. */
export function nuevosCombatientes(existentes: Combatiente[], lista: Criatura[]): Combatiente[] {
  const total = new Map<string, number>()
  for (const c of [...existentes.map((e) => e.criaturaId), ...lista.map((c) => c.id)]) total.set(c, (total.get(c) ?? 0) + 1)
  const contador = new Map<string, number>()
  for (const e of existentes) contador.set(e.criaturaId, (contador.get(e.criaturaId) ?? 0) + 1)
  return lista.map((c) => {
    const n = (contador.get(c.id) ?? 0) + 1
    contador.set(c.id, n)
    return {
      uid: crypto.randomUUID(),
      criaturaId: c.id,
      nombre: (total.get(c.id) ?? 1) > 1 ? `${c.nombre} ${n}` : c.nombre,
      vidaMax: c.vitalidad, vida: c.vitalidad ?? 0, ca: c.ca,
      movimiento: c.movimiento_casillas, alcance: c.alcance_casillas,
    }
  })
}

/** Devuelve el combate completo con `lista` añadida; si ya había una sola criatura igual sin número, pasa a ser «1». */
export function añadirCombatientes(existentes: Combatiente[], lista: Criatura[]): Combatiente[] {
  const renombradas = existentes.map((e) => {
    const c = lista.find((x) => x.id === e.criaturaId)
    return c && e.nombre === c.nombre ? { ...e, nombre: `${c.nombre} 1` } : e
  })
  return [...renombradas, ...nuevosCombatientes(existentes, lista)]
}

/** Aplica daño (+) o curación (−) sin bajar de 0 ni superar la vitalidad máxima. */
export const aplicarDano = (c: Combatiente, dano: number): Combatiente => {
  const vida = c.vida - dano
  return { ...c, vida: Math.max(0, c.vidaMax != null ? Math.min(c.vidaMax, vida) : vida) }
}

export function leerCombate(): Combatiente[] {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    if (!Array.isArray(l)) return []
    return l.filter((c): c is Combatiente =>
      !!c && typeof c.uid === 'string' && typeof c.criaturaId === 'string' && typeof c.nombre === 'string' && entero(c.vida))
      .map((c) => ({ ...c, vidaMax: entNull(c.vidaMax), ca: entNull(c.ca), movimiento: entNull(c.movimiento), alcance: entNull(c.alcance) }))
  } catch { return [] }
}

export function guardarCombate(l: Combatiente[]) {
  try { localStorage.setItem(CLAVE, JSON.stringify(l)) } catch { /* sin almacenamiento */ }
}
