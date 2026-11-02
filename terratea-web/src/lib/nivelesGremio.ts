import datos from '../data/gremio_niveles.json'

export type NivelGremio = { nivel: number; nombre: string; descripcion: string; ventajas: string[] }

export const nivelesGremio = datos.niveles as NivelGremio[]
export const introNiveles = datos.niveles_introduccion
export const rankingLibro = datos.ranking as { introduccion: string; criterios: { campo: string; descripcion: string }[]; cierre: string }

/** Nivel del libro (0-10) de un gremio: coincide con sus estrellas. */
export const nivelDeGremio = (estrellas: number): NivelGremio =>
  nivelesGremio[Math.min(Math.max(Math.trunc(estrellas) || 0, 0), nivelesGremio.length - 1)]

/**
 * Ordena por nivel y, a igualdad, por reputación (el libro no da una fórmula del ranking;
 * sus criterios son cualitativos). Los empatados comparten puesto.
 */
export function rankingGremios<T extends { name: string; stars: number; reputation: number }>(gremios: T[]): (T & { puesto: number })[] {
  const orden = [...gremios].sort((a, b) =>
    b.stars - a.stars || b.reputation - a.reputation || a.name.localeCompare(b.name, 'es'))
  const res: (T & { puesto: number })[] = []
  orden.forEach((g, i) => {
    const previo = res[i - 1]
    const empata = previo && previo.stars === g.stars && previo.reputation === g.reputation
    res.push({ ...g, puesto: empata ? previo.puesto : i + 1 })
  })
  return res
}
