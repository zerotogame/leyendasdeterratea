import { describe, expect, it } from 'vitest'
import { nivelDeGremio, nivelesGremio, rankingGremios, rankingLibro } from './nivelesGremio'

describe('niveles de gremio (Libro 1)', () => {
  it('trae los 11 niveles del 0 al 10 y los 7 criterios del ranking', () => {
    expect(nivelesGremio.map((n) => n.nivel)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(rankingLibro.criterios).toHaveLength(7)
  })
  it('el nivel coincide con las estrellas y se acota a 0-10', () => {
    expect(nivelDeGremio(0).nombre).toBe('Nuevo Gremio')
    expect(nivelDeGremio(4).nombre).toBe('Gremio Aventureros')
    expect(nivelDeGremio(10).nombre).toBe('Gremio de Leyenda')
    expect(nivelDeGremio(99).nivel).toBe(10)
    expect(nivelDeGremio(-3).nivel).toBe(0)
  })
  it('cada nivel salvo el 0 tiene ventajas', () => {
    for (const n of nivelesGremio.slice(1)) expect(n.ventajas.length, n.nombre).toBeGreaterThan(0)
  })
})

describe('ranking de gremios', () => {
  const g = (name: string, stars: number, reputation: number) => ({ name, stars, reputation })
  it('ordena por nivel, luego reputación, luego nombre', () => {
    const r = rankingGremios([g('B', 2, 50), g('A', 2, 80), g('C', 5, 10), g('D', 0, 0)])
    expect(r.map((x) => x.name)).toEqual(['C', 'A', 'B', 'D'])
    expect(r.map((x) => x.puesto)).toEqual([1, 2, 3, 4])
  })
  it('los empatados comparten puesto y el siguiente lo salta', () => {
    const r = rankingGremios([g('B', 3, 40), g('A', 3, 40), g('C', 1, 0)])
    expect(r.map((x) => [x.name, x.puesto])).toEqual([['A', 1], ['B', 1], ['C', 3]])
  })
  it('no muta la lista de entrada y acepta lista vacía', () => {
    const l = [g('B', 1, 0), g('A', 9, 0)]
    rankingGremios(l)
    expect(l[0].name).toBe('B')
    expect(rankingGremios([])).toEqual([])
  })
})
