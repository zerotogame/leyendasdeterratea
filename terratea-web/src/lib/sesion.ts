import { armas, armaduras, objetos, clasePorId, clasesParaRaza, razaPorId, claveRaza } from './datos'
import { IDS_ATRIBUTO, type Monedas } from './reglas'
import type { Asignacion, Compra } from './personajes'

export type Estado = {
  nombre: string
  razaId: string
  subrazaId: string
  claseId: string
  pool: number[]
  asignacion: Asignacion
  fortuna: Monedas | null
  vida: number | null
  compras: Compra[]
  /** true mientras se teclean tiradas de dados físicos sin confirmar */
  editando: boolean
}

// Lo que se tira y se compra queda fijado por combinación raza + clase: así «empezar de nuevo»
// o cambiar de opción y volver no permite repetir tiradas.
export type Datos = Pick<Estado, 'pool' | 'asignacion' | 'fortuna' | 'vida' | 'compras' | 'editando'>
export type Guardado = Omit<Estado, keyof Datos> & { guardados: Record<string, Datos> }

export const DATOS_VACIOS: Datos = { pool: [], asignacion: {}, fortuna: null, vida: null, compras: [], editando: false }
export const CLAVES_DATOS = Object.keys(DATOS_VACIOS) as (keyof Datos)[]
export const INICIAL: Guardado = { nombre: '', razaId: '', subrazaId: '', claseId: '', guardados: {} }
export const CLAVE = 'terratea-creador'

export const claveCombo = (g: Pick<Estado, 'razaId' | 'subrazaId' | 'claseId'>) =>
  g.razaId && g.claseId ? `${claveRaza(g.razaId, g.subrazaId)}|${g.claseId}` : ''

const entero = (x: unknown, min: number, max: number): x is number =>
  typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max

const catalogo = { arma: armas, armadura: armaduras, objeto: objetos }

/**
 * Deja solo lo que sea posible en el juego. Todo lo guardado en el navegador puede estar
 * corrupto o venir de una versión anterior: lo inválido se descarta para que el jugador
 * nunca quede atrapado en una combinación con datos imposibles.
 */
export function validarDatos(raw: unknown): Datos {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const d: Datos = { ...DATOS_VACIOS }

  if (Array.isArray(r.pool) && r.pool.length === 7 && r.pool.every((x) => entero(x, 3, 18))) {
    d.pool = r.pool as number[]
    d.editando = r.editando === true
    // Siete 10 son los valores de ejemplo de la entrada manual, nunca confirmados.
    if (d.pool.every((x) => x === 10) && !r.fortuna) d.editando = true
  }

  const a = r.asignacion as Record<string, unknown> | undefined
  if (d.pool.length === 7 && a && typeof a === 'object') {
    const idx = Object.entries(a)
    const ok = idx.every(([id, i]) => (IDS_ATRIBUTO as string[]).includes(id) && entero(i, 0, 6))
      && new Set(idx.map(([, i]) => i)).size === idx.length
    if (ok) d.asignacion = a as Asignacion
  }

  const f = r.fortuna as Partial<Monedas> | null | undefined
  if (f && entero(f.oro, 1, 20) && entero(f.plata, 1, 8) && entero(f.cobre, 1, 6)) {
    d.fortuna = { oro: f.oro, plata: f.plata, cobre: f.cobre }
    if (Array.isArray(r.compras)) {
      d.compras = r.compras.filter((c): c is Compra =>
        !!c && c.tipo in catalogo && entero(c.idx, 0, catalogo[c.tipo as Compra['tipo']].length - 1))
    }
  }
  if (entero(r.vida, 1, 12)) d.vida = r.vida
  return d
}

export function normalizarGuardado(raw: unknown): Guardado {
  if (!raw || typeof raw !== 'object') return INICIAL
  const v = raw as Record<string, unknown>
  const texto = (x: unknown) => (typeof x === 'string' ? x : '')
  const g: Guardado = {
    nombre: texto(v.nombre), razaId: texto(v.razaId), subrazaId: texto(v.subrazaId), claseId: texto(v.claseId),
    guardados: {},
  }

  // selección actual: raza y subraza existentes, clase permitida para esa raza
  const raza = razaPorId(g.razaId)
  if (!raza) { g.razaId = ''; g.subrazaId = ''; g.claseId = '' }
  else if (!raza.subrazas?.some((s) => s.id === g.subrazaId)) g.subrazaId = ''
  if (g.razaId && !clasePorId(g.claseId)) g.claseId = ''
  if (g.razaId && g.claseId && !clasesParaRaza(g.razaId, g.subrazaId).some((c) => c.id === g.claseId)) g.claseId = ''

  const gu = v.guardados && typeof v.guardados === 'object' ? (v.guardados as Record<string, unknown>) : {}
  for (const [k, d] of Object.entries(gu)) g.guardados[k] = validarDatos(d)

  // formato anterior: las tiradas colgaban de la raíz
  const k = claveCombo(g)
  if (k && !g.guardados[k] && Array.isArray(v.pool) && v.pool.length) g.guardados[k] = validarDatos(v)
  return g
}
