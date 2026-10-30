import { describe, expect, it } from 'vitest'
import {
  aporteCA, calcularCA, costeEnCobre, fmtCobre, vitalidadInicial, modificador, requisitosAtributo, requisitosCumplidos,
  requisitosTexto, tirar7, tirarFortuna, tirarVitalidad, totalSinMenor,
} from './reglas'
import { armaduras, clasePorId } from './datos'
import type { Armadura } from '../data/types'

describe('modificadores (el JSON perdió los signos negativos)', () => {
  const casos: [Parameters<typeof modificador>[0], number, number][] = [
    ['fuerza', 3, -3], ['fuerza', 4, -2], ['fuerza', 5, -2], ['fuerza', 6, -1], ['fuerza', 9, -1],
    ['fuerza', 10, 0], ['fuerza', 12, 0], ['fuerza', 13, 1], ['fuerza', 15, 1], ['fuerza', 16, 2],
    ['fuerza', 17, 2], ['fuerza', 18, 3], ['fuerza', 20, 3],
    ['destreza', 3, -3], ['destreza', 11, 0], ['destreza', 14, 1],
    ['constitucion', 8, -1], ['constitucion', 9, 0], ['constitucion', 12, 0],
    ['inteligencia', 3, -1], ['inteligencia', 5, -1], ['inteligencia', 6, 0], ['inteligencia', 13, 1], ['inteligencia', 18, 3],
    ['sabiduria', 12, 0], ['sabiduria', 13, 1],
    ['carisma', 10, 0], ['carisma', 13, 0], ['carisma', 14, 1], ['carisma', 17, 2], ['carisma', 18, 3],
  ]
  it.each(casos)('%s %i → %i', (id, punt, esperado) => {
    expect(modificador(id, punt)).toBe(esperado)
  })

  it('Sabiduría 9: el libro solapa 6-9 y 9-12; se aplica el primer rango (-1)', () => {
    expect(modificador('sabiduria', 9)).toBe(-1)
  })
})

describe('monedas', () => {
  it('parsea costes del libro', () => {
    expect(costeEnCobre('25 M.O.')).toBe(2500)
    expect(costeEnCobre('15\nM.O.')).toBe(1500)
    expect(costeEnCobre('7 M.O.\n5 M.P.')).toBe(750) // precio con dos monedas
    expect(costeEnCobre('2 M.O\n5 M.P')).toBe(250)
    expect(costeEnCobre('6 M.P.')).toBe(60)
    expect(costeEnCobre('5 M.C.')).toBe(5)
    expect(costeEnCobre('10 M.O')).toBe(1000) // sin el último punto, como en Pólvora
    expect(costeEnCobre(undefined)).toBeNull()
    expect(costeEnCobre('gratis')).toBeNull()
  })
  it('formatea', () => {
    expect(fmtCobre(2500)).toBe('25 M.O.')
    expect(fmtCobre(0)).toBe('0 M.C.')
    expect(fmtCobre(1234)).toBe('12 M.O. 3 M.P. 4 M.C.')
  })
})

describe('C.A.', () => {
  const pieza = (clase_armadura: string) => ({ nombre: 'x', clase_armadura }) as Armadura
  it('sin armadura es 9', () => expect(calcularCA([])).toBe(9))
  it('ejemplo del libro: -5,87 → -5 → C.A. 4', () => {
    expect(calcularCA([pieza('Pecho: -3\nPierna: -2,87')])).toBe(4)
  })
  it('keikogi (-0,35) trunca a 0', () => {
    const k = armaduras.find((a) => a.nombre === 'KEIKOGI')!
    expect(aporteCA(k)).toBeCloseTo(-0.35)
    expect(calcularCA([k])).toBe(9)
  })
  it('armadura acolchada (-1,05) → 8', () => {
    expect(calcularCA([armaduras.find((a) => a.nombre === 'ARMADURA ACOLCHADA')!])).toBe(8)
  })
})

describe('dados', () => {
  it('4D6 sin el menor: siempre entre 3 y 18 y con dados 1-6', () => {
    for (let n = 0; n < 500; n++) {
      const rolls = tirar7()
      expect(rolls).toHaveLength(7)
      for (const dados of rolls) {
        expect(dados).toHaveLength(4)
        dados.forEach((d) => { expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(6) })
        const t = totalSinMenor(dados)
        expect(t).toBeGreaterThanOrEqual(3)
        expect(t).toBeLessThanOrEqual(18)
      }
    }
  })
  it('totalSinMenor descarta solo el más bajo', () => expect(totalSinMenor([5, 1, 3, 6])).toBe(14))
  it('fortuna 1D20/1D8/1D6 y vitalidad 1D12', () => {
    for (let n = 0; n < 500; n++) {
      const f = tirarFortuna(), v = tirarVitalidad()
      expect(f.oro).toBeGreaterThanOrEqual(1); expect(f.oro).toBeLessThanOrEqual(20)
      expect(f.plata).toBeGreaterThanOrEqual(1); expect(f.plata).toBeLessThanOrEqual(8)
      expect(f.cobre).toBeGreaterThanOrEqual(1); expect(f.cobre).toBeLessThanOrEqual(6)
      expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(12)
    }
  })
})

describe('requisitos de clase', () => {
  it('alquimista: 12 Sabiduría y 10 Inteligencia', () => {
    const c = clasePorId('alquimista')!
    expect(requisitosCumplidos(c, { sabiduria: 12, inteligencia: 10 })).toBe(true)
    expect(requisitosCumplidos(c, { sabiduria: 11, inteligencia: 18 })).toBe(false)
    expect(requisitosCumplidos(c, {})).toBe(false)
  })
  it('samurai: separa requisitos de atributo de los textos mal clasificados', () => {
    const c = clasePorId('samurai')!
    expect(requisitosAtributo(c)).toHaveLength(3)
    expect(requisitosTexto(c).length).toBeGreaterThan(0)
  })
  it('guerrero sin requisitos siempre cumple', () => {
    expect(requisitosCumplidos(clasePorId('guerrero')!, {})).toBe(true)
  })
})

describe('vitalidadInicial', () => {
  it('aplica el mínimo 3 al dado y luego suma el modificador de Constitución (como el backend)', () => {
    expect(vitalidadInicial(1, -1)).toBe(2) // max(1,3) + (-1), no max(3, 1 - 1)
    expect(vitalidadInicial(2, 0)).toBe(3)
    expect(vitalidadInicial(8, 2)).toBe(10)
    expect(vitalidadInicial(12, -2)).toBe(10)
  })
})
