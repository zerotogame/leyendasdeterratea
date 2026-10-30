import { afterEach, describe, expect, it, vi } from 'vitest'
import { aplicarPremio, cantidad, hayPremio, pxDerrotados, trocear } from './recompensa'
import { nuevosCombatientes, type Combatiente } from './combate'
import { criaturaPorId } from './bestiario'

afterEach(() => vi.unstubAllGlobals())

describe('recompensa', () => {
  it('trocea la experiencia en llamadas de 10 000 como máximo', () => {
    expect(trocear(750)).toEqual([750])
    expect(trocear(10000)).toEqual([10000])
    expect(trocear(25000)).toEqual([10000, 10000, 5000])
    expect(trocear(0)).toEqual([])
  })
  it('cantidad: enteros no negativos', () => {
    expect([cantidad(''), cantidad('12'), cantidad('-3'), cantidad('4.9'), cantidad('x')]).toEqual([0, 12, 0, 4, 0])
    expect(hayPremio({ exp: 0, oro: 0, plata: 0, cobre: 0 })).toBe(false)
    expect(hayPremio({ exp: 0, oro: 0, plata: 1, cobre: 0 })).toBe(true)
  })
  it('suma el P.X. del bestiario solo de enemigos a 0 de vida', () => {
    const a = criaturaPorId('acechador-invisible')!
    const [x, y] = nuevosCombatientes([], [a, a])
    const l: Combatiente[] = [{ ...x, vida: 0 }, y, { ...y, uid: 'j', criaturaId: '', bando: 'jugador', vida: 0 }]
    expect(pxDerrotados(l)).toEqual({ total: 750, desconocidos: 0 })
  })
  it('aplica experiencia por tramos y luego suma monedas a las que tenía', async () => {
    const llamadas: { url: string; body: unknown }[] = []
    const ficha = { id: 4, level: 11, gold: 169, silver: 8, copper: 4, levels_gained: 1 }
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      llamadas.push({ url, body: init?.body ? JSON.parse(init.body as string) : null })
      return { ok: true, status: 200, json: async () => ficha }
    }))
    const r = await aplicarPremio(4, { exp: 12000, oro: 5, plata: 0, cobre: 2 })
    expect(r.niveles).toBe(2)
    expect(llamadas.map((l) => l.url.replace(/^.*\/characters/, ''))).toEqual(['/4/experience', '/4/experience', '/4', '/4'])
    expect(llamadas[0].body).toEqual({ amount: 10000 })
    expect(llamadas[1].body).toEqual({ amount: 2000 })
    expect(llamadas[3].body).toEqual({ gold: 174, silver: 8, copper: 6 })
  })
})
