import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { deidadesData, gremiosData, npcsData, razaDeTexto, tirarColorAstral } from './mundo'

const publico = (ruta: string) => existsSync(`public/img/libro2/${ruta.replace(/^img\//, '')}`)

describe('datos del libro 2 (mundo)', () => {
  it('trae los recuentos del libro', () => {
    expect(npcsData.npcs).toHaveLength(93)
    expect(gremiosData.gremios).toHaveLength(6)
    expect(deidadesData.deidades).toHaveLength(145)
  })
  it('todas las imágenes existen', () => {
    for (const n of npcsData.npcs) if (n.imagen) expect(publico(n.imagen), n.id).toBe(true)
    for (const g of gremiosData.gremios) if (g.emblema) expect(publico(g.emblema), g.id).toBe(true)
    for (const d of deidadesData.deidades) expect(publico(d.simbolo), d.id).toBe(true)
  })
  it('cada PNJ pertenece a un reino y cada deidad a un grupo existentes', () => {
    const reinos = new Set(npcsData.reinos.map((r) => r.id))
    for (const n of npcsData.npcs) expect(reinos.has(n.reino), n.id).toBe(true)
    const grupos = new Set(deidadesData.grupos.map((g) => g.id))
    for (const d of deidadesData.deidades) expect(grupos.has(d.grupo), d.id).toBe(true)
  })
  it('la tabla de colores astrales cubre el d10', () => {
    expect(deidadesData.colores_astrales.map((c) => c.tirada)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(tirarColorAstral(() => 0).tirada).toBe(1)
    expect(tirarColorAstral(() => 0.999).tirada).toBe(10)
  })
})

describe('razaDeTexto', () => {
  it('enlaza razas con género, tildes y puntos', () => {
    expect(razaDeTexto('Semielfa')).toBe('semielfo')
    expect(razaDeTexto('Elfa Oscura')).toBe('elfo-oscuro')
    expect(razaDeTexto('Sátira')).toBe('satiro')
    expect(razaDeTexto('Humano.')).toBe('humano')
    expect(razaDeTexto('Humano Renegado (Hombre-lobo)')).toBe('renegado')
    expect(razaDeTexto('Autómata')).toBe('automata')
  })
  it('no enlaza lo que no coincide', () => {
    expect(razaDeTexto('Desconocido.')).toBeNull()
    expect(razaDeTexto(null)).toBeNull()
  })
  it('todas las razas de PNJ y gremios o enlazan o son desconocidas', () => {
    const textos = [...npcsData.npcs.map((n) => n.raza), ...gremiosData.gremios.flatMap((g) => g.miembros.map((m) => m.raza))]
    const sin = [...new Set(textos.filter((t) => t && !razaDeTexto(t)))]
    expect(sin).toEqual(['Desconocido.'])
  })
})
