import { beforeEach, describe, expect, it } from 'vitest'
import { borrarPersonaje, guardarPersonaje, listarPersonajes, obtenerPersonaje, puntuacionesDe, type DatosFicha } from './personajes'

const datos: DatosFicha = {
  nombre: 'Grok', razaId: 'goblin', subrazaId: '', claseId: 'alquimista',
  pool: [13, 17, 12, 12, 11, 9, 15],
  asignacion: { fuerza: 0, destreza: 1, constitucion: 2, inteligencia: 3, sabiduria: 4, carisma: 6 },
  fortuna: { oro: 5, plata: 3, cobre: 2 }, vida: 7, compras: [],
}

beforeEach(() => localStorage.clear())

describe('personajes guardados', () => {
  it('guarda, lista, obtiene y borra', () => {
    const a = guardarPersonaje(datos)
    const b = guardarPersonaje({ ...datos, nombre: 'Otro' })
    expect(a.id).not.toBe(b.id)
    expect(listarPersonajes().map((p) => p.nombre)).toEqual(['Otro', 'Grok'])
    expect(obtenerPersonaje(a.id)?.nombre).toBe('Grok')
    borrarPersonaje(a.id)
    expect(listarPersonajes().map((p) => p.nombre)).toEqual(['Otro'])
  })

  it('JSON corrupto o de otro tipo → lista vacía, sin romper', () => {
    localStorage.setItem('terratea-personajes', '{no es json')
    expect(listarPersonajes()).toEqual([])
    localStorage.setItem('terratea-personajes', '{"a":1}')
    expect(listarPersonajes()).toEqual([])
  })

  it('puntuacionesDe asigna la tirada elegida a cada atributo', () => {
    expect(puntuacionesDe(datos)).toEqual({ fuerza: 13, destreza: 17, constitucion: 12, inteligencia: 12, sabiduria: 11, carisma: 15 })
  })
})
