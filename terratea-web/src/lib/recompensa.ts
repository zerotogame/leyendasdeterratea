import { criaturas, sumaPx } from './bestiario'
import { esJugador, type Combatiente } from './combate'
import { darExperiencia, sumarMonedas, type PersonajeBd } from './sync'

export type Premio = { exp: number; oro: number; plata: number; cobre: number }
export const SIN_PREMIO: Premio = { exp: 0, oro: 0, plata: 0, cobre: 0 }
export const hayPremio = (p: Premio) => p.exp > 0 || p.oro > 0 || p.plata > 0 || p.cobre > 0

/** El backend no admite más de 10 000 P.X. por llamada. */
export const MAX_EXP_POR_LLAMADA = 10000
export function trocear(total: number, max = MAX_EXP_POR_LLAMADA): number[] {
  const partes: number[] = []
  for (let resto = Math.floor(total); resto > 0; resto -= max) partes.push(Math.min(resto, max))
  return partes
}

/** Entero ≥ 0 a partir de lo que se escribe en un campo. */
export const cantidad = (v: string) => Math.max(0, Math.floor(Number(v) || 0))

/** P.X. del bestiario de los enemigos que están a 0 de vida (solo una pista: el reparto lo decide el Máster). */
export function pxDerrotados(combate: Combatiente[]) {
  const caidos = combate.filter((c) => !esJugador(c) && c.vida <= 0)
  return sumaPx(caidos.flatMap((c) => criaturas.filter((x) => x.id === c.criaturaId)))
}

export type ResultadoPremio = { niveles: number; ficha: PersonajeBd | null }

/** Guarda el premio en la ficha de la BD: primero la experiencia (puede subir nivel) y luego las monedas. */
export async function aplicarPremio(fichaId: number, p: Premio): Promise<ResultadoPremio> {
  let ficha: PersonajeBd | null = null
  let niveles = 0
  for (const parte of trocear(p.exp)) {
    const r = await darExperiencia(fichaId, parte)
    niveles += r.levels_gained
    ficha = r
  }
  if (p.oro > 0 || p.plata > 0 || p.cobre > 0) ficha = await sumarMonedas(fichaId, p)
  return { niveles, ficha }
}
