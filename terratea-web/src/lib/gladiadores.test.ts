import { describe, expect, it } from 'vitest'
import { ranking, romano, type Edicion } from './gladiadores'

const ed = (resultados: Edicion['resultados']): Edicion => ({ numero: 1, anio: null, estado: 'celebrada', resultados, cronica: '' })

describe('gladiadores', () => {
  it('suma 5/3/1 y ordena por puntos', () => {
    const r = ranking([
      ed([{ juego: 'a', puesto: 'oro', gladiador: 'X' }, { juego: 'a', puesto: 'plata', gladiador: 'Y' }]),
      ed([{ juego: 'a', puesto: 'plata', gladiador: 'X' }, { juego: 'a', puesto: 'bronce', gladiador: 'Y' }]),
    ], 'gladiador')
    expect(r.map((f) => [f.nombre, f.puntos])).toEqual([['X', 8], ['Y', 4]])
  })

  it('filtra por juego y agrupa por gremio', () => {
    const r = ranking([ed([
      { juego: 'a', puesto: 'oro', gladiador: 'X', gremio: 'G' },
      { juego: 'b', puesto: 'oro', gladiador: 'Y', gremio: 'G' },
    ])], 'gremio', 'a')
    expect(r).toHaveLength(1)
    expect(r[0].puntos).toBe(5)
  })

  it('numera en romano', () => {
    expect([1, 2, 3, 4, 6, 9, 10].map(romano)).toEqual(['I', 'II', 'III', 'IV', 'VI', 'IX', 'X'])
  })
})
