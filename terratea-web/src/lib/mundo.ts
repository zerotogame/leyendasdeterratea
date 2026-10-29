import npcsJson from '../data/libro2/npcs.json'
import gremiosJson from '../data/libro2/gremios_pnj.json'
import deidadesJson from '../data/libro2/deidades.json'
import type { DeidadesFile, GremiosPnjFile, NpcsFile } from '../data/libro2.types'
import { razas } from './datos'

export const npcsData = npcsJson as unknown as NpcsFile
export const gremiosData = gremiosJson as unknown as GremiosPnjFile
export const deidadesData = deidadesJson as unknown as DeidadesFile

export { img2 } from './bestiario'

const sinTildes = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Formas femeninas que el libro usa para PNJ y no existen como raza propia. */
const FEMENINOS: Record<string, string> = {
  elfa: 'elfo', 'elfa oscura': 'elfo oscuro', humana: 'humano', enana: 'enano', felina: 'felino',
  semielfa: 'semielfo', semiorca: 'semiorco', reptiliana: 'reptiliano', satira: 'satiro',
}

/**
 * Busca la raza del Libro 1 que corresponde al texto libre del libro 2
 * («Semielfa», «Humano Renegado (Hombre-lobo)»…). Devuelve null si el nombre no coincide.
 */
export function razaDeTexto(texto: string | null): string | null {
  if (!texto) return null
  let t = sinTildes(texto).replace(/\.$/, '').trim()
  if (t.includes('renegado')) return razas.some((r) => r.id === 'renegado') ? 'renegado' : null
  t = FEMENINOS[t] ?? t
  return razas.find((r) => sinTildes(r.nombre) === t)?.id ?? null
}

export const npcsDeReino = (reino: string) => npcsData.npcs.filter((n) => n.reino === reino)

/** Tirada del d10 de Colores Astrales; devuelve la fila de la tabla. */
export function tirarColorAstral(rng: () => number = Math.random) {
  const tirada = 1 + Math.floor(rng() * 10)
  return deidadesData.colores_astrales.find((c) => c.tirada === tirada)!
}

export const deidadesDeGrupo = (grupo: string) => deidadesData.deidades.filter((d) => d.grupo === grupo)
