import mapa from '../data/fichas/fichas_combinaciones.json'

type Capa = { raza: string; clase: string; x: number; y: number; w: number; h: number }
export type Combinacion = { pc: Capa; imp: Capa }

export const LIENZO = { pc: { w: 3545, h: 1994 }, imp: { w: 2481, h: 1754 } } as const

// Los ids de datos/*.json difieren de los de las fichas en estos casos
const ALIAS: Record<string, string> = { ninja_kunoichi: 'ninja', nahiaride: 'nahiarade' }

/** Normaliza un id o nombre («Elfo Oscuro», «elfo-oscuro», «Autómata») al id de las fichas. */
export const idFicha = (s: string) => {
  const n = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[\s-]+/g, '_')
  return ALIAS[n] ?? n
}

export const comboId = (raza: string, clase: string) => `${idFicha(raza)}__${idFicha(clase)}`

/** Combinación oficial de raza + clase, o undefined si no existe (p. ej. Renegado). */
export const combinacion = (raza: string, clase: string): Combinacion | undefined =>
  (mapa as Record<string, Combinacion>)[comboId(raza, clase)]
