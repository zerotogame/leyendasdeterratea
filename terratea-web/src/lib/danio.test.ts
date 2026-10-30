import { describe, expect, it } from 'vitest'
import { actuaA0, alcanceMaximo, bonoDeExtra, condicionDe, cumpleCondicion, relevanteEnCombate, textoCondicion, bonoDeTexto, curaMitad, infoHabilidad, resolverDano, tirarExpresion } from './danio'
import { clases } from './datos'

describe('daño', () => {
  it('resistente, vulnerable e inmune (reglas del Libro 1)', () => {
    expect(resolverDano(10, 0, 'normal', 0).final).toBe(10)
    expect(resolverDano(10, 0, 'resistente', 0).final).toBe(5)
    expect(resolverDano(10, 0, 'vulnerable', 0).final).toBe(20)
    expect(resolverDano(10, 5, 'inmune', 0).final).toBe(0)
    expect(resolverDano(9, 0, 'resistente', 0).final).toBe(4)
  })
  it('suma bonos antes del multiplicador y resta la reducción después sin bajar de 0', () => {
    expect(resolverDano(7, 2, 'resistente', 0).final).toBe(4)
    expect(resolverDano(7, 2, 'normal', 3).final).toBe(6)
    expect(resolverDano(2, 0, 'normal', 9).final).toBe(0)
  })
  it('cura la mitad hacia abajo', () => {
    expect(curaMitad(9)).toBe(4)
    expect(curaMitad(0)).toBe(0)
  })
  it('lee bonos de daño de textos reales de habilidades', () => {
    expect(bonoDeTexto('Aumenta +2 el daño del ataque si el objetivo tiene un nivel igual o menor')).toBe(2)
    expect(bonoDeTexto('aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo')).toBe(1)
    expect(bonoDeTexto('su modificador de destreza aumenta en +3 y su daño en +2')).toBe(2)
    expect(bonoDeTexto('aumenta temporalmente su daño en +3 y su modificador de constitución en +3')).toBe(3)
    expect(bonoDeTexto('bonificación de +2 al daño')).toBe(2)
    expect(bonoDeTexto('bonificación de +5 en las tiradas de salvación')).toBeNull()
  })
  it('Badwolf (Berserker): Éxtasis de Batalla cura la mitad y los bonos salen del libro', () => {
    const b = clases.find((c) => c.id === 'berserker')!
    const hs = b.habilidades.map((h) => infoHabilidad(h.nombre, h.descripcion))
    expect(hs.filter((h) => h.curaMitad).map((h) => h.nombre)).toHaveLength(1)
    expect(hs.filter((h) => h.bonoDano != null).length).toBeGreaterThanOrEqual(4)
  })
  it('bono de un extra de la ficha', () => {
    expect(bonoDeExtra('+1 Daño por oscuridad')).toBe(1)
    expect(bonoDeExtra('+1 Tirada aprendizaje')).toBeNull()
    expect(bonoDeExtra('Cerveza arcana')).toBeNull()
  })
  it('alcance máximo', () => {
    expect(alcanceMaximo('1-2')).toBe(2)
    expect(alcanceMaximo('7')).toBe(7)
    expect(alcanceMaximo('1-4 (Forma Humanoide)')).toBeNull()
    expect(alcanceMaximo(undefined)).toBeNull()
  })
  it('tira expresiones de dados', () => {
    const casi1 = () => 0, casi_max = () => 0.999
    expect(tirarExpresion('2D4', casi1)).toEqual({ total: 2, detalle: '2D4 [1, 1]' })
    expect(tirarExpresion('1D6 + 2D20', casi_max)?.total).toBe(6 + 40)
    expect(tirarExpresion('1d8 + 2', casi1)?.total).toBe(3)
    expect(tirarExpresion('Garras', casi1)).toBeNull()
    expect(tirarExpresion('', casi1)).toBeNull()
  })

  it('pasivas de Berserker: qué condición tiene cada una', () => {
    const b = clases.find((c) => c.id === 'berserker')!
    const h = (n: string) => b.habilidades.find((x) => x.nombre.includes(n))!
    expect(condicionDe(h('Brutalidad').descripcion)).toBe('depende')
    expect(textoCondicion(h('Brutalidad').descripcion)).toMatch(/^si el objetivo tiene un nivel/)
    expect(condicionDe(h('Experto en Combate Cuerpo').descripcion)).toBe('depende')
    expect(condicionDe(h('Furia de Supervivencia').descripcion)).toBe('danado')
    expect(condicionDe(h('Furor').descripcion)).toBe('cero')
    expect(condicionDe('Aumenta +1 el daño')).toBe('ninguna')
  })
  it('comprueba la condición con la vida del combatiente', () => {
    expect(cumpleCondicion('danado', { vida: 60, vidaMax: 71 })).toBe(true)
    expect(cumpleCondicion('danado', { vida: 71, vidaMax: 71 })).toBe(false)
    expect(cumpleCondicion('danado', { vida: 5, vidaMax: null })).toBeNull()
    expect(cumpleCondicion('cero', { vida: 0, vidaMax: 71 })).toBe(true)
    expect(cumpleCondicion('cero', { vida: 3, vidaMax: 71 })).toBe(false)
    expect(cumpleCondicion('depende', { vida: 3, vidaMax: 71 })).toBeNull()
    expect(cumpleCondicion('ninguna', { vida: 3, vidaMax: 71 })).toBe(true)
  })
  it('recordatorios y combate a 0 de vida (Frenesí asesino)', () => {
    const b = clases.find((c) => c.id === 'berserker')!
    const hs = b.habilidades.map((x) => infoHabilidad(x.nombre, x.descripcion, x.tipo))
    expect(hs.filter(relevanteEnCombate).map((x) => x.nombre)).toContain('Experto en Armas de Mano a Mano')
    expect(actuaA0({ habilidades: hs })).toBe(true)
    expect(actuaA0({ habilidades: [] })).toBe(false)
  })
})
