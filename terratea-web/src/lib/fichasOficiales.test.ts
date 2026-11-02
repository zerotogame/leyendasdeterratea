import { describe, expect, it } from 'vitest'
import { clases, razas } from './datos'
import { combinacion, idFicha } from './fichasOficiales'

describe('fichas oficiales', () => {
  it('normaliza ids y nombres', () => {
    expect(idFicha('Elfo Oscuro')).toBe('elfo_oscuro')
    expect(idFicha('Autómata')).toBe('automata')
    expect(idFicha('ninja-kunoichi')).toBe('ninja')
  })
  it('cada clase tiene ficha con cada raza que tiene ficha', () => {
    const sinFicha = razas.filter((r) => !combinacion(r.id, clases[0].id)).map((r) => r.id)
    expect(sinFicha).toEqual(['renegado'])
    for (const r of razas.filter((r) => r.id !== 'renegado')) {
      for (const c of clases) expect(combinacion(r.id, c.id), `${r.id}__${c.id}`).toBeDefined()
    }
  })
})
