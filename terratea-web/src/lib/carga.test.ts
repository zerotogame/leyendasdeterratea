import { describe, expect, it } from 'vitest'
import { pesoNum, cargaTotal } from './carga'

describe('pesoNum', () => {
  it('lee fracciones y decimales', () => {
    expect(pesoNum('1/2')).toBe(0.5)
    expect(pesoNum('½')).toBe(0.5)
    expect(pesoNum('1 1/2')).toBe(1.5)
    expect(pesoNum('0,5')).toBe(0.5)
    expect(pesoNum('2.00')).toBe(2)
    expect(pesoNum(null)).toBe(0)
  })
  it('suma armas con fracción', () => {
    expect(cargaTotal({ inventory: [{ weight_kg: '2.00', quantity: 2 }], weapons: [{ weight: '1/2' }, { weight: null }] } as never)).toBe(4.5)
  })
})
