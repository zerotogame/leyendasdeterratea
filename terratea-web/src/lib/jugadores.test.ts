import { describe, expect, it } from 'vitest'
import { combatienteDeFicha } from './jugadores'
import type { PersonajeBd } from './sync'

const badwolf = {
  id: 4, name: 'Badwolf Paulaner Heineken', race: 'Humano', class: 'Berserker', level: 11, exp: 0, required_experience: null, images: [],
  hit_points: 71, armor_class: 9, range_reach: '1-2', gold: 0, silver: 0, copper: 0, attributes: { Fuerza: { value: 14, modifier: 1 }, Destreza: { value: 13, modifier: 1 }, 'Constitución': { value: 14, modifier: 1 } }, rollSalvations: {},
  rollMovements: { Base: 4, Combate: 4 }, inventory: [], specialSkills: ['+1 Daño por oscuridad'], extraAttributes: ['Cerveza arcana'],
  weapons: [{ slot: 1, name: 'Tomahok', damage: '2D4', total: null, special: 'Contundente', hands: 2, weight: '1/2' }, { slot: 2, name: 'Vacía', total: null, special: null, hands: null, weight: null }],
} as unknown as PersonajeBd

describe('ficha → combatiente', () => {
  const c = combatienteDeFicha(badwolf)
  it('copia vida, C.A., movimiento de combate y alcance máximo', () => {
    expect([c.nombre, c.vida, c.vidaMax, c.ca, c.movimiento, c.alcance, c.bando, c.fichaId]).toEqual(['Badwolf', 71, 71, 9, 4, 2, 'jugador', 4])
  })
  it('modificadores de Fuerza, Destreza y Constitución y extras de la ficha', () => {
    expect(c.mods).toEqual({ fuerza: 1, destreza: 1, constitucion: 1 })
    expect(c.extras).toEqual(['+1 Daño por oscuridad', 'Cerveza arcana'])
  })
  it('marca qué habilidades son activas', () => {
    expect(c.habilidades!.find((h) => /Lanzahachas/.test(h.nombre))?.activa).toBe(true)
    expect(c.habilidades!.find((h) => /Brutalidad/.test(h.nombre))?.activa).toBe(false)
  })
  it('armas con su daño (o sin dato)', () => {
    expect(c.armas).toEqual([{ nombre: 'Tomahok', dados: '2D4' }, { nombre: 'Vacía', dados: null }])
  })
  it('habilidades de nivel ≤ 11: tiene Éxtasis de Batalla (cura) y no tiene Ataque doble (nivel 12)', () => {
    expect(c.habilidades!.find((h) => h.curaMitad)?.nombre).toMatch(/xtasis de Batalla/)
    expect(c.habilidades!.some((h) => /Ataque doble/.test(h.nombre))).toBe(false)
    expect(c.habilidades!.filter((h) => h.bonoDano != null).length).toBeGreaterThan(0)
  })
})
