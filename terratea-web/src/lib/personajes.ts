import { armas, armaduras, objetos } from './datos'
import { IDS_ATRIBUTO, costeEnCobre, type Monedas, type Puntuaciones } from './reglas'
import type { AtributoId } from '../data/types'

export type Asignacion = Partial<Record<AtributoId, number>> // atributo → índice en `pool`
export type Compra = { tipo: 'arma' | 'armadura' | 'objeto'; idx: number }

/** Todo lo necesario para dibujar una ficha. */
export type DatosFicha = {
  nombre: string
  razaId: string
  subrazaId: string
  claseId: string
  pool: number[]
  asignacion: Asignacion
  fortuna: Monedas | null
  vida: number | null
  compras: Compra[]
}

/** `bdId` es el id en la base de datos; sin él, el personaje solo está en este navegador. */
export type Personaje = DatosFicha & { id: string; creado: number; bdId?: number }

export const itemCompra = (c: Compra) => (c.tipo === 'arma' ? armas : c.tipo === 'armadura' ? armaduras : objetos)[c.idx]
export const nombreCompra = (c: Compra) => itemCompra(c).nombre
export const costeCompra = (c: Compra) => costeEnCobre(itemCompra(c).coste)

export const puntuacionesDe = (d: Pick<DatosFicha, 'pool' | 'asignacion'>): Puntuaciones => {
  const p: Puntuaciones = {}
  for (const id of IDS_ATRIBUTO) {
    const i = d.asignacion[id]
    if (i != null && d.pool[i] != null) p[id] = d.pool[i]
  }
  return p
}

// ---------- almacenamiento local de personajes guardados ----------
const CLAVE = 'terratea-personajes'

export const listarPersonajes = (): Personaje[] => {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(l) ? l : []
  } catch { return [] }
}

const escribir = (l: Personaje[]) => {
  try { localStorage.setItem(CLAVE, JSON.stringify(l)) } catch { /* sin almacenamiento */ }
}

export const obtenerPersonaje = (id: string) => listarPersonajes().find((p) => p.id === id)

export const guardarPersonaje = (d: DatosFicha): Personaje => {
  const p: Personaje = { ...d, id: crypto.randomUUID(), creado: Date.now() }
  escribir([p, ...listarPersonajes()])
  return p
}

export const marcarEnBd = (id: string, bdId: number) =>
  escribir(listarPersonajes().map((p) => (p.id === id ? { ...p, bdId } : p)))

export const borrarPersonaje = (id: string) => escribir(listarPersonajes().filter((p) => p.id !== id))
