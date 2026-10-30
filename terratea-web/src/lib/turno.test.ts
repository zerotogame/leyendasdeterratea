import { beforeEach, describe, expect, it } from 'vitest'
import { gastarMovimiento, guardarCombate, guardarRegistro, leerCombate, leerRegistro, movimientoRestante, nuevoTurno, type Combatiente } from './combate'

const c: Combatiente = { uid: 'a', criaturaId: '', nombre: 'a', vidaMax: 10, vida: 10, ca: null, movimiento: 4, alcance: 1 }
beforeEach(() => localStorage.clear())

describe('turno', () => {
  it('gastar y devolver movimiento sin pasarse de 0', () => {
    expect(movimientoRestante(gastarMovimiento(c, 3))).toBe(1)
    expect(movimientoRestante(gastarMovimiento(gastarMovimiento(c, 3), -9))).toBe(4)
    expect(movimientoRestante(gastarMovimiento(c, 9))).toBe(0)
    expect(movimientoRestante({ ...c, movimiento: null })).toBeNull()
  })
  it('turno nuevo restaura movimiento y acción', () => {
    const t = nuevoTurno({ ...c, movUsado: 3, accionUsada: true })
    expect([t.movUsado, t.accionUsada]).toEqual([0, false])
  })
  it('persiste jugadores y registro; datos rotos se ignoran', () => {
    const l = [{ ...c, bando: 'jugador' as const, movUsado: 2, accionUsada: true }]
    guardarCombate(l)
    expect(leerCombate()).toEqual(l)
    guardarRegistro(['x'])
    expect(leerRegistro()).toEqual(['x'])
    localStorage.setItem('terratea-registro', '{roto')
    expect(leerRegistro()).toEqual([])
  })
})
