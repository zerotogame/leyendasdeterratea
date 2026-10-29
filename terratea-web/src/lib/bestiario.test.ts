import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  FILTROS_VACIOS, aParams, categoriaInfo, criaturaPorId, criaturas, filtrar, fmtNum, generarEncuentro,
  leerFiltros, reglas, sumaPx, tirarDano,
} from './bestiario'
import { aplicarDano, añadirCombatientes, guardarCombate, leerCombate, nuevosCombatientes } from './combate'

const publico = (ruta: string) => existsSync(join(process.cwd(), 'public', 'img', 'libro2', ruta.replace(/^img\//, '')))
const secuencia = (...v: number[]) => { let i = 0; return () => v[i++ % v.length] }

describe('integridad del bestiario', () => {
  it('450 criaturas con id único y categoría válida', () => {
    expect(criaturas).toHaveLength(450)
    expect(new Set(criaturas.map((c) => c.id)).size).toBe(450)
    for (const c of criaturas) expect(categoriaInfo(c.categoria), c.id).toBeDefined()
  })
  it('los recuentos por categoría coinciden con las reglas', () => {
    for (const cat of reglas.categorias) expect(criaturas.filter((c) => c.categoria === cat.id).length).toBe(cat.total_criaturas)
  })
  it('todas las imágenes de criatura y de tipo existen', () => {
    for (const c of criaturas) expect(publico(c.imagen), c.imagen).toBe(true)
    for (const t of reglas.tipos) expect(publico(t.icono), t.icono).toBe(true)
    for (const c of reglas.categorias) expect(publico(c.portada), c.portada).toBe(true)
  })
  it('los tipos de cada criatura existen en las reglas', () => {
    const ids = reglas.tipos.map((t) => t.id)
    for (const c of criaturas) { expect(c.tipos.length, c.id).toBeGreaterThan(0); for (const t of c.tipos) expect(ids, c.id).toContain(t) }
  })
  it('«¿?» se muestra como ¿?', () => { expect(fmtNum(null)).toBe('¿?'); expect(fmtNum(1500)).toBe((1500).toLocaleString('es-ES')) })
  it('las criaturas con valores desconocidos tienen null, no 0', () => {
    const behemoth = criaturaPorId('behemoth-acronico')!
    expect(behemoth.ca).toBeNull(); expect(behemoth.px).toBeNull(); expect(behemoth.vitalidad).toBeNull()
  })
})

describe('filtros', () => {
  it('sin filtros devuelve todo', () => expect(filtrar(criaturas, FILTROS_VACIOS)).toHaveLength(450))
  it('busca por nombre ignorando tildes y mayúsculas', () => {
    const r = filtrar(criaturas, { ...FILTROS_VACIOS, q: 'ANGEL tersediano' })
    expect(r.map((c) => c.id)).toContain('angel-tersediano')
  })
  it('filtra por categoría y suma las de varias', () => {
    expect(filtrar(criaturas, { ...FILTROS_VACIOS, cats: [5] })).toHaveLength(10)
    expect(filtrar(criaturas, { ...FILTROS_VACIOS, cats: [4, 5] })).toHaveLength(50)
  })
  it('varios tipos exigen todos', () => {
    const r = filtrar(criaturas, { ...FILTROS_VACIOS, tipos: ['divinos', 'elementales'] })
    for (const c of r) { expect(c.tipos).toContain('divinos'); expect(c.tipos).toContain('elementales') }
  })
  it('rango de P.X. excluye las criaturas con «¿?»', () => {
    const r = filtrar(criaturas, { ...FILTROS_VACIOS, px: [0, null] })
    expect(r.every((c) => c.px != null)).toBe(true)
    expect(r.length).toBe(criaturas.filter((c) => c.px != null).length)
  })
  it('rango C.A. mín/máx', () => {
    const r = filtrar(criaturas, { ...FILTROS_VACIOS, ca: [3, 5] })
    expect(r.length).toBeGreaterThan(0)
    for (const c of r) { expect(c.ca).toBeGreaterThanOrEqual(3); expect(c.ca).toBeLessThanOrEqual(5) }
  })
  it('plano y alineamiento', () => {
    for (const c of filtrar(criaturas, { ...FILTROS_VACIOS, plano: 'infernal' })) expect(c.planos).toContain('infernal')
    for (const c of filtrar(criaturas, { ...FILTROS_VACIOS, ali: 'legal' })) expect(c.alineamiento_ejes).toContain('legal')
  })
  it('ordena por P.X. con los «¿?» siempre al final, en ambos sentidos', () => {
    for (const desc of [false, true]) {
      const r = filtrar(criaturas, { ...FILTROS_VACIOS, orden: 'px', desc })
      const px = r.map((c) => c.px)
      const primerNull = px.indexOf(null)
      expect(px.slice(primerNull).every((x) => x == null)).toBe(true)
      const conValor = px.slice(0, primerNull) as number[]
      for (let i = 1; i < conValor.length; i++) expect(desc ? conValor[i - 1] >= conValor[i] : conValor[i - 1] <= conValor[i]).toBe(true)
    }
  })
  it('la URL conserva los filtros (ida y vuelta)', () => {
    const f = { ...FILTROS_VACIOS, q: 'dragón', cats: [2, 3], tipos: ['bestias' as const], plano: 'terrenal', ali: 'caotico', px: [100, 5000] as [number, number], ca: [null, 6] as [null, number], orden: 'ca' as const, desc: true }
    expect(leerFiltros(aParams(f))).toEqual(f)
  })
  it('una URL manipulada no rompe: valores inválidos se ignoran', () => {
    const f = leerFiltros(new URLSearchParams('cats=9,x,2&tipos=dragon,bestias&plano=xx&ali=zz&pxmin=abc&orden=hack'))
    expect(f.cats).toEqual([2]); expect(f.tipos).toEqual(['bestias']); expect(f.plano).toBe('')
    expect(f.ali).toBe(''); expect(f.px).toEqual([null, null]); expect(f.orden).toBe('nombre')
  })
})

describe('tirada de daño', () => {
  it('2 grupos de dados: respeta caras y suma el total', () => {
    const c = criaturas.find((x) => x.dano.dados.length > 1)!
    for (let n = 0; n < 200; n++) {
      const t = tirarDano(c)!
      expect(t.partes).toHaveLength(c.dano.dados.length)
      t.partes.forEach((p, i) => {
        expect(p.resultados).toHaveLength(c.dano.dados[i].cantidad)
        p.resultados.forEach((r) => { expect(r).toBeGreaterThanOrEqual(1); expect(r).toBeLessThanOrEqual(p.caras) })
      })
      expect(t.total).toBeGreaterThanOrEqual(t.partes.reduce((s, p) => s + p.resultados.length, 0))
      expect(t.total).toBeLessThanOrEqual(c.dano.maximo!)
    }
  })
  it('extremos con rng fijo: mínimo y máximo', () => {
    const c = criaturaPorId('acechador-invisible')! // 1D8
    expect(tirarDano(c, () => 0)!.total).toBe(1)
    expect(tirarDano(c, () => 0.999999)!.total).toBe(8)
  })
  it('sin dados (¿?) devuelve null', () => {
    const sin = criaturas.filter((c) => c.dano.dados.length === 0)
    expect(sin.length).toBeGreaterThan(0)
    for (const c of sin) expect(tirarDano(c)).toBeNull()
  })
  it('el máximo del libro es coherente con los dados', () => {
    for (const c of criaturas) if (c.dano.dados.length && c.dano.maximo != null) {
      expect(c.dano.dados.reduce((s, d) => s + d.cantidad * d.caras, 0), c.id).toBe(c.dano.maximo)
    }
  })
})

describe('generador de encuentros', () => {
  const pool = criaturas.filter((c) => c.categoria === 1)
  it('n criaturas distintas de la categoría pedida', () => {
    for (let i = 0; i < 100; i++) {
      const r = generarEncuentro(pool, 6)
      expect(r).toHaveLength(6)
      expect(new Set(r.map((c) => c.id)).size).toBe(6)
      r.forEach((c) => expect(c.categoria).toBe(1))
    }
  })
  it('pide más que las disponibles: devuelve las que hay; con repetidas llega al número', () => {
    const poco = pool.slice(0, 3)
    expect(generarEncuentro(poco, 5)).toHaveLength(3)
    expect(generarEncuentro(poco, 5, { repetir: true })).toHaveLength(5)
  })
  it('las fijadas se conservan y no se repiten', () => {
    const fija = pool[0]
    for (let i = 0; i < 50; i++) {
      const r = generarEncuentro(pool, 4, { fijas: [null, fija, null, null] })
      expect(r[1]).toBe(fija)
      expect(r.filter((c) => c.id === fija.id)).toHaveLength(1)
    }
  })
  it('rng determinista', () => {
    expect(generarEncuentro(pool, 2, { rng: secuencia(0, 0) }).map((c) => c.id)).toEqual([pool[0].id, pool[1].id])
  })
  it('suma de P.X. aparte de los «¿?»', () => {
    const a = criaturaPorId('acechador-invisible')!, b = criaturaPorId('behemoth-acronico')!
    expect(sumaPx([a, a, b])).toEqual({ total: 1500, desconocidos: 1 })
  })
})

describe('combate', () => {
  beforeEach(() => localStorage.clear())
  const a = criaturaPorId('acechador-invisible')!
  it('numera las criaturas repetidas, también al añadir a un combate existente', () => {
    const c1 = nuevosCombatientes([], [a, a])
    expect(c1.map((c) => c.nombre)).toEqual(['Acechador Invisible 1', 'Acechador Invisible 2'])
    const c2 = nuevosCombatientes(c1, [a])
    expect(c2[0].nombre).toBe('Acechador Invisible 3')
    expect(nuevosCombatientes([], [a])[0].nombre).toBe('Acechador Invisible')
  })
  it('añadir una criatura igual renombra la primera a «1» y no deja huecos', () => {
    const uno = añadirCombatientes([], [a])
    expect(uno.map((c) => c.nombre)).toEqual(['Acechador Invisible'])
    const dos = añadirCombatientes(uno, [a])
    expect(dos.map((c) => c.nombre)).toEqual(['Acechador Invisible 1', 'Acechador Invisible 2'])
    expect(dos[0].uid).toBe(uno[0].uid)
    const tres = añadirCombatientes(dos, [a])
    expect(tres.map((c) => c.nombre)).toEqual(['Acechador Invisible 1', 'Acechador Invisible 2', 'Acechador Invisible 3'])
    const otra = criaturaPorId('behemoth-acronico')!
    expect(añadirCombatientes(uno, [otra]).map((c) => c.nombre)).toEqual(['Acechador Invisible', 'Behemoth Acrónico'])
  })
  it('copia vitalidad, C.A., movimiento y alcance', () => {
    const [c] = nuevosCombatientes([], [a])
    expect([c.vida, c.vidaMax, c.ca, c.movimiento, c.alcance]).toEqual([25, 25, 9, 6, 1])
  })
  it('daño y curación respetan 0 y el máximo', () => {
    const [c] = nuevosCombatientes([], [a])
    expect(aplicarDano(c, 10).vida).toBe(15)
    expect(aplicarDano(c, 999).vida).toBe(0)
    expect(aplicarDano(aplicarDano(c, 10), -999).vida).toBe(25)
  })
  it('vitalidad «¿?»: sin máximo, se puede ajustar a mano', () => {
    const b = criaturaPorId('behemoth-acronico')!
    const [c] = nuevosCombatientes([], [b])
    expect(c.vidaMax).toBeNull()
    expect(aplicarDano({ ...c, vida: 50 }, 20).vida).toBe(30)
    expect(aplicarDano({ ...c, vida: 50 }, -20).vida).toBe(70)
  })
  it('persistencia y datos corruptos', () => {
    const l = nuevosCombatientes([], [a, a])
    guardarCombate(l)
    expect(leerCombate()).toEqual(l)
    localStorage.setItem('terratea-combate', '{roto')
    expect(leerCombate()).toEqual([])
    localStorage.setItem('terratea-combate', JSON.stringify([{ uid: 1 }, null, 5, { uid: 'x', criaturaId: 'y', nombre: 'z', vida: 3, vidaMax: 'a' }]))
    expect(leerCombate()).toEqual([{ uid: 'x', criaturaId: 'y', nombre: 'z', vida: 3, vidaMax: null, ca: null, movimiento: null, alcance: null }])
  })
})
