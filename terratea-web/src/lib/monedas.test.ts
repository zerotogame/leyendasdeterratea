import { describe, expect, it } from 'vitest'
import { restarMonedas } from './reglas'

describe('restarMonedas', () => {
  it('reparte el resto en oro/plata/cobre', () => {
    expect(restarMonedas({ oro: 2, plata: 0, cobre: 0 }, 35)).toEqual({ oro: 1, plata: 6, cobre: 5 })
  })
  it('permite quedarse a cero', () => {
    expect(restarMonedas({ oro: 1, plata: 0, cobre: 0 }, 100)).toEqual({ oro: 0, plata: 0, cobre: 0 })
  })
  it('devuelve null si no alcanza', () => {
    expect(restarMonedas({ oro: 0, plata: 1, cobre: 0 }, 11)).toBeNull()
  })
})
