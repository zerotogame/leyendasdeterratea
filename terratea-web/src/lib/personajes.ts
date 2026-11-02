import { armas, armaduras, objetos, joyeria, libros, ropajes, gemas, metales, telas } from './datos'
import { IDS_ATRIBUTO, costeEnCobre, type Monedas, type Puntuaciones } from './reglas'
import type { AtributoId } from '../data/types'

export type Asignacion = Partial<Record<AtributoId, number>> // atributo → índice en `pool`
export type Compra = { tipo: 'arma' | 'armadura' | 'objeto' | 'joyeria' | 'libro' | 'ropaje' | 'gema' | 'metal' | 'tela'; idx: number }

/** Catálogo de la tienda de cada tipo de compra; `idx` es la posición dentro de él. */
export const CATALOGO_COMPRA = { arma: armas, armadura: armaduras, objeto: objetos, joyeria, libro: libros, ropaje: ropajes, gema: gemas, metal: metales, tela: telas }

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

export const itemCompra = (c: Compra) => CATALOGO_COMPRA[c.tipo][c.idx]
export const nombreCompra = (c: Compra) => itemCompra(c).nombre
/** Precio en texto: las gemas lo traen como «valor»; metales y telas no tienen precio en el libro. */
export const precioDe = (it: Record<string, string | undefined>) => it.coste ?? it.valor
export const costeCompra = (c: Compra) => costeEnCobre(precioDe(itemCompra(c)))

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
