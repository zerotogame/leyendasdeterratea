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
  // Control de turno (opcionales: un combate guardado antes sigue siendo válido)
  bando?: Bando // sin definir = enemigo
  movUsado?: number // casillas gastadas en el turno actual
  accionUsada?: boolean // acción activa del turno gastada
  // Datos de la ficha del jugador
  fichaId?: number // id en la base de datos (evita añadir dos veces al mismo personaje)
  nivel?: number
  clase?: string
  armas?: ArmaCombate[]
  habilidades?: HabilidadCombate[]
  mods?: ModsCombate
  extras?: string[] // habilidades especiales y atributos extra de la ficha («+1 Daño por oscuridad»…)
}

export type Bando = 'jugador' | 'enemigo'
/** Modificadores del Libro 1: Fuerza = acciones de fuerza o daño, Destreza = ataque, Constitución = bloqueo de daño. */
export type ModsCombate = { fuerza: number; destreza: number; constitucion: number }
export type ArmaCombate = { nombre: string; dados: string | null } // dados: «2D4»; null = sin dato en la ficha
/** `bonoDano` y `curaMitad` se leen del texto del libro; el Máster decide cuándo aplican. */
export type HabilidadCombate = { nombre: string; descripcion: string; activa: boolean; bonoDano: number | null; curaMitad: boolean }

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
      .map((c) => {
        const base: Combatiente = { ...c, vidaMax: entNull(c.vidaMax), ca: entNull(c.ca), movimiento: entNull(c.movimiento), alcance: entNull(c.alcance) }
        if (c.bando !== 'jugador') delete base.bando
        if (!entero(c.movUsado)) delete base.movUsado
        if (typeof c.accionUsada !== 'boolean') delete base.accionUsada
        if (!entero(c.fichaId)) delete base.fichaId
        if (!entero(c.nivel)) delete base.nivel
        if (typeof c.clase !== 'string') delete base.clase
        if (Array.isArray(c.armas)) base.armas = c.armas.filter((a: ArmaCombate) => a && typeof a.nombre === 'string').map((a: ArmaCombate) => ({ nombre: a.nombre, dados: typeof a.dados === 'string' ? a.dados : null }))
        else delete base.armas
        if (Array.isArray(c.habilidades)) {
          base.habilidades = c.habilidades.filter((h: HabilidadCombate) => h && typeof h.nombre === 'string')
            .map((h: HabilidadCombate) => ({ nombre: h.nombre, descripcion: typeof h.descripcion === 'string' ? h.descripcion : '', activa: h.activa === true, bonoDano: entNull(h.bonoDano), curaMitad: h.curaMitad === true }))
        } else delete base.habilidades
        if (c.mods && entero(c.mods.fuerza) && entero(c.mods.destreza) && entero(c.mods.constitucion)) base.mods = { fuerza: c.mods.fuerza, destreza: c.mods.destreza, constitucion: c.mods.constitucion }
        else delete base.mods
        if (Array.isArray(c.extras)) base.extras = c.extras.filter((x: unknown): x is string => typeof x === 'string')
        else delete base.extras
        return base
      })
  } catch { return [] }
}

export function guardarCombate(l: Combatiente[]) {
  try { localStorage.setItem(CLAVE, JSON.stringify(l)) } catch { /* sin almacenamiento */ }
}

// ---------------------------------------------------------------- turno y registro (lo decide el Máster)
export const esJugador = (c: Combatiente) => c.bando === 'jugador'

/** Casillas que le quedan en este turno; null si su movimiento es «¿?». */
export const movimientoRestante = (c: Combatiente) => (c.movimiento == null ? null : Math.max(0, c.movimiento - (c.movUsado ?? 0)))

/** Gasta (+) o devuelve (−) casillas de movimiento sin bajar de 0. */
export const gastarMovimiento = (c: Combatiente, casillas: number): Combatiente => ({ ...c, movUsado: Math.max(0, (c.movUsado ?? 0) + casillas) })

/** Empieza un turno nuevo: movimiento y acción vuelven a estar disponibles. */
export const nuevoTurno = (c: Combatiente): Combatiente => ({ ...c, movUsado: 0, accionUsada: false })

const CLAVE_REGISTRO = 'terratea-registro'
export function leerRegistro(): string[] {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE_REGISTRO) ?? '[]')
    return Array.isArray(l) ? l.filter((x): x is string => typeof x === 'string').slice(-200) : []
  } catch { return [] }
}
export function guardarRegistro(l: string[]) {
  try { localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(l.slice(-200))) } catch { /* sin almacenamiento */ }
}
