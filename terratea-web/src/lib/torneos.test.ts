import { describe, expect, it } from 'vitest'
import {
  alternarJugador, asignarEquipo, campeon, disponer, elegirGanador, esTarjeta, ganadorDe, generarCuadro,
  mapaNodos, nuevoEquipo, torneoNuevo, conCuadro, type Torneo,
} from './torneos'

const ids = (n: number) => Array.from({ length: n }, (_, i) => `e${i + 1}`)
const torneo = (n: number): Torneo => {
  const t = torneoNuevo('T', '1v1')
  t.equipos = ids(n).map((id) => ({ ...nuevoEquipo(id, null), id }))
  return conCuadro(t)
}

describe('generarCuadro', () => {
  it('8 equipos: sin clasificatoria, 4 tarjetas → semis → final', () => {
    const { columnas, nodos } = generarCuadro(ids(8))
    expect(columnas).toEqual(['Ronda 1', 'Semifinales', 'Final'])
    expect(nodos.filter(esTarjeta)).toHaveLength(4)
  })
  it('19 equipos: clasificatoria con 2 plazas, todos colocados y un «Sin rival»', () => {
    const { columnas, nodos } = generarCuadro(ids(19))
    expect(columnas).toEqual(['Clasificatoria', 'Ronda 1', 'Cuartos', 'Semifinales', 'Final'])
    const puestos = nodos.filter(esTarjeta).flatMap((n) => n.equipos!)
    expect(puestos.filter((x) => x != null).sort()).toEqual(ids(19).sort())
    expect(puestos.filter((x) => x == null)).toHaveLength(1)
    expect(nodos.filter((n) => n.columna === 1 && n.fuentes.length === 2)).toHaveLength(2)
  })
  it('2 y 3 equipos no rompen el cuadro', () => {
    expect(generarCuadro(ids(2)).columnas).toEqual(['Final'])
    expect(generarCuadro(ids(3)).columnas).toEqual(['Clasificatoria', 'Final'])
    expect(generarCuadro(ids(1)).nodos).toEqual([])
  })
})

describe('resultados', () => {
  it('el ganador avanza y el campeón sale del último nodo', () => {
    let t = torneo(4) // r1-1 (e1,e2) r1-2 (e3,e4) → final
    const m0 = mapaNodos(t)
    expect(ganadorDe(m0, 'n1-1')).toBeNull()
    t = elegirGanador(t, 'r1-1', 'e2')
    t = elegirGanador(t, 'r1-2', 'e3')
    t = elegirGanador(t, 'n1-1', 'e3')
    expect(campeon(t)).toBe('e3')
  })
  it('pulsar otra vez desmarca; un ganador que ya no llega deja de valer', () => {
    let t = torneo(4)
    t = elegirGanador(t, 'r1-1', 'e1')
    t = elegirGanador(t, 'r1-2', 'e3')
    t = elegirGanador(t, 'n1-1', 'e1')
    t = elegirGanador(t, 'r1-1', 'e1') // desmarcar
    expect(campeon(t)).toBeNull()
  })
  it('«Sin rival»: el otro equipo pasa solo', () => {
    const t = torneo(3) // e3 espera en la clasificatoria con un hueco libre
    const m = mapaNodos(t)
    expect(ganadorDe(m, 'c2')).toBe('e3')
  })
})

describe('asignarEquipo', () => {
  it('intercambia si el equipo ya estaba en otra posición', () => {
    const t = asignarEquipo(torneo(4), 'r1-1', 0, 'e3')
    const m = mapaNodos(t)
    expect(m.get('r1-1')!.equipos).toEqual(['e3', 'e2'])
    expect(m.get('r1-2')!.equipos).toEqual(['e1', 'e4'])
  })
})

describe('alternarJugador', () => {
  const e = nuevoEquipo('A', 1)
  it('1v1 sustituye, 3v3 limita a tres, estrategia no limita', () => {
    const j = (id: number) => ({ id, nombre: `J${id}` })
    expect(alternarJugador(alternarJugador(e, j(1), '1v1'), j(2), '1v1').jugadores).toEqual([j(2)])
    let t = e
    for (let i = 1; i <= 5; i++) t = alternarJugador(t, j(i), '3v3')
    expect(t.jugadores).toHaveLength(3)
    let s = e
    for (let i = 1; i <= 5; i++) s = alternarJugador(s, j(i), 'estrategia')
    expect(s.jugadores).toHaveLength(5)
  })
})

describe('disponer', () => {
  it('coloca todos los nodos sin solaparse en su columna', () => {
    const t = torneo(19)
    const { cajas } = disponer(t)
    expect(cajas.size).toBe(t.nodos.length)
    for (let col = 0; col < t.columnas.length; col++) {
      const c = t.nodos.filter((n) => n.columna === col).map((n) => cajas.get(n.id)!).sort((a, b) => a.y - b.y)
      for (let i = 1; i < c.length; i++) expect(c[i].y).toBeGreaterThanOrEqual(c[i - 1].y + c[i - 1].alto)
      for (const x of c) expect(x.y).toBeGreaterThanOrEqual(0)
    }
  })
})
